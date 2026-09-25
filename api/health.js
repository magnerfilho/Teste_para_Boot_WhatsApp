import { getConfig } from '../lib/config.js';

export default function handler(req, res) {
    const config = getConfig();

    return res.status(200).json({
        ok: true,
        service: 'whatsapp-bot',
        hasAccessToken: Boolean(config.accessToken),
        hasPhoneNumberId: Boolean(config.phoneNumberId),
        hasVerifyToken: Boolean(config.verifyToken),
        graphApiVersion: config.graphApiVersion,
    });
}
