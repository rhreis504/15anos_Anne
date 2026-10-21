/** Curtidas do evento — importar como arquivo Likes.gs no Apps Script. */
function registrarCurtida(id, delta, visitorId) {
  if (!/^[\w-]{10,}$/.test(String(id))) throw Error('Arquivo inválido');
  if (delta !== 1 && delta !== -1) throw Error('Operação inválida');
  const guest = PropertiesService.getScriptProperties().getProperty('anne_guest_'+visitorId);
  if(!guest) throw Error('Informe seu nome para curtir.');
  const file = DriveApp.getFileById(id);
  const parents = file.getParents();
  let allowed = false;
  while (parents.hasNext()) if (parents.next().getId() === CONFIG.FOLDER_ID) allowed = true;
  if (!allowed) throw Error('Arquivo não pertence ao evento');
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const props = PropertiesService.getScriptProperties();
    const voteKey='anne_vote_'+visitorId+'_'+id;
    const previous=props.getProperty(voteKey)==='1';
    if(delta!==(previous?-1:1))throw Error('Atualize a página e tente novamente.');
    const key = 'anne_likes_' + id;
    const count = Math.max(0, Number(props.getProperty(key) || 0) + delta);
    props.setProperty(key, String(count));
    if(previous)props.deleteProperty(voteKey);else props.setProperty(voteKey,'1');
    return {id:id, likes:count};
  } finally {
    lock.releaseLock();
  }
}
