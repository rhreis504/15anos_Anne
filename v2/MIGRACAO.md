# ATUALIZAÇÃO 2.1: ARQUITETURA REVISADA

A proposta de GitHub Pages + iframe/bridge foi descartada como implantação principal. A homologação agora utiliza `apps-script/V2.html` no próprio Google Apps Script, com Google Drive como repositório de mídia. Consulte `v2/HOMOLOGACAO_V2_1.md`. Arquivos de bridge são experimentais e não devem ser publicados.

# Anne XV v2.0.0 — migração GitHub Pages

Status: **em desenvolvimento; não publicar como versão oficial**.

## Ambientes
- Produção atual: Google Apps Script, usando `apps-script/Index.html`, `Code.gs`, `Guests.gs` e `Likes.gs`.
- GitHub Pages atual: `index.html` da raiz, preservado.
- Nova versão: `v2/index.html`, cópia integral da interface para adaptação, na branch `anne-v2-mobile-first`.

## Integração ainda necessária
O arquivo `v2/index.html` ainda chama `google.script.run`, indisponível no GitHub Pages. **Não está funcional fora do Apps Script**. Criar API HTTP segura para cadastro, listagem, curtidas, upload e acesso a mídias. Não expor segredos ou tokens no navegador. Validar CORS e limitações de upload.

## Estratégia para dados móveis
1. Criar miniaturas WebP/AVIF pequenas, distribuídas por hospedagem estática/CDN.
2. Carregar apenas as miniaturas visíveis, sem baixar originais em segundo plano.
3. Reproduzir vídeo somente após toque, com codec compatível com iPhone.
4. Comprimir fotos antes do envio e oferecer retomada/reenvio de upload.
5. Testar com rede móvel lenta, Safari iOS e Android antes de trocar o QR Code.

## Critério de publicação
Não substituir `index.html` da raiz até testar todas as funções e obter autorização para publicação. Manter a implantação atual do Apps Script intacta.

## Protótipo de integração (branch de homologação)
- `v2/bridge.js`: adaptador para as chamadas da interface.
- `v2/config.js`: URL de homologação ainda vazia.
- `v2/backend/Bridge.html`: protótipo de ponte com filtro de origem.
- A ponte **não está implantada nem validada**. O HtmlService do Apps Script utiliza iframes internos e pode impedir a comunicação direta entre GitHub Pages e o iframe; portanto, **não considerar este transporte pronto para produção**.
- Não alterar a implantação de produção do Apps Script até escolher e testar um canal HTTP/servidor compatível, especialmente para uploads.
- Os arquivos originais e o backend existente permanecem intocados.
