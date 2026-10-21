function registerGuest(name, visitorId) {
  name=String(name||'').trim().slice(0,50);
  if(name.length<2)throw Error('Informe seu nome.');
  if(!visitorId||String(visitorId).length<20)throw Error('Identificador inválido.');
  PropertiesService.getScriptProperties().setProperty('anne_guest_'+visitorId,name);
  return {name:name};
}
