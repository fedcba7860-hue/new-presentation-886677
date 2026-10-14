/* Skin AI add-on only. It does not replace or modify existing Skin Decode UI logic. */
(function(){
  function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function removeOldAI(){
    document.querySelectorAll('.chat-fab,.chat-win,.chat-nudge').forEach(function(el){el.remove()});
    document.querySelectorAll('button[onclick="openChat()"]').forEach(function(el){ el.style.display='none'; });
  }
  function addMsg(log,who,text){
    var d=document.createElement('div');d.className='sd-ai-msg '+who;d.innerHTML=esc(text).replace(/\n/g,'<br>');log.appendChild(d);log.scrollTop=log.scrollHeight;
  }
  function chips(log,items,send){
    var row=document.createElement('div');row.className='sd-ai-chips';items.forEach(function(t){var b=document.createElement('button');b.className='sd-ai-chip';b.textContent=t;b.onclick=function(){send(t)};row.appendChild(b)});log.appendChild(row);log.scrollTop=log.scrollHeight;
  }
  function init(){
    removeOldAI();
    var fab=document.createElement('button');fab.id='sd-ai-fab';fab.innerHTML='<span class="sd-ai-icon">✦</span><span>Ask Skin AI</span>';
    var nudge=document.createElement('div');nudge.id='sd-ai-nudge';nudge.innerHTML='<strong>Need any suggestion?</strong><small>Ask Skin AI for products or a routine</small><button aria-label="Close">×</button>';
    var win=document.createElement('section');win.id='sd-ai-window';win.setAttribute('aria-label','Skin AI chat');win.innerHTML='<div class="sd-ai-head"><div class="sd-ai-title"><span class="sd-ai-icon">✦</span><div><strong>Skin AI</strong><small>Products · routines · ingredients</small></div></div><button class="sd-ai-close" aria-label="Close">×</button></div><div class="sd-ai-log"></div><form class="sd-ai-form"><input autocomplete="off" placeholder="Ask about your skin…"><button type="submit">➤</button></form><div class="sd-ai-note">Educational guidance only, not medical advice.</div>';
    document.body.appendChild(fab);document.body.appendChild(nudge);document.body.appendChild(win);
    var log=win.querySelector('.sd-ai-log'),input=win.querySelector('input'),form=win.querySelector('form');
    function open(){nudge.classList.remove('show');win.classList.add('open');fab.style.display='none';input.focus()}
    function close(){win.classList.remove('open');fab.style.display='flex'}
    var PRODUCTS=null;
    function localAI(text){
      var q=String(text||'').toLowerCase();
      var hello=/^(hi|hello|hey|hola)\b/.test(q);
      if(hello)return {reply:'Hi! I am Skin AI. I can suggest products, build a morning or night routine, or explain skincare ingredients. What would you like help with?',chips:['Suggest products','Morning routine','Night routine','What is niacinamide?']};
      if(/thank/.test(q))return {reply:'You’re welcome! Ask me anytime about products, routines, or skincare ingredients.'};
      if(/niacinamide/.test(q))return {reply:'Niacinamide is a form of vitamin B3 commonly used to support the skin barrier, reduce excess oil, and improve the appearance of blemishes and uneven tone. A simple option in this catalog is Niacinamide Serum.'};
      if(/salicylic|bha/.test(q))return {reply:'Salicylic acid (BHA) helps exfoliate inside pores and can be useful for excess oil, clogged pores, and acne. Start gradually and avoid combining too many strong actives at once.'};
      if(/vitamin\s*c/.test(q))return {reply:'Vitamin C is commonly used for antioxidant protection and improving the appearance of dull or uneven-looking skin. In this catalog, Vitamin C Serum is the matching product.'};
      if(/hyaluronic|hydration|dehydrat/.test(q))return {reply:'Hyaluronic acid is a hydrating ingredient that helps the skin hold water. For dry or dehydrated skin, pair a hydrating serum with a moisturizer and sunscreen during the day.'};
      if(/ceramide/.test(q))return {reply:'Ceramides are lipids that help support the skin barrier. They are commonly useful in routines focused on dryness, sensitivity, or barrier care.'};
      if(/sunscreen|spf|sun/.test(q))return {reply:'Sunscreen is an important daytime step, especially when you are concerned about dark spots or uneven tone. This catalog includes Radiant Sunscreen SPF 50 and Sun Veil Matte Sunscreen.'};
      var concern='';
      if(/acne|pimple|breakout|blackhead|clogged/.test(q))concern='acne';
      else if(/oily|oil/.test(q))concern='oily';
      else if(/dry|dehydrated|flaky/.test(q))concern='dry';
      else if(/redness|sensitive|irritat/.test(q))concern='redness';
      else if(/dark spot|pigment|hyperpig|uneven|dull|glow/.test(q))concern='pigment';
      var wantsRoutine=/routine|morning|night|regimen|steps/.test(q);
      var wantsProducts=/product|recommend|suggest|pick|use|buy/.test(q);
      if(wantsRoutine){
        if(/night/.test(q))return {reply:'A simple night routine: gentle cleanser → treatment/serum suited to your concern → moisturizer. Introduce active ingredients gradually and avoid stacking multiple strong actives.',chips:['Acne products','Dry skin products','Ingredient question']};
        return {reply:'A simple morning routine: gentle cleanser → suitable serum → moisturizer if needed → SPF 50 sunscreen. Reapply sunscreen as appropriate for your day.',chips:['Acne products','Dry skin products','Ingredient question']};
      }
      if(wantsProducts || concern){
        var list=[];
        if(concern && Array.isArray(PRODUCTS)){
          list=PRODUCTS.filter(function(x){return Array.isArray(x.c)&&x.c.indexOf(concern)>=0}).slice(0,4);
        }
        if(!list.length && Array.isArray(PRODUCTS)) list=PRODUCTS.slice(0,4);
        if(list.length){
          var names=list.map(function(x){return '• '+x.name+' — '+x.note}).join('\n');
          return {reply:(concern?'For '+concern+'-focused care, ':'Here are some products from your catalog:')+'\n'+names+'\n\nThese are educational suggestions, not a diagnosis. Choose based on your skin and introduce new products gradually.'};
        }
      }
      return {reply:'I can help with product suggestions, morning or night routines, and ingredient questions. Try asking “suggest products for acne”, “make a morning routine”, or “what does niacinamide do?”',chips:['Suggest products','Morning routine','Night routine','What is niacinamide?']};
    }
    function loadProducts(){
      if(PRODUCTS)return Promise.resolve(PRODUCTS);
      return fetch('products.json').then(function(r){return r.ok?r.json():[]}).catch(function(){return []}).then(function(d){PRODUCTS=Array.isArray(d)?d:[];return PRODUCTS});
    }
    function send(text){text=(text||'').trim();if(!text)return;addMsg(log,'user',text);input.value='';var typing=document.createElement('div');typing.className='sd-ai-msg bot';typing.textContent='Thinking…';log.appendChild(typing);log.scrollTop=log.scrollHeight;
      var profile=null;try{profile=JSON.parse(localStorage.getItem('sdProfile')||'null')}catch(e){}
      loadProducts().then(function(){return fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:text}],profile:profile})}).then(function(r){return r.json().then(function(d){if(!r.ok)throw new Error(d.error||'AI unavailable');return d})})}).then(function(d){typing.remove();addMsg(log,'bot',d.reply||localAI(text).reply);}).catch(function(){
        typing.remove();var a=localAI(text);addMsg(log,'bot',a.reply);if(a.chips)chips(log,a.chips,send);
      });
    }
    fab.onclick=open;nudge.onclick=function(e){if(e.target.tagName==='BUTTON')nudge.classList.remove('show');else open()};win.querySelector('.sd-ai-close').onclick=close;form.onsubmit=function(e){e.preventDefault();send(input.value)};
    addMsg(log,'bot','Hi! I am Skin AI. How can I help with your skincare today?');chips(log,['Suggest products','Morning routine','Night routine','What is niacinamide?'],send);
    setTimeout(function(){nudge.classList.add('show')},1000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
