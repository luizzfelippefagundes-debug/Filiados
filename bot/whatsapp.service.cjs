const axios = require('axios');

/**
 * Servico de WhatsApp (Evolution API)
 */
class WhatsAppService {
    constructor() {
        this.baseUrl = process.env.EVOLUTION_URL;
        this.apiKey = process.env.EVOLUTION_KEY;
        this.instance = process.env.INSTANCE_NAME;
    }

    async _request(method, path, data = {}) {
        try {
            const url = `${this.baseUrl}${path}?checkContact=false`;
            console.log(`\n🔗 [WhatsAppService] ${method} ${url}`);

            const response = await axios({
                method,
                url,
                headers: { 'apikey': this.apiKey, 'Content-Type': 'application/json' },
                data
            });
            return response.data;
        } catch (error) {
            const errorData = error.response?.data || error.message;
            console.error(`❌ [WhatsAppService] Erro:`, JSON.stringify(errorData, null, 2));
            throw error;
        }
    }

    async sendText(to, text, quotedId = null) {
        console.log(`📤 Enviando texto para ${to}...`);
        const payload = {
            number: to,
            text,
            delay: 500
        };
        if (quotedId) {
            payload.quoted = { key: { id: quotedId } };
        }
        return this._request('POST', `/message/sendText/${this.instance}`, payload);
    }

    async sendImage(to, media, caption, quotedId = null) {
        console.log(`📤 Enviando imagem para ${to}...`);
        const payload = {
            number: to,
            mediatype: 'image',
            media: media,
            caption: caption,
            delay: 500
        };
        if (quotedId) {
            payload.quoted = { key: { id: quotedId } };
        }
        return this._request('POST', `/message/sendMedia/${this.instance}`, payload);
    }
}

module.exports = new WhatsAppService();
