const https = require('https');
const http = require('http');

/**
 * Busca dados de um produto no Mercado Livre.
 * Tenta via API (oficial) e se falhar tenta via Scraper (fallback).
 */
async function getProduct(url, clientId, clientSecret) {
    let productData = null;

    // Tentar via API com credenciais (plano A)
    if (clientId && clientSecret) {
        try {
            console.log('--- Tentando via API oficial (com credenciais)...');
            const accessToken = await getAccessToken(clientId, clientSecret);
            const itemId = extractId(url);
            productData = await fetchItem(itemId, accessToken, url);
        } catch (e) {
            console.warn('⚠️ API com credenciais falhou:', e.message);
        }
    }

    // Plano B: API pública (sem auth — funciona de qualquer IP)
    if (!productData) {
        try {
            console.log('--- Tentando via API pública (sem auth)...');
            const itemId = extractId(url);
            productData = await fetchItemPublic(itemId, url);
        } catch (e) {
            console.warn('⚠️ API pública falhou:', e.message);
        }
    }

    // Plano C: Scraper HTML (último recurso)
    if (!productData) {
        try {
            productData = await scrapeProduct(url);
        } catch (e) {
            console.warn('⚠️ Scraper HTML falhou:', e.message);
        }
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
    // Formato /p/MLB12345 (catálogo)
    const pMatch = url.match(/\/p\/MLB(\d+)/i);
    if (pMatch) return 'MLB' + pMatch[1];
    // Formato MLB-12345 ou MLB12345 (item)
    const match = url.match(/MLB[- ]?(\d+)/i);
    if (!match) throw new Error('ID não encontrado na URL');
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
 * Busca item via API pública (sem autenticação).
 * Funciona de qualquer IP — não é bloqueado como scraping HTML.
 */
function fetchItemPublic(itemId, affiliateLink) {
    return new Promise((resolve, reject) => {
        // Tentar como item primeiro, depois como produto
        const tryEndpoint = (endpoint) => {
            https.get(endpoint, { headers: { 'Accept': 'application/json' } }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const item = JSON.parse(data);
                        // Validar que temos dados úteis
                        if (!item.title && !item.name) {
                            return reject(new Error('Sem título no retorno da API'));
                        }
                        const title = item.title || item.name || 'Produto';
                        console.log(`   ✅ API pública retornou: ${title.substring(0, 40)}...`);
                        resolve({
                            id: itemId,
                            title: title,
                            price: item.price || 0,
                            originalPrice: item.original_price || item.price || 0,
                            discount: (item.original_price && item.original_price > item.price) ? Math.round((1 - item.price / item.original_price) * 100) : 0,
                            image: item.pictures?.[0]?.secure_url || item.thumbnail?.replace('-I.jpg', '-O.jpg') || '',
                            description: '',
                            affiliateLink,
                            freeShipping: item.shipping?.free_shipping || false
                        });
                    } catch { reject(new Error('Erro parsing API pública')); }
                });
            }).on('error', reject);
        };
        // Primeiro tenta /items/, se falhar tenta /products/
        const itemUrl = `https://api.mercadolibre.com/items/${itemId}`;
        tryEndpoint(itemUrl);
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
 * Plano B: Scraper resiliente com suporte a redirect e headers robustos
 */
async function scrapeProduct(url) {
    console.log('🔍 Executando Scraper Resiliente...');
    return new Promise((resolve, reject) => {
        function doRequest(reqUrl, depth) {
            if (depth > 5) return reject(new Error('Muitos redirects'));
            const client = reqUrl.startsWith('https') ? https : http;
            const options = {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Accept-Encoding': 'identity',
                    'Cache-Control': 'no-cache',
                    'Referer': 'https://www.mercadolivre.com.br/',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'same-origin',
                }
            };

            client.get(reqUrl, options, (res) => {
                // Seguir redirects
                if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
                    const next = res.headers.location.startsWith('http') ? res.headers.location : `https://www.mercadolivre.com.br${res.headers.location}`;
                    console.log(`   ↪ Redirect ${res.statusCode} → ${next.substring(0, 60)}...`);
                    return doRequest(next, depth + 1);
                }

                let html = '';
                res.on('data', chunk => html += chunk);
                res.on('end', () => {
                    try {
                        const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i);
                        const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
                        const priceMatch = html.match(/"price":\s?(\d+\.?\d*)/i) ||
                            html.match(/data-price="(\d+\.?\d*)"/i) ||
                            html.match(/andes-money-amount__fraction">(\d[\d.]*)</i);
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
                            freeShipping: html.includes('Frete grátis') || html.includes('free_shipping":true')
                        });
                    } catch (e) {
                        reject(new Error('Scraper falhou: ' + e.message));
                    }
                });
            }).on('error', reject);
        }
        doRequest(url, 0);
    });
}

module.exports = { getProduct };
