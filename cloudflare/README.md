# 15 anos da Anne — Cloudflare Pages + Google Drive

Esta é a versão de trabalho da ramificação `cloudflare-pages`. A original `main` e a implantação do Google Apps Script **V0010** ficam preservadas.

## O que fica onde

- **Cloudflare Pages**: HTML/CSS/JS, imagem `anne-desktop2.png` e função que encaminha chamadas.
- **Google Apps Script original**: faz cadastro, upload, lista fotos e registra curtidas.
- **Google Drive original**: continua armazenando TODAS as fotos e vídeos.
- **ScriptProperties original**: preserva o histórico de convidados e curtidas. Não há migração.
- **Cloudflare R2, D1**: **não são usados** neste modelo. Não ativar assinatura R2.
- A API /api do Pages é uma ponte e não salva fotos/vídeos na Cloudflare.

## 1. Adicionar a ponte ao Apps Script existente sem alterar a V0010

1. Acesse https://script.google.com/home, abra **Anne XV - Homologação v2.1**.
2. Clique em **+** na seção Arquivos > **Script**.
3. Nome: `CloudflareBridge`.
4. Cole o conteúdo inteiro de:
   https://github.com/rhreis504/15anos_Anne/blob/cloudflare-pages/apps-script/CloudflareBridge.gs
5. Salve. Não substitua `Código.gs`, `Index.html`, `Likes.gs`, `Guests.gs`.
6. No menu de funções selecione `anneGerarTokenPonte` > **Executar**. Autorize se necessário.
7. Engrenagem **Configurações do projeto** > **Propriedades do script**: copie o valor `ANNE_BRIDGE_KEY` para uso secreto na Cloudflare. **Nunca coloque esse valor no GitHub ou no HTML.**

**Proteção:** uma implantação versionada existente utiliza a versão estática antiga, por isso V0010 permanece funcionando mesmo depois de acrescentar um arquivo e salvar o rascunho. Não editar, arquivar, excluir ou atualizar V0010.

## 2. Criar NOVA implantação do backend

1. Apps Script > **Implantar** > **Nova implantação**, não "Gerenciar implantações".
2. Tipo **App da Web**.
3. Descrição: `Backend Cloudflare - Anne`.
4. Executar como: **Eu**.
5. Quem pode acessar: **Qualquer pessoa**.
6. Clique **Implantar** e autorize as permissões se pedidas.
7. Copie a URL `https://script.google.com/macros/s/.../exec` dessa **nova implantação**. Ela é uma URL separada da V0010.

O código da nova implantação contém a função `doPost` da ponte, mas mantém `doGet` do projeto original.

## 3. Configurar as duas variáveis Cloudflare Pages

1. Dashboard Cloudflare > **Workers & Pages** > projeto `15anos-anne`.
2. **Settings > Variables and Secrets**, ambiente **Production**, clique **Add**:
   - `ANNE_APPS_SCRIPT_URL`: URL da **nova** implantação `/exec`.
   - `ANNE_BRIDGE_KEY`: chave gerada no Apps Script, clique em **Encrypt** para guardar como segredo.
3. **Save**, depois crie **nova implantação do Pages** (Redeploy / Retry deployment ou faça novo commit nesta ramificação).
4. Abra `https://15anos-anne.pages.dev/api/health`. Deve mostrar JSON com `"ok":true` e `"storage":"google-drive"`.

**NÃO** configure `MEDIA`, `DB`, `UPLOADS_ENABLED`, `anne-xv-media` nem R2. O banco D1 `anne-xv-db` criado anteriormente pode ficar sem uso; não será consultado pelo site.

## 4. Testes antes de compartilhar os QR Codes

- Safari normal e Chrome: site abre diretamente sem solicitar permissões do Google.
- Entrada: nome do convidado registrado.
- Galeria: carrega itens **da mesma pasta original do Drive**.
- Upload: envia uma foto pequena (JPG/PNG), confere que apareceu na pasta original e na galeria.
- Curtidas: curtir/descurtir e conferir contagem.
- Vídeos: testar visualização no iPhone.
- Download: abrir e baixar uma foto.
- Confira em janela privativa para testar um convidado que nunca entrou.

Se a ponte não estiver ativa, o cadastro não impede mais a navegação pelo site, mas a galeria mostrará indisponibilidade até configurar a integração. **Não considerar isso como operação completa.**

## 5. Limites e riscos

- O Apps Script original limita arquivos a **15 MB** e publica cada mídia com permissão `Qualquer pessoa com link pode visualizar`.
- Arquivos maiores não passam; Google Apps Script tem cotas diárias e pode limitar o evento.
- A função Pages conta para a franquia gratuita de requests do Cloudflare Workers; o site não grava mídias no Cloudflare.
- A API do Google é protegida por chave em propriedade do Script e segredo do Pages, mas a aplicação de convidados é pública; recomenda-se configurar WAF/rate limit para evitar uploads indevidos.
- **Teste os uploads reais antes de imprimir os QR Codes**. O ContentService do Google Apps Script redireciona respostas e o proxy precisa acompanhar esses redirecionamentos; a compatibilidade depende do teste de ponta a ponta.
