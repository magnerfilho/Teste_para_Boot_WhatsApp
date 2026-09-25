import { sendMenuMessage, sendTextMessage } from './whatsapp.js';

const MENU_COMMANDS = new Set(['menu', 'oi', 'olá', 'ola', 'ola!', 'oi!', 'inicio', 'início', 'start', 'hi', 'hello']);

const MENU_BUTTONS = [
    { id: 'hours', title: 'Horário' },
    { id: 'contact', title: 'Contato' },
    { id: 'human', title: 'Atendente' },
];

const REPLIES = {
    hours: 'Nosso horário de atendimento é de segunda a sexta, das 9h às 18h.',
    contact: 'Você pode falar conosco por este WhatsApp. Se preferir e-mail, responda por aqui que um atendente te passa o contato.',
    human: 'Certo! Vou te encaminhar para um atendente. Em horário comercial, alguém te responde por aqui.',
};

function normalizeText(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function extractUserInput(message) {
    if (!message) {
        return { kind: 'empty', value: '' };
    }

    if (message.type === 'interactive') {
        const buttonReply = message.interactive?.button_reply;
        const listReply = message.interactive?.list_reply;

        if (buttonReply?.id) {
            return { kind: 'button', value: buttonReply.id };
        }

        if (listReply?.id) {
            return { kind: 'list', value: listReply.id };
        }
    }

    if (message.type === 'text' || message.text?.body) {
        return { kind: 'text', value: message.text.body || '' };
    }

    return { kind: message.type || 'unknown', value: '' };
}

function resolveIntent(userInput) {
    const normalized = normalizeText(userInput.value);

    if (userInput.kind === 'button' || userInput.kind === 'list') {
        if (REPLIES[userInput.value]) {
            return userInput.value;
        }
    }

    if (normalized === 'horario' || normalized === 'horarios') {
        return 'hours';
    }

    if (normalized === 'contato' || normalized === 'email' || normalized === 'telefone') {
        return 'contact';
    }

    if (normalized === 'atendente' || normalized === 'humano' || normalized === 'pessoa') {
        return 'human';
    }

    if (!normalized || MENU_COMMANDS.has(normalized)) {
        return 'menu';
    }

    return 'unknown';
}

async function handleIncomingMessage(message) {
    const from = message.from;
    const userInput = extractUserInput(message);
    const intent = resolveIntent(userInput);

    console.log(`Intent do bot: ${intent} | origem=${from} | entrada=${JSON.stringify(userInput)}`);

    if (intent === 'menu' || intent === 'unknown') {
        const intro =
            intent === 'unknown'
                ? 'Não entendi essa mensagem. Escolha uma opção do menu para continuar:'
                : 'Olá! Sou o assistente de atendimento. Como posso ajudar?';

        return sendMenuMessage({
            to: from,
            bodyText: intro,
            buttons: MENU_BUTTONS,
        });
    }

    return sendTextMessage({
        to: from,
        text: REPLIES[intent],
    });
}

export { extractUserInput, handleIncomingMessage };
