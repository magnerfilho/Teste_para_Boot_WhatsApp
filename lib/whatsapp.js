import { getConfig, hasRequiredSendConfig } from './config.js';

async function sendWhatsAppRequest(payload) {
    const config = getConfig();

    if (!hasRequiredSendConfig()) {
        console.error('Envio abortado: WHATSAPP_ACCESS_TOKEN ou WHATSAPP_PHONE_NUMBER_ID ausente.');
        return { ok: false, error: 'Credenciais do WhatsApp ausentes.' };
    }

    const url = `https://graph.facebook.com/${config.graphApiVersion}/${config.phoneNumberId}/messages`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('Resposta da Graph API:', JSON.stringify(data));

    if (!response.ok) {
        return { ok: false, error: data };
    }

    return { ok: true, data };
}

async function sendTextMessage({ to, text }) {
    return sendWhatsAppRequest({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { preview_url: false, body: text },
    });
}

async function sendMenuMessage({ to, bodyText, buttons }) {
    return sendWhatsAppRequest({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'interactive',
        interactive: {
            type: 'button',
            body: { text: bodyText },
            action: {
                buttons: buttons.map((button) => ({
                    type: 'reply',
                    reply: {
                        id: button.id,
                        title: button.title,
                    },
                })),
            },
        },
    });
}

export { sendTextMessage, sendMenuMessage };
