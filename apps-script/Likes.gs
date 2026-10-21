/** Curtidas do evento — importar como arquivo Likes.gs no Apps Script. */
function registrarCurtida(id, delta) {
  if (!/^[\w-]{10,}$/.test(String(id))) throw Error('Arquivo inválido');
  if (delta !== 1 && delta !== -1) throw Error('Operação inválida');
  const file = DriveApp.getFileById(id);
  const parents = file.getParents();
  let allowed = false;
  while (parents.hasNext()) if (parents.next().getId() === CONFIG.FOLDER_ID) allowed = true;
  if (!allowed) throw Error('Arquivo não pertence ao evento');
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const props = PropertiesService.getScriptProperties();
    const key = 'anne_likes_' + id;
    const count = Math.max(0, Number(props.getProperty(key) || 0) + delta);
    props.setProperty(key, String(count));
    return {id:id, likes:count};
  } finally {
    lock.releaseLock();
  }
}
