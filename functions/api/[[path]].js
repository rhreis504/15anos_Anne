/**
 * Anne XV / Cloudflare Pages Functions
 * API de mesmo dominio: R2 MEDIA, D1 DB. Nao usa Google Apps Script.
 * Restricoes: 15 MiB por arquivo, 25 midias por convidado e 2000 no evento.
 * PUBLICAR APENAS DEPOIS de configurar bindings, schema e moderacao.
 */
const MAX_BYTES = 15 * 1024 * 1024;
const MAX_PER_GUEST = 25;
const MAX_TOTAL = 2000;
const GUEST_RE = /^guest_[0-9a-f]{40}$/;
const MEDIA_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const ALLOWED = new Set(['image/jpeg','image/png','image/webp','image/heic','image/heif','video/mp4','video/quicktime','video/webm']);

function json(data,status=200){
 return new Response(JSON.stringify(data),{status,headers:{
  'Content-Type':'application/json; charset=utf-8',
  'Cache-Control':'no-store',
  'X-Content-Type-Options':'nosniff'
 }});
}
function err(message,status=400){return json({error:message},status)}
function cleanName(name){
 return String(name||'').replace(/[\u0000-\u001f\u007f<>"/\\]/g,'_').trim().slice(0,120)||'momento-anne';
}
function validSignature(mime,bytes){
 const str=(offset,n)=>String.fromCharCode(...bytes.slice(offset,offset+n));
 if(mime==='image/jpeg')return bytes[0]===255 && bytes[1]===216 && bytes[2]===255;
 if(mime==='image/png')return bytes[0]===137 && str(1,3)==='PNG';
 if(mime==='image/webp')return str(0,4)==='RIFF' && str(8,4)==='WEBP';
 if(mime==='video/webm')return bytes[0]===26 && bytes[1]===69 && bytes[2]===223 && bytes[3]===163;
 if(mime==='image/heic'||mime==='image/heif')return str(4,4)==='ftyp' && /^(heic|heix|hevc|hevx|mif1|msf1)$/.test(str(8,4));
 if(mime==='video/mp4'||mime==='video/quicktime')return str(4,4)==='ftyp';
 return false;
}
function mimeFromName(name){
 const ext=String(name).toLowerCase().split('.').pop();
 return ({jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',heic:'image/heic',heif:'image/heif',mp4:'video/mp4',mov:'video/quicktime',webm:'video/webm'})[ext]||'';
}
async function smallJson(request){
 if(Number(request.headers.get('Content-Length')||0)>8192)throw Error('Dados muito grandes.');
 const raw=await request.text();
 if(raw.length>8192)throw Error('Dados muito grandes.');
 try{return JSON.parse(raw)}catch(_e){throw Error('Dados invalidos.')}
}
async function checkConfig(env){
 if(!env.DB||!env.MEDIA)return false;
 try{await env.DB.prepare('SELECT id FROM guests LIMIT 1').first();await env.DB.prepare('SELECT id FROM media LIMIT 1').first();return true}catch(_e){return false}
}
async function listMedia(env){
 const rows=await env.DB.prepare('SELECT id,name,mime,created_at,likes FROM media WHERE hidden=0 ORDER BY created_at DESC LIMIT 200').all();
 return json((rows.results||[]).map(r=>({
  id:r.id,name:r.name,type:r.mime,created:r.created_at,likes:Number(r.likes||0),
  thumb:'/api/media/'+r.id,
  view:'/api/media/'+r.id,
  download:'/api/media/'+r.id+'?download=1'
 })));
}
async function registerGuest(request,env){
 const body=await smallJson(request);
 const id=String(body.id||''),name=String(body.name||'').trim().slice(0,50);
 if(!GUEST_RE.test(id)||name.length<2)return err('Informe um nome valido.',400);
 await env.DB.prepare('INSERT OR IGNORE INTO guests(id,name,created_at) VALUES(?,?,?)').bind(id,name,Date.now()).run();
 const guest=await env.DB.prepare('SELECT name FROM guests WHERE id=?').bind(id).first();
 return json({name:guest.name});
}
async function guestVotes(id,env){
 if(!GUEST_RE.test(id))return err('Convidado invalido.',400);
 const votes=await env.DB.prepare('SELECT media_id FROM votes WHERE guest_id=? LIMIT 500').bind(id).all();
 return json((votes.results||[]).map(v=>v.media_id));
}
async function likeMedia(request,env){
 const body=await smallJson(request);
 const mediaId=String(body.mediaId||''),guestId=String(body.guestId||''),delta=body.delta;
 if(!GUEST_RE.test(guestId)||!MEDIA_RE.test(mediaId)||![1,-1].includes(delta))return err('Curtida invalida.',400);
 const guest=await env.DB.prepare('SELECT id FROM guests WHERE id=?').bind(guestId).first();
 if(!guest)return err('Informe seu nome antes de curtir.',403);
 const item=await env.DB.prepare('SELECT id FROM media WHERE id=? AND hidden=0').bind(mediaId).first();
 if(!item)return err('Foto ou video nao encontrado.',404);
 if(delta===1)await env.DB.prepare('INSERT OR IGNORE INTO votes(guest_id,media_id,created_at) VALUES(?,?,?)').bind(guestId,mediaId,Date.now()).run();
 else await env.DB.prepare('DELETE FROM votes WHERE guest_id=? AND media_id=?').bind(guestId,mediaId).run();
 const result=await env.DB.prepare('SELECT likes FROM media WHERE id=?').bind(mediaId).first();
 return json({likes:Math.max(0,Number(result.likes||0))});
}
async function uploadMedia(request,env){
 if(env.UPLOADS_ENABLED!=='true')return err('Os envios ainda nao foram liberados nesta nova versao.',503);
 const guestId=String(request.headers.get('X-Guest-Id')||'');
 if(!GUEST_RE.test(guestId))return err('Informe seu nome para enviar.',403);
 const guest=await env.DB.prepare('SELECT id FROM guests WHERE id=?').bind(guestId).first();
 if(!guest)return err('Convidado nao cadastrado.',403);
 const userCount=await env.DB.prepare('SELECT COUNT(*) AS total FROM media WHERE guest_id=?').bind(guestId).first();
 if(Number(userCount.total)>=MAX_PER_GUEST)return err('Limite de 25 arquivos por convidado atingido.',429);
 const eventCount=await env.DB.prepare('SELECT COUNT(*) AS total FROM media').first();
 if(Number(eventCount.total)>=MAX_TOTAL)return err('Limite de arquivos do evento atingido.',429);
 const headerName=request.headers.get('X-File-Name')||'';
 let fileName;
 try{fileName=cleanName(decodeURIComponent(headerName))}catch(_e){return err('Nome de arquivo invalido.',400)}
 let mime=String(request.headers.get('Content-Type')||'').split(';')[0].toLowerCase().trim();
 if(mime==='application/octet-stream'||!mime)mime=mimeFromName(fileName);
 if(!ALLOWED.has(mime))return err('Formato nao permitido.',415);
 if(Number(request.headers.get('Content-Length')||0)>MAX_BYTES)return err('Arquivo maior que 15 MB.',413);
 const data=await request.arrayBuffer();
 if(!data.byteLength||data.byteLength>MAX_BYTES)return err('Arquivo vazio ou maior que 15 MB.',413);
 if(!validSignature(mime,new Uint8Array(data,0,Math.min(data.byteLength,16))))return err('O tipo do arquivo nao corresponde ao conteudo.',415);
 const id=crypto.randomUUID(),now=Date.now();
 await env.MEDIA.put('media/'+id,data,{httpMetadata:{contentType:mime},customMetadata:{name:fileName}});
 try{
  await env.DB.prepare('INSERT INTO media(id,guest_id,name,mime,bytes,created_at,likes,hidden) VALUES(?,?,?,?,?,?,0,0)')
   .bind(id,guestId,fileName,mime,data.byteLength,now).run();
 }catch(e){await env.MEDIA.delete('media/'+id).catch(()=>{});throw e}
 return json({id,name:fileName},201);
}
async function serveMedia(request,env,id){
 if(!MEDIA_RE.test(id))return err('Arquivo invalido.',404);
 const item=await env.DB.prepare('SELECT name,mime,bytes FROM media WHERE id=? AND hidden=0').bind(id).first();
 if(!item)return err('Arquivo nao encontrado.',404);
 const headers=new Headers({
  'Content-Type':item.mime,
  'Accept-Ranges':'bytes',
  'X-Content-Type-Options':'nosniff',
  'Cache-Control':'public, max-age=300',
  'Content-Disposition':new URL(request.url).searchParams.has('download')
   ? "attachment; filename*=UTF-8''"+encodeURIComponent(item.name)
   : 'inline'
 });
 if(request.method==='HEAD'){headers.set('Content-Length',String(item.bytes));return new Response(null,{status:200,headers})}
 const wantsRange=request.headers.has('Range');
 const object=await env.MEDIA.get('media/'+id,wantsRange?{range:request.headers}:{});
 if(!object||!object.body)return err('Midia indisponivel.',404);
 let status=200;
 if(wantsRange&&object.range){
  status=206;
  const from=object.range.offset||0,length=object.range.length||object.size;
  headers.set('Content-Range','bytes '+from+'-'+(from+length-1)+'/'+object.size);
  headers.set('Content-Length',String(length));
 }else headers.set('Content-Length',String(object.size));
 headers.set('ETag',object.httpEtag);
 return new Response(object.body,{status,headers});
}
export async function onRequest({request,env}){
 const url=new URL(request.url),path=url.pathname,method=request.method;
 try{
  if(method==='GET'&&path==='/api/health'){
   const configured=await checkConfig(env);
   return json({ok:configured,r2:!!env.MEDIA,d1:!!env.DB,
    uploadsEnabled:env.UPLOADS_ENABLED==='true',
    message:configured?'Conexao com R2 e D1 OK':'Configurar R2, D1 e executar schema.sql'},configured?200:503);
  }
  if(!env.DB||!env.MEDIA)return err('A nova versao ainda nao foi configurada.',503);
  if(!await checkConfig(env))return err('Banco de dados nao inicializado. Execute schema.sql no D1.',503);
  if(method==='GET'&&path==='/api/media')return listMedia(env);
  if(method==='POST'&&path==='/api/guest')return registerGuest(request,env);
  if(method==='POST'&&path==='/api/like')return likeMedia(request,env);
  if(method==='POST'&&path==='/api/upload')return uploadMedia(request,env);
  const votes=path.match(/^\/api\/guest\/([^/]+)\/likes$/);
  if(method==='GET'&&votes)return guestVotes(decodeURIComponent(votes[1]),env);
  const media=path.match(/^\/api\/media\/([^/]+)$/);
  if((method==='GET'||method==='HEAD')&&media)return serveMedia(request,env,media[1]);
  return err('Rota nao encontrada.',404);
 }catch(e){
  if(e&&/Dados (muito grandes|invalidos)/.test(e.message||''))return err(e.message,400);
  console.error('Anne API:',e);
  return err('Servico temporariamente indisponivel.',500);
 }
}
