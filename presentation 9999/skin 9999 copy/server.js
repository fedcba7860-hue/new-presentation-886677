// Skin Decode server - Node 22+ (uses built-in SQLite, no native npm database package)
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = Number(process.env.PORT || 3000);
// Use DATABASE_PATH when configured. On Render, mount a persistent disk at /var/data
// and the database will survive deploys/restarts. Locally, keep the database beside server.js.
const bundledDbPath = path.join(__dirname, 'skin-decode.db');
const renderDiskPath = '/var/data/skin-decode.db';
const dbPath = process.env.DATABASE_PATH
  || (process.env.RENDER && fs.existsSync('/var/data') ? renderDiskPath : bundledDbPath);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
// Seed a newly mounted persistent disk from the bundled database once, preserving included records.
if (dbPath !== bundledDbPath && !fs.existsSync(dbPath) && fs.existsSync(bundledDbPath)) {
  fs.copyFileSync(bundledDbPath, dbPath);
}
const db = new DatabaseSync(dbPath);

db.exec(`PRAGMA foreign_keys = ON;`);
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS skin_scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  skin_type TEXT,
  concern TEXT,
  sensitivity TEXT,
  ingredients_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS saved_ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  ingredient_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, ingredient_name),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS saved_routines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  routine_name TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  origin TEXT NOT NULL,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  concerns TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  image TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

function columns(table) {
  return db.prepare(`PRAGMA table_info(${table})`).all().map(x => x.name);
}
function addColumn(table, name, definition) {
  if (!columns(table).includes(name)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);
}
// Safe migration from the original assignment database.
addColumn('users', 'password_hash', "TEXT NOT NULL DEFAULT ''");
addColumn('users', 'created_at', 'TEXT');
db.exec("UPDATE users SET created_at=CURRENT_TIMESTAMP WHERE created_at IS NULL OR created_at=''");
addColumn('skin_scans', 'ingredients_json', "TEXT NOT NULL DEFAULT '[]'");
addColumn('skin_scans', 'created_at', 'TEXT');
db.exec("UPDATE skin_scans SET created_at=CURRENT_TIMESTAMP WHERE created_at IS NULL OR created_at=''");

function syncProducts() {
  const file = path.join(__dirname, 'products.json');
  try {
    const products = JSON.parse(fs.readFileSync(file, 'utf8'));
    const keep = new Set(products.map(p => `${p.brand}\u0000${p.name}`));
    const rows = db.prepare('SELECT id,brand,name FROM products').all();
    const del = db.prepare('DELETE FROM products WHERE id=?');
    for (const r of rows) {
      if (!keep.has(`${r.brand}\u0000${r.name}`)) del.run(r.id);
    }
    const find = db.prepare('SELECT id FROM products WHERE brand=? AND name=?');
    const insert = db.prepare('INSERT INTO products(origin,brand,name,type,concerns,note,image) VALUES(?,?,?,?,?,?,?)');
    const update = db.prepare('UPDATE products SET origin=?,type=?,concerns=?,note=?,image=? WHERE id=?');
    for (const p of products) {
      const existing = find.get(p.brand, p.name);
      const vals = [p.origin, p.type, (p.c || []).join(' '), p.note || '', p.image || null];
      if (existing) update.run(...vals, existing.id);
      else insert.run(p.origin, p.brand, p.name, ...vals.slice(1));
    }
  } catch (e) {
    console.error('Product sync skipped:', e.message);
  }
}
syncProducts();

function loadEnv() {
  try {
    const p = path.join(__dirname, '.env');
    fs.readFileSync(p, 'utf8').split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    });
  } catch {}
}
loadEnv();
const KEY = process.env.ANTHROPIC_API_KEY || '';
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5-5';

const sessions = new Map();
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
function token() { return crypto.randomBytes(32).toString('hex'); }
function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}
function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [saltHex, hashHex] = stored.split(':');
  try {
    const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), 64);
    const expected = Buffer.from(hashHex, 'hex');
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  } catch { return false; }
}
function cookieValue(req, name) {
  const raw = req.headers.cookie || '';
  const part = raw.split(';').map(x => x.trim()).find(x => x.startsWith(name + '='));
  return part ? decodeURIComponent(part.slice(name.length + 1)) : '';
}
function currentUser(req) {
  const t = cookieValue(req, 'sd_session');
  if (!t) return null;
  const s = sessions.get(t);
  if (!s || s.expires < Date.now()) { sessions.delete(t); return null; }
  const user = db.prepare('SELECT id,name,email,created_at FROM users WHERE id=?').get(s.userId);
  return user || null;
}
function setSession(res, userId) {
  const t = token();
  sessions.set(t, { userId, expires: Date.now() + SESSION_MS });
  res.setHeader('Set-Cookie', `sd_session=${encodeURIComponent(t)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${Math.floor(SESSION_MS/1000)}`);
}
function clearSession(req, res) {
  const t = cookieValue(req, 'sd_session');
  if (t) sessions.delete(t);
  res.setHeader('Set-Cookie', 'sd_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0');
}

function send(res, status, data, extraHeaders={}) {
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...extraHeaders});
  res.end(JSON.stringify(data));
}
async function body(req, limit=50000) {
  let raw='';
  for await (const chunk of req) { raw += chunk; if (raw.length > limit) throw new Error('too_large'); }
  try { return JSON.parse(raw || '{}'); } catch { throw new Error('bad_json'); }
}
function requireUser(req,res) {
  const u = currentUser(req);
  if (!u) { send(res,401,{error:'unauthorized'}); return null; }
  return u;
}

const SYSTEM = `You are Skin AI, the skincare assistant on the Skin Decode website. Tagline: "Because your skin deserves better." Help with product suggestions, morning/night routines and skincare ingredients. Be warm, clear and concise. Give educational guidance, never diagnose, recommend patch testing, sunscreen in the morning, and dermatologist care for severe/persistent problems.`;
const hits = new Map();
function limited(ip) {
  const now=Date.now(), arr=(hits.get(ip)||[]).filter(t=>now-t<60000); arr.push(now); hits.set(ip,arr); return arr.length>20;
}
async function chat(req,res) {
  if (!KEY) return send(res,503,{error:'no_key'});
  if (limited(req.socket.remoteAddress||'unknown')) return send(res,429,{error:'slow_down'});
  let data; try { data=await body(req,20000); } catch(e) { return send(res,e.message==='too_large'?413:400,{error:e.message}); }
  let messages=Array.isArray(data.messages)?data.messages:[];
  messages=messages.filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string'&&m.content.trim()).slice(-12).map(m=>({role:m.role,content:m.content.slice(0,1500)}));
  while(messages.length&&messages[0].role!=='user')messages.shift();
  if(!messages.length||messages[messages.length-1].role!=='user')return send(res,400,{error:'no_message'});
  const profile=data.profile&&typeof data.profile==='object'?data.profile:null;
  const system=SYSTEM+(profile?`\nUser profile: ${JSON.stringify(profile).slice(0,2000)}`:'');
  try {
    const response=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':KEY,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:MODEL,max_tokens:800,system,messages})});
    const json=await response.json();
    if(!response.ok)return send(res,502,{error:'upstream'});
    const reply=(json.content||[]).filter(x=>x.type==='text').map(x=>x.text).join('\n').trim();
    return send(res,200,{reply});
  } catch { return send(res,502,{error:'upstream'}); }
}

const TYPES={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon'};
function serve(req,res){
  let p=decodeURIComponent(req.url.split('?')[0]); if(p==='/')p='/index.html';
  const file=path.resolve(__dirname,'.'+path.normalize(p));
  if(!file.startsWith(path.resolve(__dirname)+path.sep))return send(res,404,{error:'not_found'});
  const type=TYPES[path.extname(file).toLowerCase()]; if(!type)return send(res,404,{error:'not_found'});
  fs.readFile(file,(err,data)=>{if(err)return send(res,404,{error:'not_found'});res.writeHead(200,{'Content-Type':type,'X-Content-Type-Options':'nosniff'});res.end(data);});
}

const server=http.createServer(async (req,res)=>{
  try {
    if(req.method==='POST'&&req.url==='/api/auth/signup'){
      const d=await body(req,10000); const name=String(d.name||'').trim().slice(0,80),email=String(d.email||'').trim().toLowerCase().slice(0,160),password=String(d.password||'');
      if(name.length<2||!email.includes('@')||password.length<6)return send(res,400,{error:'invalid_input'});
      if(db.prepare('SELECT id FROM users WHERE email=?').get(email))return send(res,409,{error:'email_exists'});
      const r=db.prepare('INSERT INTO users(name,email,password_hash) VALUES(?,?,?)').run(name,email,hashPassword(password)); setSession(res,Number(r.lastInsertRowid)); return send(res,201,{user:{id:Number(r.lastInsertRowid),name,email}});
    }
    if(req.method==='POST'&&req.url==='/api/auth/login'){
      const d=await body(req,10000); const email=String(d.email||'').trim().toLowerCase(),password=String(d.password||''); const u=db.prepare('SELECT * FROM users WHERE email=?').get(email);
      if(!u||!verifyPassword(password,u.password_hash))return send(res,401,{error:'invalid_credentials'}); setSession(res,u.id); return send(res,200,{user:{id:u.id,name:u.name,email:u.email}});
    }
    if(req.method==='POST'&&req.url==='/api/auth/logout'){clearSession(req,res);return send(res,200,{ok:true});}
    if(req.method==='GET'&&req.url==='/api/auth/me'){
      const u=currentUser(req); if(!u)return send(res,200,{user:null,profile:null,saved:[]});
      const scan=db.prepare('SELECT skin_type AS type, concern, sensitivity AS sens, ingredients_json AS ingredients FROM skin_scans WHERE user_id=? ORDER BY id DESC LIMIT 1').get(u.id);
      const saved=db.prepare('SELECT ingredient_name FROM saved_ingredients WHERE user_id=? ORDER BY id DESC').all(u.id).map(x=>x.ingredient_name);
      return send(res,200,{user:u,profile:scan?{...scan,ingredients:JSON.parse(scan.ingredients||'[]')}:null,saved});
    }
    if(req.method==='POST'&&req.url==='/api/scan'){
      const u=requireUser(req,res);if(!u)return;const d=await body(req,10000);const ingredients=Array.isArray(d.ingredients)?d.ingredients.slice(0,20).map(String):[];
      db.prepare('INSERT INTO skin_scans(user_id,skin_type,concern,sensitivity,ingredients_json) VALUES(?,?,?,?,?)').run(u.id,String(d.type||''),String(d.concern||''),String(d.sens||''),JSON.stringify(ingredients));return send(res,201,{ok:true});
    }
    if(req.method==='POST'&&req.url==='/api/saved/toggle'){
      const u=requireUser(req,res);if(!u)return;const d=await body(req,5000),name=String(d.name||'').trim().slice(0,120);if(!name)return send(res,400,{error:'invalid_input'});
      const found=db.prepare('SELECT id FROM saved_ingredients WHERE user_id=? AND ingredient_name=?').get(u.id,name);if(found)db.prepare('DELETE FROM saved_ingredients WHERE id=?').run(found.id);else db.prepare('INSERT INTO saved_ingredients(user_id,ingredient_name) VALUES(?,?)').run(u.id,name);return send(res,200,{saved:!found});
    }
    if(req.method==='GET'&&req.url==='/api/database'){
      const u=requireUser(req,res);if(!u)return;return send(res,200,{users:db.prepare('SELECT id,name,email,created_at FROM users WHERE id=?').all(u.id),skin_scans:db.prepare('SELECT * FROM skin_scans WHERE user_id=?').all(u.id),saved_ingredients:db.prepare('SELECT * FROM saved_ingredients WHERE user_id=?').all(u.id),saved_routines:db.prepare('SELECT * FROM saved_routines WHERE user_id=?').all(u.id)});
    }
    if(req.method==='GET'&&req.url==='/api/products'){
      return send(res,200,{products:db.prepare('SELECT * FROM products ORDER BY id').all()});
    }
    if(req.method==='GET'&&req.url==='/api/status')return send(res,200,{ai:!!KEY,database:true});
    if(req.method==='POST'&&req.url==='/api/chat')return await chat(req,res);
    if(req.method==='GET')return serve(req,res);
    return send(res,405,{error:'method'});
  } catch(e) { console.error(e); return send(res,500,{error:'server_error'}); }
});

server.listen(PORT,()=>console.log(`Skin Decode running on http://localhost:${PORT} | SQLite: built-in | AI: ${KEY?'on':'fallback'}`));
process.on('SIGINT',()=>{try{db.close()}finally{process.exit(0)}});
process.on('SIGTERM',()=>{try{db.close()}finally{process.exit(0)}});
