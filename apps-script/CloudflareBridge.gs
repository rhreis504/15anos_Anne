/**
 * Anne XV — ponte Cloudflare Pages -> Apps Script existente (Google Drive).
 *
 * ADICIONE ESTE ARQUIVO no MESMO projeto Apps Script "Anne XV - Homologação v2.1",
 * sem substituir Code.gs, Likes.gs, Guests.gs ou Index.html.
 *
 * Depois configure em Configurações do projeto > Propriedades do script:
 * ANNE_BRIDGE_KEY = um token forte e secreto que só você conhece.
 *
 * Crie uma NOVA implantação de App da Web "Backend Cloudflare",
 * Executar como: Eu; Quem pode acessar: Qualquer pessoa.
 *
 * A implantação V0010 atual continua preservada e funcionando.
 * A ponte executa as funções já existentes e usa a MESMA pasta Drive e
 * as MESMAS propriedades de convidados/curtidas.
 */
function anneBridgeOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Execute UMA VEZ pelo botão "Executar" no editor Apps Script.
 * A chave fica armazenada nas Propriedades do script (não no HTML).
 * Copie a chave em Configurações do projeto > Propriedades do script
 * para a variável secreta ANNE_BRIDGE_KEY na Cloudflare Pages.
 */
function anneGerarTokenPonte() {
  var props = PropertiesService.getScriptProperties();
  var old = props.getProperty('ANNE_BRIDGE_KEY');
  if (old && old.length >= 32) {
    Logger.log('A chave da ponte já existe. Veja em Configurações do projeto > Propriedades do script.');
    return;
  }
  var key = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  props.setProperty('ANNE_BRIDGE_KEY',key);
  Logger.log('Chave criada. Veja em Configurações do projeto > Propriedades do script.');
}

function doPost(e) {
  try {
    var expected = PropertiesService.getScriptProperties().getProperty('ANNE_BRIDGE_KEY');
    var supplied = e && e.parameter && String(e.parameter.key || '');
    if (!expected || expected.length < 32 || !supplied || supplied !== expected) {
      return anneBridgeOutput_({ok:false,error:'Acesso não autorizado.'});
    }

    var action = String((e.parameter && e.parameter.action) || '');
    var raw = e.postData && e.postData.contents || '';
    if (!raw || raw.length > 22 * 1024 * 1024) {
      return anneBridgeOutput_({ok:false,error:'Dados ausentes ou muito grandes.'});
    }
    var data;
    try { data = JSON.parse(raw); }
    catch (parseError) { return anneBridgeOutput_({ok:false,error:'JSON inválido.'}); }

    var result;
    switch (action) {
      case 'health':
        result = {status:'ok',provider:'google-drive'};
        break;
      case 'listMedia':
        result = listMedia();
        break;
      case 'registerGuest':
        result = registerGuest(data.name, data.id);
        break;
      case 'getGuestVotes':
        result = getGuestVotes(data.id);
        break;
      case 'registrarCurtida':
        result = registrarCurtida(data.mediaId, data.delta, data.guestId);
        break;
      case 'getMediaData':
        result = getMediaData(data.id);
        break;
      case 'uploadMedia':
        result = uploadMedia(data);
        break;
      default:
        return anneBridgeOutput_({ok:false,error:'Operação não permitida.'});
    }
    return anneBridgeOutput_({ok:true,result:result});
  } catch (error) {
    return anneBridgeOutput_({
      ok:false,
      error:String(error && error.message || error || 'Erro no serviço da galeria.').slice(0,250)
    });
  }
}
