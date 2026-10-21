/* Anne XV v2 — transporte isolado para o Apps Script.
   Configure a URL /exec da implantação de homologação no arquivo config.js. */
(function(){
 const endpoint=window.ANNE_V2_BRIDGE_URL;
 const pending=new Map();let seq=0,ready=false,frame=null;
 const origin='https://rhreis504.github.io';
 const methods=['listMedia','registerGuest','getGuestVotes','registrarCurtida','uploadMedia','getMediaData'];
 function rejectAll(message){for(const p of pending.values())p.fail(new Error(message));pending.clear()}
 if(endpoint&&/^https:\/\/script\.google\.com\/macros\/s\//.test(endpoint)){
  frame=document.createElement('iframe');
  frame.src=endpoint+(endpoint.includes('?')?'&':'?')+'mode=bridge';
  frame.style.display='none';frame.title='Conexão com o álbum';
  document.addEventListener('DOMContentLoaded',()=>document.body.append(frame));
 }else{
  document.addEventListener('DOMContentLoaded',()=>{const n=document.getElementById('status');if(n)n.textContent='Versão de testes: backend ainda não configurado.'});
 }
 window.addEventListener('message',e=>{
  if(e.origin!=='https://script.googleusercontent.com'&&e.origin!=='https://script.google.com')return;
  if(e.source!==frame?.contentWindow)return;
  if(e.data?.channel==='anne-v2-ready'){ready=true;return}
  if(e.data?.channel!=='anne-v2-result')return;
  const p=pending.get(e.data.id);if(!p)return;
  pending.delete(e.data.id);
  e.data.ok?p.ok(e.data.value):p.fail(new Error(e.data.error||'Falha no serviço'));
 });
 function invoke(method,args,ok,fail){
  if(!frame){fail(new Error('Backend da versão 2 ainda não configurado.'));return}
  const id='req_'+(++seq);
  const timer=setTimeout(()=>{pending.delete(id);fail(new Error('Conexão lenta ou indisponível. Tente novamente.'))},30000);
  pending.set(id,{ok:v=>{clearTimeout(timer);ok(v)},fail:e=>{clearTimeout(timer);fail(e)}});
  const send=()=>frame.contentWindow.postMessage({channel:'anne-v2',id,method,args},'https://script.google.com');
  if(ready)send();else{
   const start=Date.now();
   const poll=setInterval(()=>{if(ready||Date.now()-start>12000){clearInterval(poll);if(ready)send();else{const p=pending.get(id);if(p){pending.delete(id);p.fail(new Error('Não foi possível iniciar a conexão.'))}}}},200)
  }
 }
 window.google={script:{run:new Proxy({},{
  get(_,key){
   if(key==='withSuccessHandler')return ok=>new Proxy({}, {get(__,k){
    if(k==='withFailureHandler')return fail=>new Proxy({}, {get(___,method){
     if(!methods.includes(method))return undefined;
     return(...args)=>invoke(method,args,ok,fail)
    }});
    return undefined
   }});
   return undefined
  }
 })}};
})();
