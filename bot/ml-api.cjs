const https = require('https');
const http = require('http');

/**
 * Busca dados de um produto no Mercado Livre.
 * Tenta via API (oficial) e se falhar tenta via Scraper (fallback).
 */
async function getProduct(url, clientId, clientSecret) {
    let productData = null;

    // Tentar via API se houver credenciais (plano A)
    if (clientId && clientSecret) {
        try {
            console.log('--- Tentando via API oficial...');
            const accessToken = await getAccessToken(clientId, clientSecret);
            const itemId = extractId(url);
            productData = await fetchItem(itemId, accessToken, url);
        } catch (e) {
            console.warn('⚠️ API falhou ou credenciais inválidas. Mudando para Plano B (Scraper)...');
        }
    }

    // Plano B: Scraper (Extração de Metadados HTML)
    if (!productData) {
        productData = await scrapeProduct(url);
    }

    // Tentar buscar descrição se já temos o produto mas falta a descrição
    if (productData && !productData.description && clientId && clientSecret) {
        try {
            const itemId = extractId(url);
            const accessToken = await getAccessToken(clientId, clientSecret);
            productData.description = await fetchDescription(itemId, accessToken);
        } catch (e) {
            console.warn('⚠️ Falha ao buscar descrição extra.');
        }
    }

    return productData;
}

function extractId(url) {
    const match = url.match(/MLB[- ]?(\d+)/i);
    if (!match) throw new Error('ID não encontrado');
    return 'MLB' + match[1];
}

async function getAccessToken(clientId, clientSecret) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        });
        const options = {
            hostname: 'api.mercadolibre.com',
            path: '/oauth/token',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
        };
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    if (response.access_token) resolve(response.access_token);
                    else reject(new Error('Token inválido'));
                } catch { reject(new Error('Erro parsing token')); }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function fetchItem(itemId, token, affiliateLink) {
    return new Promise((resolve, reject) => {
        const url = `https://api.mercadolibre.com/items/${itemId}`;
        https.get(url, { headers: { 'Authorization': `Bearer ${token}` } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const item = JSON.parse(data);
                    if (item.error) return reject(new Error(item.message));
                    resolve({
                        id: itemId,
                        title: item.title,
                        price: item.price || 0,
                        originalPrice: item.original_price || item.price,
                        discount: item.original_price > item.price ? Math.round((1 - item.price / item.original_price) * 100) : 0,
                        image: item.pictures?.[0]?.secure_url || item.thumbnail?.replace('-I.jpg', '-O.jpg'),
                        affiliateLink,
                        freeShipping: item.shipping?.free_shipping || false
                    });
                } catch { reject(new Error('Erro item sync')); }
            });
        }).on('error', reject);
    });
}

/**
 * Busca a descrição detalhada do item via API oficial.
 */
function fetchDescription(itemId, token) {
    return new Promise((resolve) => {
        const url = `https://api.mercadolibre.com/items/${itemId}/description`;
        https.get(url, { headers: { 'Authorization': `Bearer ${token}` } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const desc = JSON.parse(data);
                    resolve(desc.plain_text || '');
                } catch { resolve(''); }
            });
        }).on('error', () => resolve(''));
    });
}

/**
 * Plano B: Scraper de alto desempenho usando os metadados do Mercado Livre
 */
async function scrapeProduct(url) {
    console.log('🔍 Executando Scraper Resiliente...');
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'pt-BR,pt;q=0.9'
            }
        };

        client.get(url, options, (res) => {
            let html = '';
            res.on('data', chunk => html += chunk);
            res.on('end', () => {
                try {
                    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i);
                    const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
                    const priceMatch = html.match(/"price":\s?(\d+\.?\d*)/i);
                    const descMatch = html.match(/<p class="ui-pdp-description__content">([^<]+)/i) ||
                        html.match(/<meta name="description" content="([^"]+)"/i);

                    if (!titleMatch) throw new Error('Não consegui ler os detalhes da página.');

                    resolve({
                        title: titleMatch[1].split('|')[0].trim(),
                        image: imageMatch ? imageMatch[1] : '',
                        price: priceMatch ? parseFloat(priceMatch[1]) : 0,
                        description: descMatch ? descMatch[1].trim() : '',
                        originalPrice: 0,
                        discount: 0,
                        affiliateLink: url,
                        freeShipping: html.includes('Frete grátis')
                    });
                } catch (e) {
                    reject(new Error('Scraper falhou: ' + e.message));
                }
            });
        }).on('error', reject);
    });
}

module.exports = { getProduct };
