function escapeHtml(value){
  return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}

const INGREDIENTS=[
{name:"Niacinamide",cat:"Barrier",tags:["Oil control","Barrier","Uneven tone"],desc:"A form of vitamin B3 commonly used to support the skin barrier and improve the appearance of uneven tone.",uses:["Supports the skin barrier","Helps manage excess oil","Can improve the appearance of uneven tone"]},
{name:"Salicylic Acid",cat:"Acne",tags:["Acne","Pores","Exfoliating"],desc:"A beta hydroxy acid commonly used to exfoliate inside pores and help with clogged pores.",uses:["Helps unclog pores","Commonly used for acne-prone skin","Helps remove dead skin cells"]},
{name:"Hyaluronic Acid",cat:"Hydrating",tags:["Hydration","Dryness"],desc:"A humectant that helps attract and retain water in the skin.",uses:["Supports hydration","Helps skin feel softer","Useful in hydration-focused routines"]},
{name:"Azelaic Acid",cat:"Brightening",tags:["Acne","Uneven tone","Redness"],desc:"An ingredient commonly used for acne-prone skin and the appearance of uneven skin tone.",uses:["Commonly used for blemish-prone skin","Helps improve uneven-looking tone","Can be used in routines focused on redness"]},
{name:"Vitamin C",cat:"Brightening",tags:["Antioxidant","Brightening"],desc:"An antioxidant commonly included in skincare aimed at improving the appearance of dull or uneven skin.",uses:["Antioxidant support","Brightening-focused routines","Helps improve the look of uneven tone"]},
{name:"Ceramides",cat:"Barrier",tags:["Barrier","Dryness"],desc:"Lipids naturally found in the skin that help support the skin barrier.",uses:["Supports the skin barrier","Useful for dryness-focused routines","Helps reduce moisture loss"]},
{name:"Panthenol",cat:"Soothing",tags:["Soothing","Hydration"],desc:"A provitamin B5 ingredient commonly used for moisturizing and soothing properties.",uses:["Supports hydration","Soothing-focused skincare","Helps skin feel comfortable"]},
{name:"Glycerin",cat:"Hydrating",tags:["Hydration","Humectant"],desc:"A humectant that attracts water and is widely used in moisturizing formulations.",uses:["Helps attract moisture","Supports hydration","Common in moisturizers and cleansers"]}
];

function user(){return JSON.parse(localStorage.getItem("sdUser")||"null")}
function updateNav(){let u=user(),name=document.getElementById("navName");if(name)name.textContent=u?u.name:""}
function showLogin(){document.getElementById("loginForm").classList.remove("hidden");document.getElementById("signupForm").classList.add("hidden");document.querySelectorAll(".tab")[0].classList.add("active");document.querySelectorAll(".tab")[1].classList.remove("active")}
function showSignup(){document.getElementById("loginForm").classList.add("hidden");document.getElementById("signupForm").classList.remove("hidden");document.querySelectorAll(".tab")[1].classList.add("active");document.querySelectorAll(".tab")[0].classList.remove("active")}
function signup(e){e.preventDefault();let name=signupName.value.trim(),email=signupEmail.value.trim(),password=signupPassword.value;localStorage.setItem("sdUser",JSON.stringify({name,email,password}));location.href="home.html"}
function login(e){e.preventDefault();let email=loginEmail.value.trim(),password=loginPassword.value;let saved=JSON.parse(localStorage.getItem("sdUser")||"null");if(saved&&saved.email===email&&saved.password===password){location.href="home.html"}else{localStorage.setItem("sdUser",JSON.stringify({name:email.split("@")[0],email,password}));location.href="home.html"}}
function logout(){localStorage.removeItem("sdUser");location.href="index.html"}
function calculateResults(e){e.preventDefault();let type=document.querySelector('input[name="skinType"]:checked').value,concern=document.querySelector('input[name="concern"]:checked').value,sens=document.querySelector('input[name="sensitivity"]:checked').value;let map={Acne:["Salicylic Acid","Niacinamide","Azelaic Acid"],Pigmentation:["Vitamin C","Azelaic Acid","Niacinamide"],Dryness:["Hyaluronic Acid","Ceramides","Glycerin"],Dullness:["Vitamin C","Niacinamide"],Oiliness:["Niacinamide","Salicylic Acid"],Redness:["Panthenol","Ceramides","Azelaic Acid"],Blackheads:["Salicylic Acid","Niacinamide"]};let names=map[concern]||[];localStorage.setItem("sdProfile",JSON.stringify({type,concern,sens,ingredients:names}));document.getElementById("progressBar").style.width="100%";let html=`<section class="result"><div class="result-head"><span class="eyebrow">YOUR DECODED PROFILE</span><h2>${type} skin · ${concern}</h2><p>Based on your answers, these ingredients are relevant to explore. This is educational guidance, not a diagnosis.</p></div><div class="match-grid">`;names.forEach(n=>{let x=INGREDIENTS.find(i=>i.name===n);html+=`<article class="match"><span class="pill">${x?.cat||"Ingredient"}</span><h3>${n}</h3><p>${x?.desc||""}</p><button class="secondary" onclick="openIngredient('${n}')">Learn more</button></article>`});html+=`</div><a class="primary" style="margin-top:20px" href="profile.html">Save & view my profile →</a></section>`;document.getElementById("quizResult").innerHTML=html;window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"})}
function renderIngredients(){let grid=document.getElementById("ingredientGrid");if(!grid)return;grid.innerHTML=INGREDIENTS.map(x=>`<article class="ingredient-card" data-cat="${x.cat}" data-name="${x.name.toLowerCase()}"><span class="pill">${x.cat}</span><h3>${x.name}</h3><p>${x.desc}</p><button onclick="openIngredient('${x.name}')">Explore ingredient →</button></article>`).join("")}
function filterIngredients(){let q=(document.getElementById("ingredientSearch").value||"").toLowerCase(),cat=document.getElementById("categoryFilter").value;document.querySelectorAll(".ingredient-card").forEach(c=>{c.style.display=((c.dataset.name.includes(q)||c.textContent.toLowerCase().includes(q))&&(cat==="All"||c.dataset.cat===cat))?"block":"none"})}
function openIngredient(name){localStorage.setItem("selectedIngredient",name);location.href="ingredient-details.html"}
function renderDetail(){let el=document.getElementById("ingredientDetail");if(!el)return;let name=localStorage.getItem("selectedIngredient")||"Niacinamide",x=INGREDIENTS.find(i=>i.name===name)||INGREDIENTS[0],saved=JSON.parse(localStorage.getItem("sdSaved")||"[]"),is=saved.includes(x.name);el.innerHTML=`<section class="detail-hero"><span class="eyebrow">${x.cat.toUpperCase()}</span><h1>${x.name}</h1><p>${x.desc}</p><button class="primary" onclick="toggleSave('${x.name}')">${is?"♥ Saved":"♡ Save ingredient"}</button></section><div class="detail-grid"><div class="detail-box"><h3>Common uses</h3><ul>${x.uses.map(u=>`<li>${u}</li>`).join("")}</ul></div><div class="detail-box"><h3>Good to know</h3><p>Suitability depends on the individual. Concentration, formulation, frequency and other routine steps can affect how an ingredient feels on skin.</p></div></div>`}
function toggleSave(name){let a=JSON.parse(localStorage.getItem("sdSaved")||"[]");a=a.includes(name)?a.filter(x=>x!==name):[...a,name];localStorage.setItem("sdSaved",JSON.stringify(a));renderDetail();renderProfile()}
function renderProfile(){let u=user(),p=JSON.parse(localStorage.getItem("sdProfile")||"null"),name=document.getElementById("profileName"),email=document.getElementById("profileEmail"),avatar=document.getElementById("avatar"),box=document.getElementById("skinProfileCard"),list=document.getElementById("savedList");if(!name)return;if(u){name.textContent=u.name;email.textContent=u.email;avatar.textContent=u.name.charAt(0).toUpperCase()}if(p)box.innerHTML=`<div><span>Skin type</span><b>${p.type}</b></div><div><span>Main concern</span><b>${p.concern}</b></div><div><span>Sensitivity</span><b>${p.sens}</b></div><div><span>Matched ingredients</span><b>${p.ingredients.length}</b></div>`;else box.innerHTML="<p class='muted'>Complete your Skin Scan to create your profile.</p>";let a=JSON.parse(localStorage.getItem("sdSaved")||"[]");list.innerHTML=a.length?a.map(x=>`<div class="saved-item"><span>♡ ${x}</span><button onclick="toggleSave('${x}')">Remove</button></div>`).join(""):"<p class='muted'>No saved ingredients yet.</p>"}
function init(){updateNav();let path=location.pathname;if(document.getElementById("welcomeName")){let u=user();document.getElementById("welcomeName").textContent=u?u.name.split(" ")[0]:"there"}if(document.getElementById("ingredientGrid"))renderIngredients();if(document.getElementById("ingredientDetail"))renderDetail();if(document.getElementById("profileName"))renderProfile();if(document.getElementById("progressBar"))setTimeout(()=>document.getElementById("progressBar").style.width="33%",100)}

/* ===== Brand: magnifying glass replaces the O in DECODE ===== */
const MAG='<svg class="mag" viewBox="0 0 24 24" role="img" aria-label="O"><circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M6.8 8a3.6 3.6 0 0 1 2.6-2.1" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".8"/><path d="M15 15l6 6" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll(".brand").forEach(b=>{b.innerHTML='SKIN <span>DEC'+MAG+'DE</span>'});initChat()});

/* ===== Skin AI chatbot (runs in the browser, no server needed) ===== */
const EXTRA=[
{name:"Retinol",cat:"Renewal",desc:"A vitamin A derivative used for fine lines, uneven texture and acne-prone skin.",tip:"Start 2 nights a week, at night only, and always wear sunscreen the next day. Avoid during pregnancy."},
{name:"Sunscreen",cat:"Protection",desc:"Daily SPF 30+ broad-spectrum protection is the single most useful step for preventing dark spots and early ageing.",tip:"Use about two finger-lengths for face and neck, and reapply every 2 hours in sun."},
{name:"Glycolic Acid",cat:"Exfoliating",desc:"An AHA that smooths surface texture and dullness.",tip:"Use 1–2 nights a week and skip it on the same night as retinol."},
{name:"Lactic Acid",cat:"Exfoliating",desc:"A gentler AHA that exfoliates while also hydrating.",tip:"A good first AHA for dry or sensitive skin."},
{name:"Peptides",cat:"Anti-ageing",desc:"Short amino-acid chains used in routines aimed at firmness and the look of fine lines.",tip:"Pair with a moisturiser; they are gentle and suit most skin types."}];
const CHAT_INFO=[...INGREDIENTS,...EXTRA];
const TYPES=["oily","dry","combination","sensitive","normal"];
const CONCERNS={
acne:{label:"acne & breakouts",ings:["Salicylic Acid","Niacinamide","Azelaic Acid"],prods:["Gel or foaming cleanser with salicylic acid (BHA)","Lightweight niacinamide serum","Oil-free gel moisturiser","Non-comedogenic SPF"]},
oily:{label:"oily skin",ings:["Niacinamide","Salicylic Acid"],prods:["Gel cleanser","Niacinamide serum","Oil-free gel moisturiser","Matte or fluid sunscreen"]},
dry:{label:"dryness",ings:["Hyaluronic Acid","Ceramides","Glycerin"],prods:["Cream or milk cleanser","Hyaluronic acid serum on damp skin","Ceramide moisturiser","Hydrating sunscreen"]},
pigment:{label:"dark spots & uneven tone",ings:["Vitamin C","Azelaic Acid","Niacinamide"],prods:["Vitamin C serum (morning)","Azelaic acid or niacinamide serum","Broad-spectrum SPF 30+ (essential)"]},
dull:{label:"dullness",ings:["Vitamin C","Niacinamide","Lactic Acid"],prods:["Vitamin C serum","Gentle AHA exfoliant 1–2×/week","Hydrating moisturiser"]},
redness:{label:"redness & sensitivity",ings:["Panthenol","Ceramides","Azelaic Acid"],prods:["Fragrance-free creamy cleanser","Panthenol or ceramide barrier cream","Mineral (zinc/titanium) sunscreen"]},
blackhead:{label:"blackheads & clogged pores",ings:["Salicylic Acid","Niacinamide"],prods:["Salicylic acid cleanser or leave-on liquid","Niacinamide serum","Oil-free moisturiser"]},
aging:{label:"fine lines & ageing",ings:["Retinol","Vitamin C","Peptides"],prods:["Vitamin C serum (morning)","Retinol serum (night, build up slowly)","Rich moisturiser","SPF 30+ every day"]}};
const CMATCH=[["acne",/acne|pimple|breakout|zit|spots?\b/],["blackhead",/blackhead|whitehead|clogged|pores?/],["pigment",/pigment|dark spot|dark mark|uneven|melasma|tan\b|marks?/],["dull",/dull|glow|bright/],["redness",/red(ness)?\b|irritat|rosacea|sensitiv|itch/],["aging",/wrinkle|fine line|aging|ageing|anti-?age|firm/],["dry",/dry|dehydrat|flak|tight/],["oily",/oily|greasy|shiny|sebum/]];
const chat={pending:null,open:false};
const esc=s=>String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
const ul=a=>"<ul>"+a.map(x=>"<li>"+x+"</li>").join("")+"</ul>";
function profileType(){const p=JSON.parse(localStorage.getItem("sdProfile")||"null");return p&&p.type?p.type.toLowerCase():null}
function routineFor(type,time){
 const t={oily:["Gel cleanser","Niacinamide serum","Oil-free gel moisturiser"],dry:["Creamy cleanser","Hyaluronic acid serum on damp skin","Ceramide cream"],combination:["Gentle gel cleanser","Niacinamide serum","Light lotion moisturiser"],sensitive:["Fragrance-free cleanser","Panthenol or ceramide serum","Barrier cream"],normal:["Gentle cleanser","Hydrating serum","Everyday moisturiser"]}[type];
 const am=["<b>Cleanse</b>: "+t[0]+" (or just water if skin feels tight)","<b>Treat</b>: Vitamin C serum for glow and tone (skip if sensitive), or "+t[1],"<b>Moisturise</b>: "+t[2],"<b>Protect</b>: SPF 30+ sunscreen, the most important step"];
 const pm=["<b>Cleanse</b>: "+t[0]+" (cleanse twice if you wore sunscreen or makeup)","<b>Treat</b>: "+(type==="oily"||type==="combination"?"Salicylic acid or retinol 2–3 nights a week":type==="sensitive"?"Azelaic acid or just a soothing serum":"Retinol 2 nights a week, or "+t[1]),"<b>Moisturise</b>: "+t[2],"<b>Seal</b> (optional): a thin layer of ceramide cream on dry areas"];
 let o="<p>Here is a simple routine for <b>"+type+"</b> skin:</p>";
 if(time!=="night")o+="<p><b>☀ Morning</b></p>"+ul(am);
 if(time!=="morning")o+="<p><b>☾ Night</b></p>"+ul(pm);
 return o+"<p class='cm'>Add one new product at a time and patch-test first.</p>";
}
function ingredientCard(x){
 const u=x.uses?ul(x.uses):"";
 return "<p><b>"+x.name+"</b> <span class='cm'>· "+x.cat+"</span></p><p>"+x.desc+"</p>"+u+(x.tip?"<p><b>Tip:</b> "+x.tip+"</p>":"")+(x.uses?"<p><a href='#' onclick=\"openIngredient('"+x.name+"');return false\">Open full details →</a></p>":"");
}
function concernCard(key){
 const c=CONCERNS[key];
 return "<p>For <b>"+c.label+"</b>, look for these ingredients:</p>"+ul(c.ings.map(n=>{const x=CHAT_INFO.find(i=>i.name===n);return "<b>"+n+"</b>: "+(x?x.desc.split(". ")[0].replace(/\.$/,""):"")}))+"<p>Product types to shop for:</p>"+ul(c.prods)+brandIdeas(key)+"<p class='cm'>Brands change their formulas, so check the ingredient list. Want a morning or night routine too?</p>";
}
function botReply(text){
 const q=text.toLowerCase();
 const type=TYPES.find(t=>q.includes(t))||(/combo/.test(q)?"combination":null);
 const wantsRoutine=/routine|morning|night|evening|bedtime|\bam\b|\bpm\b|step/.test(q);
 if(wantsRoutine||(chat.pending&&chat.pending.k==="routine"&&type)){
  const time=/night|evening|bedtime|\bpm\b/.test(q)?"night":/morning|\bam\b/.test(q)?"morning":(chat.pending&&chat.pending.time)||"both";
  const ty=type||profileType()&&TYPES.find(t=>profileType().includes(t));
  if(!ty){chat.pending={k:"routine",time};return {html:"Happy to build your "+(time==="both"?"morning and night":time)+" routine. What is your skin type?",chips:["Oily","Dry","Combination","Sensitive","Normal"]}}
  chat.pending=null;return {html:routineFor(ty,time),chips:["Night routine","Morning routine","Tell me about retinol"]};
 }
 const tm=TMATCH.find(([t,r])=>r.test(q));
 const asksInfo=/what is|what does|what are|explain|how (does|do)|difference/.test(q);
 const org=/korean|k-?beauty|cosrx|anua|laneige|joseon|skin1004|isntree/.test(q)?"Korean":/indian|india|minimalist|derma co|dot ?& ?key|plum|foxtale|re.?equil/.test(q)?"Indian":null;
 if(org||/brand/.test(q)||(tm&&!asksInfo)){const h=CMATCH.find(([k,r])=>r.test(q));return {html:brandList(org,h&&h[0],tm&&tm[0]),chips:["Cleanser picks","Toner picks","Serum picks","Sunscreen picks"]}}
 const ing=CHAT_INFO.filter(i=>q.includes(i.name.toLowerCase())||(i.name==="Vitamin C"&&/vit c|ascorbic/.test(q))||(i.name==="Sunscreen"&&/spf|sun ?block/.test(q))||(i.name==="Hyaluronic Acid"&&/hyaluron/.test(q)));
 if(ing.length)return {html:ing.slice(0,2).map(ingredientCard).join("<hr>"),chips:["Suggest products for me","Morning routine"]};
 const hit=CMATCH.find(([k,r])=>r.test(q));
 if(hit)return {html:concernCard(hit[0]),chips:["Morning routine","Night routine"]};
 if(/product|suggest|recommend|buy|best/.test(q)){
  const p=JSON.parse(localStorage.getItem("sdProfile")||"null");
  if(p){const k=CMATCH.find(([k,r])=>r.test(p.concern.toLowerCase()));if(k)return {html:"<p>Based on your Skin Scan ("+esc(p.type)+" skin, "+esc(p.concern)+"):</p>"+concernCard(k[0])}}
  return {html:"What is your main skin concern?",chips:["Acne","Dryness","Dark spots","Oily skin","Redness","Fine lines"]};
 }
 if(/^(hi|hello|hey|hola)\b/.test(q))return {html:"Hi! I am Skin AI. I can suggest products, build a morning or night routine, or explain any skincare ingredient. What do you need?",chips:["Suggest products","Morning routine","Night routine","What is niacinamide?"]};
 if(/thank/.test(q))return {html:"Anytime! Your skin deserves better, so ask me whenever you like."};
 return {html:"I can help with product suggestions, morning or night routines, and ingredient questions (try \"what does retinol do?\"). What would you like?",chips:["Suggest products","Morning routine","Night routine","What is niacinamide?"]};
}
function addMsg(who,html,chips){
 const log=document.getElementById("chatLog");const d=document.createElement("div");d.className="msg "+who;d.innerHTML=html;if(who==="bot"){const row=document.createElement("div");row.className="msg-row";row.innerHTML='<span class="avatar">'+ROBOT+'</span>';row.appendChild(d);log.appendChild(row)}else log.appendChild(d);
 if(chips){const c=document.createElement("div");c.className="chips";chips.forEach(t=>{const b=document.createElement("button");b.textContent=t;b.onclick=()=>{c.remove();sendChat(t)};c.appendChild(b)});log.appendChild(c)}
 log.scrollTop=log.scrollHeight;
}
chat.hist=[];
function md(s){let o="",inL=false;for(const l of esc(s).split("\n")){const m=l.match(/^\s*[-*\u2022]\s+(.*)/);if(m){if(!inL){o+="<ul>";inL=true}o+="<li>"+m[1]+"</li>"}else{if(inL){o+="</ul>";inL=false}if(l.trim())o+="<p>"+l+"</p>"}}if(inL)o+="</ul>";return o.replace(/\*\*(.+?)\*\*/g,"<b>$1</b>")}
async function askAI(){
 const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:chat.hist.slice(-10),profile:JSON.parse(localStorage.getItem("sdProfile")||"null")})});
 if(!r.ok)throw new Error("ai "+r.status);const d=await r.json();if(!d.reply)throw new Error("empty");return d.reply}
function sendChat(text){
 text=(text||"").trim();if(!text)return;
 document.querySelectorAll("#chatLog .chips").forEach(c=>c.remove());
 addMsg("user",esc(text));chat.hist.push({role:"user",content:text});
 const tp=document.createElement("div");tp.className="msg bot typing";tp.innerHTML="<i></i><i></i><i></i>";const log=document.getElementById("chatLog");log.appendChild(tp);log.scrollTop=log.scrollHeight;
 askAI().then(rep=>{tp.remove();chat.hist.push({role:"assistant",content:rep});addMsg("bot",md(rep),["Cleanser picks","Serum picks","Night routine"])})
 .catch(()=>{tp.remove();const r=botReply(text);chat.hist.push({role:"assistant",content:r.html.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim()});addMsg("bot",r.html,r.chips)})
}
function openChat(){const w=document.getElementById("chatWin");if(!w)return;hideNudge();chat.open=true;w.classList.add("open");document.getElementById("chatFab").classList.add("hide");document.getElementById("chatInput").focus()}
function closeChat(){chat.open=false;document.getElementById("chatWin").classList.remove("open");document.getElementById("chatFab").classList.remove("hide")}
function initChat(){
 const w=document.createElement("div");
 w.innerHTML='<button id="chatFab" class="chat-fab" onclick="openChat()" aria-label="Open Skin AI chat"><span class="avatar">'+ROBOT+'</span><span>Ask Skin AI</span></button><section id="chatWin" class="chat-win" role="dialog" aria-label="Skin AI chat"><header><div class="hd"><span class="avatar big">'+ROBOT+'</span><div><b>Skin AI</b><small>Products · routines · ingredients</small></div></div><button onclick="closeChat()" aria-label="Close chat">×</button></header><div id="chatLog" class="chat-log"></div><form class="chat-form" onsubmit="event.preventDefault();const i=document.getElementById(\'chatInput\');sendChat(i.value);i.value=\'\'"><input id="chatInput" autocomplete="off" placeholder="Ask about your skin…"><button type="submit" aria-label="Send">➤</button></form><p class="chat-note">Educational guidance only, not medical advice.</p></section>';
 document.body.append(...w.children);
 const n=document.createElement("div");n.id="chatNudge";n.className="chat-nudge";n.innerHTML='<span>Need any suggestion?</span><small>Ask Skin AI for products or a routine</small><button aria-label="Dismiss">×</button>';document.body.appendChild(n);
 n.onclick=e=>{if(e.target.tagName==="BUTTON"){hideNudge(true)}else openChat()};
 let gone=false;try{gone=sessionStorage.getItem("nudgeOff")}catch(e){}
 if(!gone)setTimeout(()=>{if(!chat.open)n.classList.add("show")},1200);
 addMsg("bot","Hi, I am <b>Skin AI</b>. Need any suggestion? Tell me what you need:",["Suggest products","Korean brands","Indian brands","Morning routine"]);
}


/* =========================================================
   DATABASE-BACKED SKIN DECODE PRODUCT + PROFILE SYSTEM
   ========================================================= */

const SKIN_PRODUCTS = [
  ["Skin Decode","Vitamin C Serum","Serum","pigment dull","Brightening · Even Tone","Boosts glow and fades dark spots.","vitamin-c-serum.webp"],
  ["Skin Decode","Hydrating Cleanser","Cleanser","dry redness","Gentle · Refreshing","Cleanses without stripping moisture.","hydrating-cleanser.webp"],
  ["Skin Decode","Daily Moisturizer","Moisturiser","dry","Hydration · Softness","Keeps your skin soft and supple.","daily-moisturizer.webp"],
  ["Skin Decode","Niacinamide Serum","Serum","acne oily pigment","Clear Skin · Balance","Reduces blemishes and controls oil.","niacinamide-serum.webp"],
  ["Skin Decode","Aqua Face Wash","Cleanser","oily acne","Deep Clean · Freshness","Removes dirt and excess oil.","aqua-face-wash.webp"],
  ["Skin Decode","Radiant Sunscreen SPF 50","Sunscreen","pigment dull","Protection · No White Cast","Shields from UV rays and keeps skin safe.","radiant-sunscreen-spf-50.webp"],
  ["Skin Decode","Velvet Night Cream","Night Cream","dry aging","Repair · Nourish","Rejuvenates skin while you sleep.","velvet-night-cream.webp"],
  ["Skin Decode","Fresh Aloe Gel","Face Gel","redness dry","Soothing · Hydrating","Calms and refreshes tired skin.","fresh-aloe-gel.webp"],
  ["Skin Decode","Clear Salicylic Acid Serum","Serum","acne blackhead oily","Acne Care · Exfoliate","Unclogs pores and prevents breakouts.","clear-salicylic-acid-serum.webp"],
  ["Skin Decode","Lumina Rose Face Mask","Face Mask","dull pigment","Glow · Rejuvenate","Brightens and refreshes dull skin.","lumina-rose-face-mask.webp"],
  ["Skin Decode","Soft Aura Gentle Scrub","Exfoliator","dull","Smooth · Renew","Removes dead skin cells gently.","soft-aura-gentle-scrub.webp"],
  ["Skin Decode","Hydra Bloom Hyaluronic Serum","Serum","dry","Plump · Hydrate","Adds deep hydration and elasticity.","hydra-bloom-hyaluronic-serum.webp"],
  ["Skin Decode","Calm Cove Centella Cream","Moisturiser","redness dry","Soothe · Repair","Calms irritation and strengthens skin.","calm-cove-centella-cream.webp"],
  ["Skin Decode","Sun Veil Matte Sunscreen","Sunscreen","oily acne","Oil Control · Matte Finish","Keeps skin matte and protected.","sun-veil-matte-sunscreen.webp"],
  ["Skin Decode","Pure Glow Clay Mask","Face Mask","oily blackhead","Detox · Cleanse","Draws out impurities and tightens pores.","pure-glow-clay-mask.webp"],
  ["Skin Decode","Dew Drop Rose Toner","Toner","dry redness","Refresh · Tone","Balances skin and restores freshness.","dew-drop-rose-toner.webp"],
  ["Skin Decode","Skin Nest Ceramide Cream","Moisturiser","dry redness","Barrier · Protect","Strengthens skin barrier and locks in moisture.","skin-nest-ceramide-cream.webp"],
  ["Skin Decode","Glow Mint Green Tea Cleanser","Cleanser","oily acne","Purify · Refresh","Deep cleanses and revives skin.","glow-mint-green-tea-cleanser.webp"],
  ["Skin Decode","Radiance Lab Peptide Serum","Serum","aging dry","Firm · Rejuvenate","Improves elasticity and smoothness.","radiance-lab-peptide-serum.webp"],
  ["Skin Decode","Aloe Cloud Barrier Repair Gel","Face Gel","dry redness","Strengthen · Heal","Repairs and protects sensitive skin.","aloe-cloud-barrier-repair-gel.webp"]
].map(([origin,name,type,c,tags,note,image]) => ({
  origin, brand:origin, name, type, c:c.split(" "), tags, note, image, photo:true
}));

const KOREAN_INDIAN = [
  ["Korean","COSRX","Low pH Good Morning Gel Cleanser","Cleanser","acne oily blackhead","Gentle gel cleanser with tea tree oil and BHA."],
  ["Korean","COSRX","BHA Blackhead Power Liquid","Treatment","blackhead acne oily","Leave-on exfoliant with betaine salicylate for clogged pores."],
  ["Korean","COSRX","Advanced Snail 96 Mucin Power Essence","Essence","dry redness dull","Lightweight hydrating essence that leaves skin bouncy."],
  ["Korean","Beauty of Joseon","Relief Sun: Rice + Probiotics SPF50+","Sunscreen","pigment dull aging dry redness","Comfortable, non-greasy daily sunscreen."],
  ["Korean","Beauty of Joseon","Glow Serum: Propolis + Niacinamide","Serum","acne oily dull","Soothing and tone-evening, good for breakout-prone skin."],
  ["Korean","Beauty of Joseon","Revive Serum: Ginseng + Snail Mucin","Serum","aging dry","Hydrating serum for a firmer, smoother look."],
  ["Korean","Anua","Heartleaf 77% Soothing Toner","Toner","redness acne","Calming toner for irritated or reactive skin."],
  ["Korean","Skin1004","Madagascar Centella Ampoule","Serum","redness acne dry","Centella ampoule that soothes and supports the barrier."],
  ["Korean","Laneige","Water Bank Blue Hyaluronic Cream","Moisturiser","dry","Hyaluronic acid cream for dehydrated skin."],
  ["Korean","Isntree","Hyaluronic Acid Toner","Toner","dry dull","Light layered hydration, suits sensitive skin."],
  ["Korean","Some By Mi","AHA BHA PHA 30 Days Miracle Toner","Toner","blackhead acne dull","Mild exfoliating toner, use a few nights a week."],
  ["Korean","Round Lab","1025 Dokdo Toner","Toner","dry redness dull","Simple, gentle toner with mineral-rich water."],
  ["Indian","Minimalist","10% Niacinamide Serum","Serum","oily acne pigment blackhead","Targets oil, pores and uneven tone."],
  ["Indian","Minimalist","2% Salicylic Acid Serum","Serum","acne blackhead oily","Unclogs pores. Start a few nights a week."],
  ["Indian","Minimalist","10% Vitamin C Face Serum","Serum","pigment dull","Morning antioxidant for dark spots and dullness."],
  ["Indian","Minimalist","0.3% Retinol Serum","Serum","aging acne","Beginner-friendly retinol, night use only."],
  ["Indian","Minimalist","Light Fluid SPF 50 Sunscreen","Sunscreen","oily acne pigment","Light texture for oily skin."],
  ["Indian","The Derma Co","2% Salicylic Acid Face Wash","Cleanser","acne blackhead oily","Daily cleanser for breakouts and clogged pores."],
  ["Indian","The Derma Co","1% Hyaluronic Sunscreen Aqua Gel SPF 50","Sunscreen","dry dull oily","Hydrating gel sunscreen."],
  ["Indian","Dot & Key","Vitamin C + E Super Bright Moisturizer","Moisturiser","pigment dull","Brightening moisturiser for everyday glow."],
  ["Indian","Plum","Green Tea Pore Cleansing Face Wash","Cleanser","oily acne","Mild face wash for oily, acne-prone skin."],
  ["Indian","Re'equil","Ceramide & Hyaluronic Acid Moisturizing Cream","Moisturiser","dry redness","Barrier-support cream for dry or sensitive skin."],
  ["Indian","Dr. Sheth's","Ceramide & Vitamin C Oil-Free Moisturizer","Moisturiser","oily pigment","Oil-free hydration with brightening."],
  ["Indian","Aqualogica","Glow+ Dewy Sunscreen SPF 50","Sunscreen","dull dry","Dewy-finish sunscreen for normal to dry skin."]
].map(([origin,brand,name,type,c,note]) => ({
  origin,brand,name,type,c:c.split(" "),note,photo:false
}));

const BRANDS = SKIN_PRODUCTS;

const TYPE_ART = {
  Cleanser:"pump", Toner:"toner", Serum:"serum", Essence:"serum",
  Moisturiser:"jar", Sunscreen:"tube", Treatment:"serum",
  "Night Cream":"jar", "Face Gel":"jar", "Face Mask":"jar", Exfoliator:"tube"
};

function slug(b){
  return (b.brand + " " + b.name).toLowerCase()
    .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}

function productThumb(b){
  const label = b.type || "SKIN CARE";
  const id = slug(b).replace(/[^a-z0-9]/g,"");
  return `<div class="product-art product-illustration"><svg viewBox="0 0 260 260" class="product-svg" role="img" aria-label="${escapeHtml(b.brand)} ${escapeHtml(b.name)}">
  <defs><linearGradient id="pbg-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#f4dce4"/></linearGradient></defs>
  <ellipse cx="130" cy="220" rx="70" ry="12" fill="#ead2da"/>
  <rect x="88" y="68" width="84" height="145" rx="18" fill="url(#pbg-${id})" stroke="#7e2a45" stroke-width="3"/>
  <rect x="103" y="45" width="54" height="28" rx="7" fill="#ffffff" stroke="#7e2a45" stroke-width="3"/>
  <rect x="119" y="28" width="22" height="20" rx="5" fill="#7e2a45"/>
  <rect x="103" y="108" width="54" height="55" rx="8" fill="#ffffff" opacity=".95"/>
  <text x="130" y="130" text-anchor="middle" font-size="10" font-weight="700" fill="#7e2a45">${escapeHtml(b.brand.slice(0,12))}</text>
  <text x="130" y="148" text-anchor="middle" font-size="8" fill="#7e2a45">${escapeHtml(label)}</text>
  </svg></div>`;
}

function productImage(b){
  if(!b.photo) return productThumb(b);
  return `<div class="product-art"><img class="product-photo" loading="lazy" src="images/products4k/${escapeHtml(b.image)}" alt="${escapeHtml(b.name)}"></div>`;
}

let brandType = "All";

function setType(t){ brandType=t; renderBrands(); }

function renderBrands(){
  const g=document.getElementById("brandGrid");
  if(!g) return;
  const originEl=document.getElementById("brandOrigin");
  const concernEl=document.getElementById("brandConcern");
  const searchEl=document.getElementById("brandSearch");
  const chips=document.getElementById("typeChips");
  if(chips) chips.innerHTML=["All",...Object.keys(TYPE_ART)].map(t=>`<button class="tchip${t===brandType?" on":""}" onclick="setType('${escapeHtml(t)}')"><span>${escapeHtml(t)}</span></button>`).join("");
  const o=originEl?.value||"All", c=concernEl?.value||"All", q=(searchEl?.value||"").toLowerCase().trim();
  const list=BRANDS.filter(b=>
    (o==="All"||b.origin===o) &&
    (c==="All"||b.c.includes(c)) &&
    (brandType==="All"||b.type===brandType) &&
    (`${b.origin} ${b.brand} ${b.name} ${b.type} ${b.note}`.toLowerCase().includes(q))
  );
  g.innerHTML=list.length ? list.map(b=>`<article class="ingredient-card bcard">
    <div class="bart">${productImage(b)}</div>
    <span class="pill">${escapeHtml(b.origin)} · ${escapeHtml(b.type)}</span>
    <h3>${escapeHtml(b.brand)}</h3>
    <p><b>${escapeHtml(b.name)}</b></p>
    <p>${escapeHtml(b.note)}</p>
  </article>`).join("") : `<p class="muted">No matches. Try another product type, concern or search.</p>`;
}

/* ---------- Database-backed account helpers ---------- */
let CURRENT_USER=null, CURRENT_PROFILE=null, CURRENT_SAVED=[];

function user(){ return CURRENT_USER; }

async function api(path, options={}){
  const res=await fetch(path,{credentials:"same-origin",headers:{"Content-Type":"application/json",...(options.headers||{})},...options});
  let data={}; try{data=await res.json()}catch{}
  if(!res.ok){const err=new Error(data.error||"request_failed");err.status=res.status;throw err;}
  return data;
}

async function loadAccount(){
  try{
    const d=await api("/api/auth/me",{method:"GET"});
    CURRENT_USER=d.user||null;
    CURRENT_PROFILE=d.profile||null;
    CURRENT_SAVED=Array.isArray(d.saved)?d.saved:[];
  }catch{CURRENT_USER=null;CURRENT_PROFILE=null;CURRENT_SAVED=[];}
  updateNav();
}

function updateNav(){
  const n=document.getElementById("navName");
  if(n) n.textContent=CURRENT_USER?.name||"";
  const w=document.getElementById("welcomeName");
  if(w) w.textContent=CURRENT_USER?.name?.split(" ")[0]||"there";
}

async function signup(e){
  e.preventDefault();
  const name=document.getElementById("signupName").value.trim();
  const email=document.getElementById("signupEmail").value.trim();
  const password=document.getElementById("signupPassword").value;
  try{
    const d=await api("/api/auth/signup",{method:"POST",body:JSON.stringify({name,email,password})});
    CURRENT_USER=d.user; CURRENT_PROFILE=null; CURRENT_SAVED=[];
    location.href="home.html";
  }catch(err){alert(err.status===409?"That email is already registered. Please log in.":"Could not create the account. Please check your details.");}
}

async function login(e){
  e.preventDefault();
  const email=document.getElementById("loginEmail").value.trim();
  const password=document.getElementById("loginPassword").value;
  try{
    const d=await api("/api/auth/login",{method:"POST",body:JSON.stringify({email,password})});
    CURRENT_USER=d.user; location.href="home.html";
  }catch{alert("Invalid email or password.");}
}

async function logout(){
  try{await api("/api/auth/logout",{method:"POST",body:"{}"});}catch{}
  CURRENT_USER=null; CURRENT_PROFILE=null; CURRENT_SAVED=[];
  location.href="index.html";
}

async function calculateResults(e){
  e.preventDefault();
  const type=document.querySelector('input[name="skinType"]:checked')?.value;
  const concern=document.querySelector('input[name="concern"]:checked')?.value;
  const sens=document.querySelector('input[name="sensitivity"]:checked')?.value;
  const map={
    Acne:["Salicylic Acid","Niacinamide","Azelaic Acid"],
    Pigmentation:["Vitamin C","Azelaic Acid","Niacinamide"],
    Dryness:["Hyaluronic Acid","Ceramides","Glycerin"],
    Dullness:["Vitamin C","Niacinamide"],
    Oiliness:["Niacinamide","Salicylic Acid"],
    Redness:["Panthenol","Ceramides","Azelaic Acid"],
    Blackheads:["Salicylic Acid","Niacinamide"]
  };
  const names=map[concern]||[];
  try{
    await api("/api/scan",{method:"POST",body:JSON.stringify({type,concern,sens,ingredients:names})});
    CURRENT_PROFILE={type,concern,sens,ingredients:names};
  }catch{
    alert("Please log in first so your Skin Scan can be saved to the database.");
    return;
  }
  document.getElementById("progressBar").style.width="100%";
  let html=`<section class="result"><div class="result-head"><span class="eyebrow">YOUR DECODED PROFILE</span><h2>${escapeHtml(type)} skin · ${escapeHtml(concern)}</h2><p>Based on your answers, these ingredients are relevant to explore. This is educational guidance, not a diagnosis.</p></div><div class="match-grid">`;
  names.forEach(n=>{const x=INGREDIENTS.find(i=>i.name===n);html+=`<article class="match"><span class="pill">${escapeHtml(x?.cat||"Ingredient")}</span><h3>${escapeHtml(n)}</h3><p>${escapeHtml(x?.desc||"")}</p><button class="secondary" onclick="openIngredient('${escapeHtml(n)}')">Learn more</button></article>`});
  html+=`</div><a class="primary" style="margin-top:20px" href="profile.html">Save & view my profile →</a></section>`;
  document.getElementById("quizResult").innerHTML=html;
  window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"});
}

async function toggleSave(name){
  try{
    const d=await api("/api/saved/toggle",{method:"POST",body:JSON.stringify({name})});
    if(d.saved) CURRENT_SAVED=[...new Set([...CURRENT_SAVED,name])];
    else CURRENT_SAVED=CURRENT_SAVED.filter(x=>x!==name);
    renderDetail(); renderProfile();
  }catch{alert("Please log in to save ingredients.");}
}

async function renderDetail(){
  const el=document.getElementById("ingredientDetail"); if(!el)return;
  const name=localStorage.getItem("selectedIngredient")||"Niacinamide";
  const x=INGREDIENTS.find(i=>i.name===name)||INGREDIENTS[0];
  const is=CURRENT_SAVED.includes(x.name);
  el.innerHTML=`<section class="detail-hero"><span class="eyebrow">${escapeHtml(x.cat.toUpperCase())}</span><h1>${escapeHtml(x.name)}</h1><p>${escapeHtml(x.desc)}</p><button class="primary" onclick="toggleSave('${escapeHtml(x.name)}')">${is?"♥ Saved":"♡ Save ingredient"}</button></section><div class="detail-grid"><div class="detail-box"><h3>Common uses</h3><ul>${x.uses.map(u=>`<li>${escapeHtml(u)}</li>`).join("")}</ul></div><div class="detail-box"><h3>Good to know</h3><p>Suitability depends on the individual. Concentration, formulation, frequency and other routine steps can affect how an ingredient feels on skin.</p></div></div>`;
}

function renderProfile(){
  const name=document.getElementById("profileName"); if(!name)return;
  const email=document.getElementById("profileEmail");
  const avatar=document.getElementById("avatar");
  const box=document.getElementById("skinProfileCard");
  const list=document.getElementById("savedList");
  if(CURRENT_USER){
    name.textContent=CURRENT_USER.name;
    email.textContent=CURRENT_USER.email;
    avatar.textContent=(CURRENT_USER.name||"S").charAt(0).toUpperCase();
  }else{
    name.textContent="Not logged in";
    email.textContent="";
    avatar.textContent="S";
  }
  if(CURRENT_PROFILE){
    box.innerHTML=`<div><span>Skin type</span><b>${escapeHtml(CURRENT_PROFILE.type)}</b></div><div><span>Main concern</span><b>${escapeHtml(CURRENT_PROFILE.concern)}</b></div><div><span>Sensitivity</span><b>${escapeHtml(CURRENT_PROFILE.sens)}</b></div><div><span>Matched ingredients</span><b>${CURRENT_PROFILE.ingredients.length}</b></div>`;
  }else box.innerHTML="<p class='muted'>Complete your Skin Scan to create your profile.</p>";
  list.innerHTML=CURRENT_SAVED.length?CURRENT_SAVED.map(x=>`<div class="saved-item"><span>♡ ${escapeHtml(x)}</span><button onclick="toggleSave('${escapeHtml(x)}')">Remove</button></div>`).join(""):"<p class='muted'>No saved ingredients yet.</p>";
}

async function initDatabaseApp(){
  await loadAccount();
  if(document.getElementById("ingredientGrid"))renderIngredients();
  if(document.getElementById("ingredientDetail"))renderDetail();
  if(document.getElementById("profileName"))renderProfile();
  if(document.getElementById("progressBar"))setTimeout(()=>document.getElementById("progressBar").style.width="33%",100);
  const tp=new URLSearchParams(location.search).get("type");
  if(tp&&TYPE_ART[tp])brandType=tp;
  renderBrands();
}

document.addEventListener("DOMContentLoaded",()=>{
  const nl=document.querySelector(".nav-links");
  if(nl&&!nl.querySelector("[href='brands.html']")){
    const a=document.createElement("a");a.href="brands.html";a.textContent="Brands";
    const about=nl.querySelector("[href='about.html']"); if(about) nl.insertBefore(a,about); else nl.appendChild(a);
  }
  const search=document.getElementById("brandSearch");
  if(search)search.addEventListener("input",renderBrands);
  const origin=document.getElementById("brandOrigin"); if(origin)origin.addEventListener("change",renderBrands);
  const concern=document.getElementById("brandConcern"); if(concern)concern.addEventListener("change",renderBrands);
  initDatabaseApp();
});

window.BRANDS=BRANDS;
window.productThumb=productThumb;
window.renderBrands=renderBrands;
window.searchProducts=(q)=>BRANDS.filter(b=>`${b.origin} ${b.brand} ${b.name} ${b.type} ${b.note}`.toLowerCase().includes(String(q||"").toLowerCase()));
