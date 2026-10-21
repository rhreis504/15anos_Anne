# Anne XV v2.1 — homologação sem Supabase

## Decisão
- Até 200 convidados, com picos desconhecidos de acessos e uploads.
- Fotos e vídeos **somente no Google Drive**.
- Cadastro e curtidas continuam inicialmente nas propriedades do Apps Script; a migração para Google Planilhas é futura e **não foi executada**.
- O frontend de homologação é servido pelo **mesmo domínio Apps Script**, para usar `google.script.run` sem CORS, iframe externo ou bridge.
- GitHub é o repositório do código; não é a aplicação de upload em produção.

## Arquivos de homologação
- `apps-script/V2.html`: interface de testes. Imagens usam miniaturas do Drive com largura 320px; sem download automático da foto original como fallback de cartão; fotos JPEG/PNG/WebP grandes são reduzidas no dispositivo a no máximo 1600px e JPEG 76% quando possível; uploads sequenciais; falhas individuais não interrompem os demais; atualização da galeria a cada 60 segundos quando visível.
- `apps-script/Code.gs`: `doGet(e)` serve `V2` somente com `?version=2`; URL sem parâmetro mantém `Index`.
- `apps-script/Index.html`, `Likes.gs` e `Guests.gs`: não alterados.
- `v2/bridge.js` e `v2/backend/Bridge.html`: **experimentos anteriores não usados nesta arquitetura**; não publicar como solução funcional.

## Passos para homologar — não executados
1. Criar **uma implantação de testes separada** do Apps Script, com o código desta branch e o arquivo HTML `V2`; preservar a implantação atual. A implantação de testes deve usar uma cópia do projeto se houver risco de alterar o código vinculado à produção.
2. Abrir URL `.../exec?version=2` e confirmar cadastro, curtidas, fotos e vídeos.
3. Testar em iPhone e Android usando dados móveis e navegadores internos (WhatsApp e Safari).
4. Testar carga progressiva de 20, 50 e 100 envios concorrentes com arquivos de teste, medindo taxa de erro, tempo e limites de execução; **ainda não testado**.
5. Não distribuir QR Code nem trocar a implantação oficial antes dos testes.

## Limites e riscos conhecidos
- Apps Script pode atingir limites de execuções simultâneas e tamanho/tempo de requisição. Enviar sequencialmente por celular **não garante** capacidade para 100 celulares simultâneos.
- Upload não tem idempotência nem retomada após perda de conexão; não repetir automaticamente uma requisição com resultado desconhecido, pois isso poderia duplicar a mídia.
- Vídeos >15 MB continuam bloqueados; HEIC/MOV podem exigir tratamento específico e não são comprimidos.
- Miniaturas Google Drive podem falhar em alguns navegadores; neste caso o cartão mostra opção para abrir, sem transferir automaticamente 15 MB.
- Fotos JPEG geradas a partir de PNG podem perder transparência; em fotos comuns isso não é relevante.
- Google Planilhas é opcional para metadados e não elimina limites de Apps Script.
- Para garantia operacional em picos altos será necessário avaliar um serviço de upload com autenticação segura para o Drive, e validar custo e quotas.

## Situação
**Código de homologação versionado. Não implantado, não validado no dispositivo, sem teste de carga.**
