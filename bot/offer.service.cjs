const { getProduct } = require('./ml-api.cjs');

/**
 * Servico de Ofertas
 * Responsavel por: Extrair dados e Gerar Links de Afiliado
 */
class OfferService {
    /**
     * Extrai dados de um link do Mercado Livre
     */
    async extract(url) {
        console.log(`🔍 [OfferService] Extraindo: ${url}`);
        return await getProduct(url, process.env.ML_CLIENT_ID, process.env.ML_CLIENT_SECRET);
    }

    /**
     * Gera o link de afiliado (Placeholder por enquanto)
     */
    generateAffiliateLink(url) {
        // Logica para transformar em link de afiliado
        // Ex: https://mercadolivre.com/... -> https://mercadolivre.com/...&id_afiliado=123
        return `${url}?utm_source=goldshop&utm_medium=whatsapp&utm_campaign=afiliado`;
    }

    /**
     * Monta a copy de venda final
     */
    formatSaleMessage(product, affiliateLink) {
        const discountPrice = (product.price * 0.9).toFixed(2); // Exemplo de desconto simulado
        return `🔥 *OFERTA IMPERDÍVEL*

🛍️ ${product.title}
💰 De ~R$ ${(product.price * 1.2).toFixed(2).replace('.', ',')}~
🔥 Por *R$ ${product.price.toString().replace('.', ',')}*

🔗 ${affiliateLink}

⚠️ *Corre que pode acabar!*`;
    }
}

module.exports = new OfferService();
