# Requisitos — 15 Anos da Anne

## Objetivo
Álbum colaborativo privado para festa familiar, sem planos pagos e sem moderação prévia.

## Fluxo do convidado
1. Escanear QR Code impresso.
2. Abrir página responsiva sem instalar aplicativo e sem login Google.
3. Tirar foto, gravar vídeo ou selecionar mídia existente.
4. Confirmar envio e acompanhar progresso/sucesso/erro.
5. Após upload concluído, a mídia aparece automaticamente na galeria compartilhada.
6. Visualizar, reproduzir vídeos e baixar arquivos.

## Regras
- Publicação automática, sem aprovação do organizador.
- Armazenar arquivos na pasta privada Google Drive `15Anos_Anne` (ID `1V05lAw-hShUQG--NLX-qnmKJN2n3I7NB`).
- Atualização automática da galeria por consulta periódica.
- QR Code final gerado apenas após definir URL pública estável.
- Nunca expor credenciais do Drive no frontend.
- Restringir tipos/tamanhos e proteger contra abuso de upload.
- Para vídeos grandes, validar arquitetura de upload em partes e limites reais da plataforma antes de liberar.
- Não publicar ou ativar sem testes e autorização do proprietário.

## Estado
Requisitos definidos; backend, upload, galeria dinâmica e QR Code ainda não implementados.

## Experiência da galeria — decisão complementar
- Convidados podem escolher várias fotos e vídeos já existentes na galeria do celular e enviar em lote.
- A página oferece ações separadas para tirar foto, gravar vídeo e escolher arquivos existentes.
- Layout sofisticado, monocromático, inspirado na referência Flock, sem copiar marca.
- Mosaico responsivo com fotos e vídeos, visualização ampliada, reprodução e download individual.
- Filtros de navegação: todos os momentos, fotos e vídeos; ordenação por envio recente.
- Seção de pessoas pode mostrar momentos dos convidados sem reconhecimento facial ou identificação automática.
- Galeria lê o conteúdo autorizado da pasta Drive via backend, sem tornar a pasta publicamente editável.
- Exibir progresso e resultados de envios múltiplos, com recuperação de falhas por arquivo.
