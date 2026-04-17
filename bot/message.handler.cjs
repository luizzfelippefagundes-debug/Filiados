const offerService = require('./offer.service.cjs');
const whatsappService = require('./whatsapp.service.cjs');

/**
 * Handler de Mensagens (Foco em UX e Resiliencia)
 */
class MessageHandler {
    constructor() {
        this.userStates = new Map();
        this.TARGET_GROUP = process.env.WHATSAPP_GROUP_ID;
    }

    async handle(webhookData) {
        const message = webhookData.data?.message;
        const remoteJid = webhookData.data?.key?.remoteJid;
        const fromMe = webhookData.data?.key?.fromMe;
        const messageId = webhookData.data?.key?.id;
        const senderJid = webhookData.sender;

        if (!message || !remoteJid) return;

        const text = message.conversation || message.extendedTextMessage?.text || '';

        // Ignorar mensagens enviadas pelo próprio bot (exceto links para auto-teste)
        if (fromMe && !this.isMercadoLivreLink(text)) return;

        console.log(`📩 [MessageHandler] Mensagem de ${senderJid}: "${text}"`);

        // ESTRATEGIA DE ROTEAMENTO PREMIUM:
        // Respondemos SEMPRE citando a mensagem original e usando o SENDER real
        const isGroup = remoteJid.endsWith('@g.us');
        const destino = isGroup ? remoteJid : senderJid;

        // Caso 1: Novo Link
        if (this.isMercadoLivreLink(text)) {
            return await this.handleNewLink(destino, text, messageId);
        }

        // Caso 2: Resposta S/N (Aqui o chatJid ja deve estar no estado como destino certo)
        const state = this.userStates.get(destino);
        if (state && state.status === 'awaiting_confirmation') {
            return await this.handleConfirmation(destino, text.toUpperCase(), state, messageId);
        }
    }

    isMercadoLivreLink(text) {
        return text.includes('mercadolivre.com.br');
    }

    async handleNewLink(chatJid, url, messageId) {
        try {
            const product = await offerService.extract(url);
            if (!product) throw new Error('Dados nao encontrados');

            this.userStates.set(chatJid, {
                status: 'awaiting_confirmation',
                product,
                originalUrl: url
            });

            const preview = `🛍️ *${product.title}*
💰 R$ ${product.price.toString().replace('.', ',')}

⚠️ *Deseja postar no grupo?*
Responda: *S* ou *N*`;

            await whatsappService.sendImage(chatJid, product.image, preview, messageId);
        } catch (error) {
            console.error(`❌ [MessageHandler] Erro:`, error.message);
            await whatsappService.sendText(chatJid, '❌ Erro ao processar o link. Tente novamente.', messageId);
        }
    }

    async handleConfirmation(chatJid, answer, state, messageId) {
        if (answer === 'S') {
            const affiliateLink = offerService.generateAffiliateLink(state.originalUrl);
            const finalMessage = offerService.formatSaleMessage(state.product, affiliateLink);

            await whatsappService.sendImage(this.TARGET_GROUP, state.product.image, finalMessage);
            await whatsappService.sendText(chatJid, '✅ *Postado no grupo com sucesso!*', messageId);
            this.userStates.delete(chatJid);
        } else if (answer === 'N') {
            await whatsappService.sendText(chatJid, '👍 *Cancelado.*', messageId);
            this.userStates.delete(chatJid);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = new MessageHandler();
