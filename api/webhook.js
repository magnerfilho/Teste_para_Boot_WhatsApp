import { getConfig } from '../lib/config.js';
import { handleIncomingMessage } from '../lib/bot.js';

const recentMessageIds = new Set();
const MAX_RECENT_MESSAGES = 200;

function rememberMessageId(messageId) {
    if (!messageId) {
        return false;
    }

    if (recentMessageIds.has(messageId)) {
        return true;
    }

    recentMessageIds.add(messageId);

    if (recentMessageIds.size > MAX_RECENT_MESSAGES) {
        const firstId = recentMessageIds.values().next().value;
        recentMessageIds.delete(firstId);
    }

    return false;
}

function extractIncomingMessages(body) {
    const entries = Array.isArray(body?.entry) ? body.entry : [];
    const messages = [];

    for (const entry of entries) {
        const changes = Array.isArray(entry?.changes) ? entry.changes : [];

        for (const change of changes) {
            const value = change?.value;
            const incoming = Array.isArray(value?.messages) ? value.messages : [];

            for (const message of incoming) {
                messages.push(message);
            }
        }
    }

    return messages;
}

export default async function handler(req, res) {
    const config = getConfig();

    if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (!mode && !token && !challenge) {
            return res.status(200).send('Webhook do bot WhatsApp no ar.');
        }

        if (mode === 'subscribe' && token === config.verifyToken) {
            console.log('Webhook validado com sucesso pela Meta.');
            return res.status(200).send(challenge);
        }

        console.warn('Falha na validação do webhook.', { mode, tokenReceived: Boolean(token) });
        return res.status(403).json({ error: 'Token de verificação inválido.' });
    }

    if (req.method === 'POST') {
        const body = req.body || {};

        console.log('POST recebido no webhook:', JSON.stringify(body));

        try {
            const messages = extractIncomingMessages(body);

            if (messages.length === 0) {
                console.log('POST sem mensagem de usuário (provavelmente status de entrega/leitura).');
                return res.status(200).send('EVENT_RECEIVED');
            }

            for (const message of messages) {
                if (rememberMessageId(message.id)) {
                    console.log(`Mensagem duplicada ignorada: ${message.id}`);
                    continue;
                }

                console.log(`Mensagem recebida de ${message.from}: tipo=${message.type} id=${message.id}`);
                await handleIncomingMessage(message);
            }

            return res.status(200).send('EVENT_RECEIVED');
        } catch (error) {
            console.error('Erro ao processar webhook:', error);
            return res.status(200).send('EVENT_RECEIVED');
        }
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
