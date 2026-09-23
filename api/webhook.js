export default async function handler(req, res) {
  // 1. VALIDAÇÃO DO WEBHOOK (Requisição GET da Meta)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Defina o seu token de verificação aqui (o mesmo que você colocará no painel da Meta)
    const MY_VERIFY_TOKEN = 'meu_token_secreto_123';

    if (mode === 'subscribe' && token === MY_VERIFY_TOKEN) {
      console.log('Webhook validado com sucesso!');
      return res.status(200).send(challenge);
    } else {
      return res.status(403).json({ error: 'Token de verificação inválido.' });
    }
  }

  // 2. RECEBIMENTO DE MENSAGENS (Requisição POST da Meta)
  if (req.method === 'POST') {
    const body = req.body;

    // Log para você visualizar no painel da Vercel o que a Meta enviou
    console.log('Mensagem/Evento recebido:', JSON.stringify(body, null, 2));

    // A Meta exige resposta 200 OK imediata para saber que você recebeu o evento
    return res.status(200).send('EVENT_RECEIVED');
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}