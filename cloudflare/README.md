# Anne XV — versão Cloudflare Pages (independente)

Esta versão está na ramificação **cloudflare-pages**, separada da ramificação **main**. O Google Apps Script V0010 e os arquivos do Google Drive não foram alterados. Não exclua a versão original.

## Configure o Pages (tela atual da Cloudflare)

- Repositório: `rhreis504/15anos_Anne`.
- **Production branch: `cloudflare-pages`** (NUNCA `main` para este teste).
- Project name: `15anos-anne` (se disponível).
- Framework preset: `None`.
- Build command: `exit 0` (sem gerar dist).
- Build output directory: `cloudflare`.
- Root directory (advanced): deixar **vazio** (raiz do repositório).
- Arquivo inicial: `cloudflare/index.html`.
- Funções de backend: `functions/api/[[path]].js`.
- Capa: `cloudflare/anne-desktop2.png` (arquivo local, sem depender do GitHub na execução).

Apenas publicar a página estática não ativa a galeria: crie e vincule R2 + D1 antes de liberar os envios.

## Criar banco e armazenamento (dados novos, sem tocar no original)

1. No Cloudflare > Storage & databases > **R2**, crie o bucket `anne-xv-media` no armazenamento **Standard**.
2. No Cloudflare > Storage & databases > **D1**, crie o banco `anne-xv-db`.
3. No banco D1, abra **Console**, cole todo o conteúdo de `cloudflare/schema.sql` e execute.
4. Em Workers & Pages > seu projeto Pages > **Settings > Bindings**:
   - **R2 bucket**, variável **MEDIA** → bucket `anne-xv-media`.
   - **D1 database**, variável **DB** → banco `anne-xv-db`.
5. Configure os mesmos bindings nos ambientes de **Production** e **Preview**, se for usar ambos. Publique uma nova implantação para aplicar as alterações.
6. Teste `https://SEU-SITE.pages.dev/api/health`. Deve responder `"ok":true`, `"r2":true`, `"d1":true`.
7. **Somente após validar os custos, permissões e a moderação de envios**, configure a variável `UPLOADS_ENABLED` como **`true`** e publique novamente. Por padrão, o upload fica desativado para evitar arquivos abusivos.

## Como funciona

- `GET /api/health` — verifica bindings e schema D1.
- `GET /api/media` — lista até 200 fotos/vídeos novos.
- `GET /api/media/{id}` — lê mídia do R2, com Range para vídeo.
- `GET /api/media/{id}?download=1` — baixa o arquivo.
- `POST /api/guest` — registra o primeiro nome do convidado.
- `GET /api/guest/{id}/likes` — recupera as curtidas do convidado.
- `POST /api/like` — registra ou retira curtida; D1 evita duplicadas.
- `POST /api/upload` — recebe imagem/vídeo até 15 MiB via navegador, apenas com convidado cadastrado e uploads habilitados.

## Segurança e limites

Esta é uma galeria pública de festa. O acesso aos arquivos é público para quem tem o link. **Os envios não têm moderação automática**. Para o evento, configure Cloudflare Turnstile/WAF, limites de tráfego e monitore os custos antes de divulgar o QR Code. A API limita 25 arquivos por convidado e 2000 arquivos por evento, mas esses limites não substituem proteção contra abuso por identidades novas. Não armazene fotos sensíveis. Consulte as cotas atuais do plano gratuito.

A página inicial evita redirecionamentos ao Google Apps Script, mas a compatibilidade deve ser validada no Safari, Chrome, Firefox e navegadores de mensagens.

## Galeria existente no Google Drive

A galeria **nova** começa vazia. As fotos e curtidas existentes permanecem no Google Drive/Apps Script original e **não são migradas automaticamente**. Será necessária uma etapa de migração posterior para o R2 e D1, preservando os identificadores ou mapeando-os. Não retire o antigo link/QR Code até concluir a migração e validar tudo.

## Reversão

O site anterior continua em `script.google.com/.../exec`. Como a nova versão usa outro endereço, basta continuar compartilhando o link anterior. A ramificação `main` não foi alterada.
