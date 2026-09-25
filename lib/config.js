const GRAPH_API_VERSION = 'v22.0';

function getConfig() {
    return {
        graphApiVersion: process.env.WHATSAPP_GRAPH_VERSION || GRAPH_API_VERSION,
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '1272235799314854',
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
        verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'meu_token_secreto_123',
    };
}

function hasRequiredSendConfig() {
    const config = getConfig();
    return Boolean(config.accessToken && config.phoneNumberId);
}

export { getConfig, hasRequiredSendConfig };
