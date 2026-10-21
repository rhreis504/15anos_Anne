/**
 * 15 Anos da Anne — backend Apps Script v1.0.0
 * Deploy: Web app / Execute as: Me / Access: Anyone.
 * IMPORTANT: photos and videos are shared as "anyone with link" VIEW.
 * The Drive folder itself remains private. Never store secrets in frontend.
 */
const CONFIG = Object.freeze({
  FOLDER_ID: '1V05lAw-hShUQG--NLX-qnmKJN2n3I7NB',
  MAX_BYTES: 15 * 1024 * 1024,
  MAX_LIST: 200,
  MAX_BATCH: 12,
  ALLOWED: ['image/jpeg','image/png','image/webp','image/heic','image/heif','video/mp4','video/quicktime','video/webm']
});
function doGet(e) {
  const isV2 = e && e.parameter && e.parameter.version === '2';
  return HtmlService.createHtmlOutputFromFile(isV2 ? 'V2' : 'Index')
    .setTitle('15 anos da Anne | Momentos')
    .addMetaTag('viewport','width=device-width, initial-scale=1');
}
function folder_() { return DriveApp.getFolderById(CONFIG.FOLDER_ID); }
function listMedia() {
  const files=folder_().getFiles(), result=[];
  const counts=PropertiesService.getScriptProperties().getProperties();
  while(files.hasNext() && result.length < 500) {
    const f=files.next(), mime=f.getMimeType();
    if(!CONFIG.ALLOWED.includes(mime)) continue;
    result.push({id:f.getId(),name:f.getName(),type:mime,created:f.getDateCreated().getTime(),likes:Number(counts['anne_likes_'+f.getId()]||0),
      thumb:'https://drive.google.com/thumbnail?id='+encodeURIComponent(f.getId())+'&sz=w1000',
      view:'https://drive.google.com/file/d/'+encodeURIComponent(f.getId())+'/preview',
      download:'https://drive.google.com/uc?export=download&id='+encodeURIComponent(f.getId())});
  }
  return result.sort((a,b)=>b.created-a.created).slice(0,CONFIG.MAX_LIST);
}
function uploadMedia(item) {
  if(!item || typeof item.name!=='string' || typeof item.mime!=='string' || typeof item.base64!=='string') throw Error('Arquivo inválido.');
  const mime=item.mime.toLowerCase();
  if(!CONFIG.ALLOWED.includes(mime)) throw Error('Formato não permitido.');
  if(item.base64.length > Math.ceil(CONFIG.MAX_BYTES*4/3)+16) throw Error('Arquivo muito grande (limite 15 MB).');
  const bytes=Utilities.base64Decode(item.base64);
  if(!bytes.length || bytes.length>CONFIG.MAX_BYTES) throw Error('Arquivo vazio ou acima de 15 MB.');
  const safeName=item.name.replace(/[^a-zA-Z0-9À-ÿ_.() -]/g,'_').slice(0,100) || 'momento';
  const blob=Utilities.newBlob(bytes,mime,Date.now()+'_'+safeName);
  const file=folder_().createFile(blob);
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW); }
  catch(e) { file.setTrashed(true); throw Error('Não foi possível liberar visualização do arquivo. Verifique permissões do Drive.'); }
  return {id:file.getId(),name:file.getName()};
}

/**
 * Recupera mídia exclusivamente da pasta do evento para visualização e download
 * dentro do site. Não expõe URLs de download do Google Drive na interface.
 * Limite de 15 MB por arquivo, conforme limite atual de upload.
 */
function getMediaData(fileId) {
  if(typeof fileId!=='string' || !/^[a-zA-Z0-9_-]{10,}$/.test(fileId)) throw Error('Identificador inválido.');
  const file=DriveApp.getFileById(fileId);
  const parents=file.getParents();
  let belongs=false;
  while(parents.hasNext()) if(parents.next().getId()===CONFIG.FOLDER_ID) belongs=true;
  if(!belongs) throw Error('Arquivo não pertence ao álbum.');
  const mime=file.getMimeType();
  if(!CONFIG.ALLOWED.includes(mime)) throw Error('Formato não permitido.');
  if(file.getSize()>CONFIG.MAX_BYTES) throw Error('Arquivo acima do limite de visualização direta (15 MB).');
  return {name:file.getName(),mime:mime,base64:Utilities.base64Encode(file.getBlob().getBytes())};
}
