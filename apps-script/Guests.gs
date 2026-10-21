function registerGuest(name, visitorId) {
  name=String(name||'').trim().slice(0,50);
  if(name.length<2)throw Error('Informe seu nome.');
  if(!visitorId||String(visitorId).length<20)throw Error('Identificador inválido.');
  PropertiesService.getScriptProperties().setProperty('anne_guest_'+visitorId,name);
  return {name:name};
}

function getGuestVotes(visitorId) {
  const p=PropertiesService.getScriptProperties().getProperties();
  const prefix='anne_vote_'+visitorId+'_';
  return Object.keys(p).filter(k=>k.indexOf(prefix)===0&&p[k]==='1').map(k=>k.slice(prefix.length));
}
