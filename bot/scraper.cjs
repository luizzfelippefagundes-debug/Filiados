require('dotenv').config({ path: __dirname + '/.env' });
const https = require('https');

const CATEGORIES = ['smartphone', 'notebook', 'air-fryer'];
const NEON_TOKEN = 'napi_7ze1ed1kp2efek7hvtx2der33iw2v57trx2oc7vv1b5j0goybgjwqlk1h40adlu0';

async function runScraper() {
    console.log('🕵️‍♂️ Iniciando Olheiro em modo Resiliente (Scraping)...');

    for (const cat of CATEGORIES) {
        try {
            console.log(`🔍 Vasculhando categoria: ${cat}...`);
            const searchUrl = `https://www.mercadolivre.com.br/s/${cat}`;
            const html = await fetchHtml(searchUrl);

            // Extrair URLs de produtos (Padrao: produto.mercadolivre.com.br/MLB-...)
            const urlRegex = /https:\/\/produto\.mercadolivre\.com\.br\/MLB-[^" ]+/g;
            const urls = [...new Set(html.match(urlRegex) || [])].slice(0, 5);

            console.log(`📦 Encontrados ${urls.length} produtos em ${cat}. Extraindo detalhes...`);

            for (const url of urls) {
                try {
                    const product = await scrapeDetails(url);
                    if (product && product.title) {
                        await saveToDatabase(product);
                        console.log(`   ✅ Salvo: ${product.title.substring(0, 30)}...`);
                    }
                } catch (e) { /* ignorar falha individual */ }
            }
        } catch (error) {
            console.error(`❌ Erro na categoria ${cat}:`, error.message);
        }
    }
}

function fetchHtml(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function scrapeDetails(url) {
    const html = await fetchHtml(url);
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i);
    const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
    const priceMatch = html.match(/"price":\s?(\d+\.?\d*)/i);

    if (!titleMatch) return null;

    return {
        title: titleMatch[1].split('|')[0].trim(),
        image: imageMatch ? imageMatch[1] : '',
        price: priceMatch ? parseFloat(priceMatch[1]) : 0,
        url: url
    };
}

async function saveToDatabase(p) {
    const query = `
        INSERT INTO offers (title, price, image, product_url, category, status)
        VALUES ('${p.title.replace(/'/g, "''")}', ${p.price}, '${p.image}', '${p.url}', 'Sugestão IA', 'pending')
        ON CONFLICT (product_url) DO NOTHING;
    `;
    const data = JSON.stringify({ query });
    return new Promise((resolve) => {
        const options = {
            hostname: 'console.neon.tech',
            path: '/api/v2/projects/gentle-hall-amii66wb/branches/main/databases/neondb/sql',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${NEON_TOKEN}` }
        };
        const req = https.request(options, (res) => {
            res.on('data', () => { });
            res.on('end', () => resolve());
        });
        req.on('error', () => resolve());
        req.write(data);
        req.end();
    });
}

runScraper();
