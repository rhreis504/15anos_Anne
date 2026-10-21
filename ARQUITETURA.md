# Arquitetura — v0.1.0

- Frontend estático responsivo: `index.html`.
- Backend planejado: Google Apps Script Web App com identidade de execução do proprietário e configuração privada do ID da pasta.
- Google Drive: pasta privada do evento.
- API futura: listagem paginada, upload autenticado por sessão de evento, download e moderação.
- Não usar permissões públicas de edição na pasta; não expor OAuth tokens ou service account no JavaScript.
- Para produção: avaliar limites de execução, upload de vídeos grandes, antispam, consentimento dos convidados e política de retenção.
