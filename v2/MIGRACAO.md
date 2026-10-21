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
