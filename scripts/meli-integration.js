/**
 * Script de Referência: Mercado Livre Affiliate Link Generator
 * Este script demonstra como usar a MELI API para converter links normais
 * em links de afiliado dinamicamente.
 * 
 * Requisitos:
 * 1. Client ID e Client Secret do developers.mercadolivre.com.br
 * 2. Token de Acesso (OAuth2)
 */

const axios = require('axios');

const CLIENT_ID = 'SEU_CLIENT_ID';
const CLIENT_SECRET = 'SEU_CLIENT_SECRET';
const ACCESS_TOKEN = 'SEU_ACCESS_TOKEN'; // Obtido via OAuth2

async function generateAffiliateLink(itemUrl) {
    try {
        // 1. Extrair ID do item da URL (ex: MLB12345678)
        const itemIdMatch = itemUrl.match(/MLB-?(\d+)/);
        if (!itemIdMatch) throw new Error("ID do item não encontrado na URL");
        const itemId = `MLB${itemIdMatch[1]}`;

        // 2. Buscar detalhes do item (Preço, Título, Imagem)
        const itemResponse = await axios.get(`https://api.mercadolivre.com/items/${itemId}`);
        const { title, price, thumbnail } = itemResponse.data;

        // 3. Gerar Deep Link de Afiliado
        // Nota: A API de Afiliados do ML pode variar conforme o país.
        // O parâmetro 's_id' ou 'aff_id' é crucial.
        const affiliateId = 'SEU_APP_ID_DE_AFILIADO';
        const finalLink = `https://mercadolivre.com/sec/ads/proxy/affiliate/v2/redirect?s_id=${affiliateId}&url=${encodeURIComponent(itemUrl)}`;

        console.log(`Sucesso: ${title}`);
        return {
            title,
            price: price.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            image: thumbnail.replace('-I.jpg', '-O.jpg'), // Forçar alta resolução
            link: finalLink,
            category: "Detectado",
            tier: price > 2000 ? "performance" : (price > 500 ? "balanced" : "budget")
        };
    } catch (error) {
        console.error("Erro ao gerar link:", error.message);
        return null;
    }
}

// Exemplo de uso:
// generateAffiliateLink('https://www.mercadolivre.com.br/monitor-gamer-dell-27/p/MLB123456').then(console.log);

module.exports = { generateAffiliateLink };
