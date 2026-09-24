export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Política de Privacidade</title>
    </head>
    <body>
        <h1>Política de Privacidade</h1>
        <p>Este aplicativo utiliza a API do WhatsApp Business apenas para processamento de mensagens em tempo real e não compartilha dados pessoais com terceiros.</p>
    </body>
    </html>
  `);
}