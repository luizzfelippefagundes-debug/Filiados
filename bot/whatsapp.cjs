const http = require('http');
const https = require('https');

class WhatsApp {
    constructor(baseUrl, apiKey, instanceName) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.instance = instanceName;
    }

    /**
     * Cria instância no Evolution API e retorna QR code
     */
    async createInstance() {
        return this._request('POST', '/instance/create', {
            instanceName: this.instance,
            integration: 'WHATSAPP-BAILEYS',
            qrcode: true
        });
    }

    /**
     * Busca QR code para escanear
     */
    async getQrCode() {
        return this._request('GET', `/instance/connect/${this.instance}`);
    }

    /**
     * Verifica status da conexão
     */
    async getStatus() {
        return this._request('GET', `/instance/connectionState/${this.instance}`);
    }

    /**
     * Lista todos os grupos
     */
    async listGroups() {
        return this._request('GET', `/group/fetchAllGroups/${this.instance}?getParticipants=false`);
    }

    /**
     * Envia mensagem de texto para um grupo ou número
     */
    async sendText(to, text) {
        return this._request('POST', `/message/sendText/${this.instance}`, {
            number: to,
            text: text
        });
    }

    /**
     * Envia imagem com legenda (caption)
     */
    async sendImage(to, media, caption) {
        return this._request('POST', `/message/sendMedia/${this.instance}`, {
            number: to,
            mediatype: 'image',
            media: media,
            caption: caption
        });
    }

    _request(method, path, body) {
        return new Promise((resolve, reject) => {
            const url = new URL(this.baseUrl + path);
            const client = url.protocol === 'https:' ? https : http;

            const options = {
                hostname: url.hostname,
                port: url.port,
                path: url.pathname + url.search,
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.apiKey
                }
            };

            const req = client.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch {
                        resolve(data);
                    }
                });
            });

            req.on('error', reject);
            if (body) req.write(JSON.stringify(body));
            req.end();
        });
    }
}

module.exports = WhatsApp;
