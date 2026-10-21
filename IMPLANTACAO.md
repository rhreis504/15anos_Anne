# Implantação — 15 Anos da Anne

## Código conectado
- `apps-script/Code.gs`: serviço Google Drive.
- `apps-script/Index.html`: interface integrada, upload sequencial de fotos e vídeos, galeria e download.
- `index.html`: protótipo antigo; não usar para o teste conectado.

## Ativar na conta proprietária
1. Abra https://script.google.com na conta Google que possui a pasta do evento e crie um projeto.
2. Substitua `Code.gs` pelo conteúdo de `apps-script/Code.gs`.
3. Adicione um arquivo HTML com o nome **Index** e cole `apps-script/Index.html`.
4. Selecione **Implantar > Nova implantação > App da Web**, executar como **Eu**, acesso **Qualquer pessoa**. Revise e autorize as permissões do Drive.
5. Abra a URL `/exec` em janela anônima, envie uma foto de teste e confirme que aparece na pasta e na galeria.
6. Teste no iPhone e Android. Só imprima o QR Code depois de validar a URL definitiva.

## Limitações importantes
- Máximo 15 MB por arquivo. Vídeos maiores ainda não são suportados.
- Os arquivos são publicados individualmente como “qualquer pessoa com link pode visualizar”; a pasta permanece privada. Quem obtiver o link pode acessar as mídias. Não usar para fotos sensíveis.
- Sem moderação: qualquer visitante com URL pode enviar arquivos, sujeito às cotas do Google Apps Script e Drive. Não é adequado a divulgação irrestrita.
- A galeria atualiza a cada 30 segundos e mostra até 200 itens recentes.
- Vídeos usam pré-visualização do Drive e podem depender do processamento do Google.
- A implantação, o teste real e o QR Code definitivo ainda estão pendentes.
