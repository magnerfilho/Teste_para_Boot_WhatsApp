export default async function handler(req, res) {
  // 1. VALIDAÇÃO DO WEBHOOK (Requisição GET da Meta)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const MY_VERIFY_TOKEN = 'meu_token_secreto_123';

    if (mode === 'subscribe' && token === MY_VERIFY_TOKEN) {
      console.log('Webhook validado com sucesso!');
      return res.status(200).send(challenge);
    } else {
      return res.status(403).json({ error: 'Token de verificação inválido.' });
    }
  }

  // 2. RECEBIMENTO E RESPOSTA AUTOMÁTICA (Requisição POST da Meta)
  if (req.method === 'POST') {
    const body = req.body;

    try {
      // Verifica se o evento contém mensagens
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      // Se existir uma mensagem recebida (ignora notificações de leitura/entrega)
      if (message) {
        const from = message.from; // Número do usuário que mandou a mensagem
        const textReceived = message.text?.body || ''; // Texto enviado pelo usuário

        console.log(`Mensagem recebida de ${from}: "${textReceived}"`);

        // Mensagem que o bot vai enviar de volta
        const replyText = `Olá! Recebi sua mensagem: "${textReceived}". Este é um teste do meu bot!`;

        // Envia a resposta de volta usando a Graph API da Meta
        await sendWhatsAppMessage(from, replyText);
      }

      return res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
      console.error('Erro ao processar mensagem do Webhook:', error);
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}

// Função auxiliar para enviar a mensagem através da API da Meta
async function sendWhatsAppMessage(to, text) {
  // ID do número de telefone de teste (ou do seu número em produção)
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '1272235799314854';
  
  // Token de acesso gerado no painel do Meta for Developers
  const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!ACCESS_TOKEN) {
    console.error('ERRO: O Token de acesso do WhatsApp (WHATSAPP_ACCESS_TOKEN) não foi configurado!');
    return;
  }

  const url = `https://graph.facebook.com/v26.0/${PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'text',
    text: { body: text }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  console.log('Resposta do envio da Meta:', data);
}