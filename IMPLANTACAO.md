# 15 Anos da Anne — Versão 1.0.0

Álbum colaborativo de fotos e vídeos, inspirado em uma estética editorial preta e branca.

## Arquivos
- `apps-script/Code.gs`: backend Google Apps Script
- `apps-script/Index.html`: página servida pelo Apps Script
- `index.html`: protótipo anterior (não é o frontend conectado)

## Implantação (necessária para funcionamento)
1. Na conta Google pessoal que possui a pasta `15Anos_Anne`, abra https://script.google.com e crie um projeto.
2. Cole `apps-script/Code.gs` no arquivo `Code.gs`.
3. A interface HTML conectada ainda precisa ser adicionada como arquivo **Index** no projeto Apps Script; o template atual é apenas ilustrativo.
4. Clique em **Implantar > Nova implantação > App da Web**.
5. Executar como **Eu**; acesso **Qualquer pessoa**. Autorize o acesso ao Google Drive com sua conta.
6. Copie a URL terminada em `/exec` e teste em janela anônima com uma foto pequena.
7. Teste em iPhone e Android, vídeo e múltiplos arquivos. Só depois gere o QR Code final com a URL de implantação.

## Segurança e limitações
- O acesso ao álbum é por URL pública; não há login dos convidados.
- Os arquivos enviados são configurados como **qualquer pessoa com o link pode visualizar**, embora a pasta continue privada. Evite conteúdo sensível e compartilhe o QR apenas com convidados.
- Não há moderação: qualquer pessoa com acesso à página pode enviar arquivos permitidos.
- Limite de **15 MB por arquivo** nesta primeira implementação, inclusive vídeos. Muitos vídeos de celular ultrapassam isso e serão rejeitados. É necessária arquitetura de upload em partes ou outro backend para vídeos maiores.
- Aplicam-se limites de tempo, armazenamento e cotas do Apps Script e Google Drive. Teste a carga antes da festa.
- Arquivos HEIC/HEIF podem não gerar miniaturas em todos os navegadores.
- O site não está implantado automaticamente; é necessário executar os passos acima na conta proprietária.
- O Google Drive não é um CDN; a velocidade e disponibilidade da galeria dependem do serviço.
- Sem reconhecimento facial, sem agrupamento automático por pessoa e sem impressão de QR nesta versão.
