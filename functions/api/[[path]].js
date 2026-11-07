/**
 * Cloudflare Pages Function -> API do Google Apps Script.
 * Apenas ponte de rede; NAO grava fotos, videos ou curtidas na Cloudflare.
 * Imagens e dados continuam no Google Drive / ScriptProperties do projeto original.
 *
 * Settings > Variables and Secrets:
 *   ANNE_APPS_SCRIPT_URL = URL /exec da nova implantação "Backend Cloudflare"
 *   ANNE_BRIDGE_KEY = mesmo token definido nas propriedades do Apps Script
 */
const JSON_HEADERS = {
  'Content-Type':'application/json; charset=utf-8',
  'Cache-Control':'no-store',
  'X-Content-Type-Options':'nosniff'
};
const MAX_REQUEST_CHARS = 22 * 1024 * 1024;

function reply(data,status=200){return new Response(JSON.stringify(data),{status,headers:JSON_HEADERS})}
function error(message,status=400){return reply({error:message},status)}
function safeId(id){return typeof id==='string'&&/^[a-zA-Z0-9_-]{10,150}$/.test(id)}
function safeGuest(id){return typeof id==='string'&&/^guest_[0-9a-f]{40}$/.test(id)}

async function askAppsScript(env,action,payload){
  const target=String(env.ANNE_APPS_SCRIPT_URL||'').trim();
  const secret=String(env.ANNE_BRIDGE_KEY||'').trim();
  if(!target||secret.length<32)throw Error('A integração com o Google Drive ainda não foi configurada.');
  let url;
  try{url=new URL(target)}catch(e){throw Error('URL da implantação Google inválida.')}
  if(url.protocol!=='https:' || url.hostname!=='script.google.com' || !url.pathname.startsWith('/macros/s/') || !url.pathname.endsWith('/exec')){
    throw Error('A URL da implantação Google não é válida.');
  }
  url.searchParams.set('action',action);
  url.searchParams.set('key',secret);

  // Evitar repetir requisições POST; repetir um upload poderia duplicar arquivos.
  let response=await fetch(url.toString(),{
    method:'POST',
    headers:{'Content-Type':'text/plain; charset=utf-8'},
    body:JSON.stringify(payload),
    redirect:'manual',
    cache:'no-store'
  });

  // ContentService redireciona a resposta para uma URL temporária Google.
  // Buscar essa URL SOMENTE depois da execução inicial, por GET.
  for(let redirects=0;response.status>=300&&response.status<400&&redirects<3;redirects++){
    const loc=response.headers.get('Location');
    if(!loc)throw Error('O Google não forneceu a resposta da integração.');
    const redirected=new URL(loc,response.url);
    if(redirected.protocol!=='https:' || !['script.googleusercontent.com','script.google.com'].includes(redirected.hostname)){
      throw Error('O redirecionamento do Google foi bloqueado por segurança.');
    }
    response=await fetch(redirected.toString(),{method:'GET',redirect:'manual',cache:'no-store'});
  }
  if(!response.ok)throw Error('Não foi possível acessar o Apps Script ('+response.status+').');
  const text=await response.text();
  let json;
  try{json=JSON.parse(text)}catch(e){throw Error('O Google retornou uma página em vez dos dados solicitados. Verifique a implantação.')}
  if(!json||json.ok!==true)throw Error((json&&json.error)||'Falha na integração com o Google.');
  return json.result;
}

async function bodyJson(request,maxChars=8192){
  const n=Number(request.headers.get('content-length')||0);
  if(n>maxChars)throw Error('Dados maiores que o permitido.');
  const raw=await request.text();
  if(raw.length>maxChars)throw Error('Dados maiores que o permitido.');
  let parsed;
  try{parsed=JSON.parse(raw)}catch(e){throw Error('Dados inválidos.')}
  if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw Error('Dados inválidos.');
  return parsed;
}

export async function onRequest({request,env}){
  const url=new URL(request.url);
  const path=url.pathname;
  const method=request.method;
  try{
    if(path==='/api/health'&&method==='GET'){
      const r=await askAppsScript(env,'health',{});
      return reply({ok:true,storage:'google-drive',bridge:r});
    }
    if(path==='/api/media'&&method==='GET'){
      return reply(await askAppsScript(env,'listMedia',{}));
    }
    if(path==='/api/guest'&&method==='POST'){
      const b=await bodyJson(request);
      if(!safeGuest(b.id)||typeof b.name!=='string'||b.name.trim().length<2)return error('Nome ou convidado inválido.',400);
      return reply(await askAppsScript(env,'registerGuest',{name:b.name,id:b.id}));
    }
    let matched=path.match(/^\/api\/guest\/([^/]+)\/likes$/);
    if(matched&&method==='GET'){
      const id=decodeURIComponent(matched[1]);
      if(!safeGuest(id))return error('Convidado inválido.',400);
      return reply(await askAppsScript(env,'getGuestVotes',{id}));
    }
    if(path==='/api/like'&&method==='POST'){
      const b=await bodyJson(request);
      if(!safeId(b.mediaId)||!safeGuest(b.guestId)||![1,-1].includes(b.delta))return error('Dados de curtida inválidos.',400);
      return reply(await askAppsScript(env,'registrarCurtida',b));
    }
    if(path==='/api/media-data'&&method==='POST'){
      const b=await bodyJson(request);
      if(!safeId(b.id))return error('Arquivo inválido.',400);
      return reply(await askAppsScript(env,'getMediaData',b));
    }
    if(path==='/api/upload'&&method==='POST'){
      // O navegador envia JSON/base64 igual ao backend Apps Script original.
      // A ponte apenas encaminha; não persiste no armazenamento Cloudflare.
      const b=await bodyJson(request,MAX_REQUEST_CHARS);
      if(typeof b.name!=='string'||typeof b.mime!=='string'||typeof b.base64!=='string'
       ||b.base64.length<4 || b.base64.length>21*1024*1024)return error('Arquivo inválido ou maior que 15 MB.',413);
      return reply(await askAppsScript(env,'uploadMedia',b));
    }
    return error('Rota não encontrada.',404);
  }catch(e){
    // Nunca retornar URL do Google com o token ou valor do segredo.
    const message=String(e&&e.message||e||'Falha na galeria.');
    const safe=message.slice(0,240).replace(/https?:\/\/[^\s]+/g,'[URL removida]');
    return error(safe,safe.includes('não foi configurada')?503:502);
  }
}
