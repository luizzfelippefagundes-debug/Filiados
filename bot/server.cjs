require('dotenv').config({ path: __dirname + '/.env' });
const http = require('http');
const messageHandler = require('./message.handler.cjs');
const offerService = require('./offer.service.cjs');
const { Client } = require('pg');
const cron = require('node-cron');
const axios = require('axios');

const pgClient = new Client({
    connectionString: 'postgresql://neondb_owner:npg_lWzA8uLghEU0@ep-gentle-hall-amii66wb-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
});
pgClient.connect().catch(e => console.error('❌ Erro ao conectar no DB:', e.message));

// Prevenir crash global
process.on('uncaughtException', (err) => { console.error('💥 Uncaught Exception:', err.message); });
process.on('unhandledRejection', (err) => { console.error('💥 Unhandled Rejection:', err); });

/**
 * Servidor Principal Gold Shop (Modo Full Bot + Vitrine)
 */
const server = http.createServer(async (req, res) => {
    // Configurações de Cabeçalho
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // Health Check (mantém Render ativo)
    if (req.method === 'GET' && (req.url === '/' || req.url === '/healthz')) {
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'ok', service: 'Gold Shop Bot', uptime: process.uptime() }));
        return;
    }

    // Rota de Webhook da Evolution API
    if (req.method === 'POST' && req.url === '/webhook') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const payload = JSON.parse(body);
                await messageHandler.handle(payload);
                res.writeHead(200);
                res.end(JSON.stringify({ status: 'received' }));
            } catch (error) {
                console.error('💥 [Bot] Erro no Webhook:', error.message);
                res.writeHead(500);
                res.end(JSON.stringify({ error: error.message }));
            }
        });
        return;
    }

    // Rota de Captura Administrativa (Chamada pelo Frontend ou Bookmarklet)
    if (req.method === 'GET' && req.url.startsWith('/capture')) {
        const urlParams = new URL(req.url, `http://${req.headers.host}`).searchParams;
        const targetUrl = urlParams.get('url');
        const category = urlParams.get('category');
        const isHtml = urlParams.get('format') === 'html';

        if (!targetUrl) {
            res.writeHead(400); res.end(JSON.stringify({ error: 'URL is required' }));
            return;
        }

        try {
            console.log(`\n🔍 [Server] Capturando: ${targetUrl}`);

            let product;
            const clientTitle = urlParams.get('title');
            const clientPrice = urlParams.get('price');
            const clientImage = urlParams.get('image');
            const clientOriginalPrice = urlParams.get('originalPrice');
            const clientDiscount = urlParams.get('discount');

            if (clientTitle) {
                console.log(`📡 [Server] Usando dados enviados pelo cliente: ${clientTitle}`);
                product = {
                    title: clientTitle,
                    price: clientPrice || '0',
                    originalPrice: clientOriginalPrice || clientPrice || '0',
                    discount: clientDiscount || 0,
                    image: clientImage || '',
                    description: 'Capturado via Gold Push'
                };
            } else {
                console.log(`🔍 [OfferService] Extraindo: ${targetUrl}`);
                // Timeout de 15s para não travar o servidor
                const timeoutMs = 15000;
                product = await Promise.race([
                    offerService.extract(targetUrl),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout: extração demorou demais')), timeoutMs))
                ]);
            }

            if (!product || (!product.title && !product.name)) {
                throw new Error('Falha ao extrair dados do produto');
            }

            // Se for HTML (Bookmarklet), mostra seletor de categorias
            const isHtml = urlParams.get('format') === 'html';
            if (isHtml && !category) {
                const cats = [
                    'Beleza', 'Eletrônicos', 'Casa', 'Cozinha',
                    'Moda', 'Calçados', 'Gamer', 'Saúde',
                    'Suplementos', 'Ferramentas', 'Pet Shop', 'Bebês',
                    'Automotivo', 'Papelaria', 'Outros'
                ];
                const btns = cats.map(c => `<button onclick="save('${c}')">${c}</button>`).join('');

                // Passamos os dados extraídos para o formulário para que o clique final os use
                const encodedTitle = encodeURIComponent(product.title || product.name);
                const encodedPrice = encodeURIComponent(product.price);
                const encodedOriginalPrice = encodeURIComponent(product.originalPrice || product.price);
                const encodedDiscount = encodeURIComponent(product.discount || 0);
                const encodedImage = encodeURIComponent(product.image || product.image_url || '');

                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`<html><head><style>
                    body { font-family: sans-serif; background: #0f172a; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; overflow: hidden; }
                    .card { background: #1e293b; padding: 20px; border-radius: 16px; border: 1px solid #334155; text-align: center; width: 90%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                    p { font-size: 13px; opacity: 0.7; margin-bottom: 15px; color: #94a3b8; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
                    button { background: #334155; color: white; border: none; padding: 10px 5px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 11px; transition: all 0.2s; border: 1px solid transparent; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
                    button:hover { background: #475569; border-color: #d4af37; color: #d4af37; }
                    h2 { color: #d4af37; margin: 0 0 5px 0; font-size: 18px; }
                </style></head><body><div class="card">
                  <h2>📂 Categoria</h2>
                  <p>Onde salvar este achado?</p>
                  <div class="grid" id="cats">${btns}</div>
                  <script>
                    function save(cat){
                      const baseUrl = window.location.origin + window.location.pathname;
                      const params = new URLSearchParams();
                      params.set('url', "${targetUrl.replace(/"/g, '\\"')}");
                      params.set('title', decodeURIComponent("${encodedTitle.replace(/"/g, '\\"') || ''}"));
                      params.set('price', decodeURIComponent("${encodedPrice}"));
                      params.set('originalPrice', decodeURIComponent("${encodedOriginalPrice}"));
                      params.set('discount', decodeURIComponent("${encodedDiscount}"));
                      params.set('image', decodeURIComponent("${encodedImage}"));
                      params.set('category', cat);
                      params.set('format', 'json');

                      document.getElementById('cats').innerHTML = '<p style="color:#d4af37">Salvando...</p>';
                      
                      fetch(baseUrl + '?' + params.toString())
                        .then(r => r.json())
                        .then(() => {
                           document.getElementById('cats').innerHTML = '<h2 style="color:#22c55e">✅ Salvo!</h2>';
                           setTimeout(() => window.close(), 1000);
                        })
                        .catch(err => {
                           document.getElementById('cats').innerHTML = '<p style="color:#ef4444">❌ Erro ao salvar</p>';
                           console.error(err);
                        });
                    }
                  </script>
                </div></body></html>`);
                return;
            }

            // Salvar no banco (com ou sem categoria)
            const query = `
                INSERT INTO products (title, price, image_url, affiliate_link, category, description, original_price, discount)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (affiliate_link) DO UPDATE SET
                    title = EXCLUDED.title, price = EXCLUDED.price,
                    description = EXCLUDED.description, category = EXCLUDED.category,
                    original_price = EXCLUDED.original_price, discount = EXCLUDED.discount
                RETURNING *;
            `;
            const values = [
                product.title || product.name,
                product.price?.toString().replace('.', ',') || '0',
                product.image || product.image_url || '',
                targetUrl,
                category || 'Geral',
                product.description || '',
                (product.originalPrice || product.price)?.toString().replace('.', ',') || '0',
                parseInt(product.discount) || 0
            ];

            const result = await pgClient.query(query, values);
            console.log(`✅ [Server] Produto salvo: ${product.title} [${category || 'Geral'}]`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.rows[0]));
        } catch (error) {
            console.error('💥 [Server] Erro na captura:', error.message);
            if (!res.headersSent) {
                if (isHtml) {
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Gold Push</title></head><body style="background:#0f172a;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center"><div><h2 style="color:#ef4444">❌ Erro</h2><p>${error.message}</p><button onclick="window.close()" style="margin-top:16px;padding:8px 20px;background:#d4af37;border:none;border-radius:8px;color:#000;cursor:pointer;font-weight:bold">Fechar</button></div></body></html>`);
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: error.message }));
                }
            }
        }
        return;
    }

    // Gatilho Manual de Automação
    if (req.method === 'POST' && req.url === '/run-automation') {
        // Dispara ambos em background
        syncCatalogPrices();
        runAutomationTask();
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'started' }));
        return;
    }

    // Health Check
    if (req.url === '/health') {
        res.writeHead(200); res.end('Gold Shop Bot is Healthy 🚀');
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

/**
 * MOTOR DE SINCRONIZAÇÃO DE PREÇOS (Atualiza o que já existe)
 */
const syncCatalogPrices = async () => {
    console.log('\n🔄 [Sync] Iniciando auditoria de preços do catálogo...');
    try {
        const { rows: products } = await pgClient.query('SELECT id, title, affiliate_link FROM products');
        console.log(`📡 [Sync] Analisando ${products.length} produtos...`);

        for (const p of products) {
            try {
                // Delay de 1s entre itens para evitar 429 (Too Many Requests)
                await new Promise(r => setTimeout(r, 1000));

                console.log(`   🔸 Verificando: ${p.title.substring(0, 30)}...`);
                // Forçamos o uso do scraper para pegar o preço real mais atualizado
                const updated = await offerService.extract(p.affiliate_link);

                if (updated && updated.price) {
                    const priceStr = updated.price.toString().replace('.', ',');
                    await pgClient.query(
                        'UPDATE products SET price = $1, original_price = $2, discount = $3 WHERE id = $4',
                        [priceStr, updated.originalPrice?.toString().replace('.', ',') || priceStr, updated.discount || 0, p.id]
                    );
                }
            } catch (err) {
                console.warn(`   ⚠️ Erro ao atualizar ${p.id}: ${err.message}`);
            }
        }
        console.log('✅ [Sync] Sincronização de preços concluída!');
    } catch (error) {
        console.error('💥 [Sync] Erro crítico no sync:', error.message);
    }
};

/**
 * AUTOMAÇÃO NATIVA (Substitui o n8n para descoberta de novos itens)
 */
const runAutomationTask = async () => {
    console.log('\n🤖 [Automation] Iniciando busca agendada de novos achados...');
    try {
        const query = 'Ofertas Dia Mercado Livre';
        const response = await axios.get(`https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&limit=10`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });
        const items = response.data.results;
        console.log(`📡 [Automation] Encontrados ${items.length} itens sugeridos.`);

        for (const item of items) {
            const product = {
                title: item.title,
                price: item.price?.toString().replace('.', ',') || '0',
                image: item.thumbnail,
                description: 'Achado automático do sistema.',
                affiliateLink: item.permalink,
                category: 'Geral'
            };

            await pgClient.query(`
                INSERT INTO products (title, price, image_url, affiliate_link, category, description)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (affiliate_link) DO UPDATE SET price = EXCLUDED.price;
            `, [product.title, product.price, product.image, product.affiliateLink, product.category, product.description]);
        }
        console.log('✅ [Automation] Buscas concluídas!');
    } catch (error) {
        console.error('💥 [Automation] Erro na descoberta automática:', error.message);
    }
};

// Agendamentos (Cron)
cron.schedule('0 0 * * *', runAutomationTask);     // Novos itens à meia-noite
cron.schedule('0 */12 * * *', syncCatalogPrices); // Preços a cada 12h

// Sync inicial opcional ao subir
// syncCatalogPrices(); 

const PORT = process.env.PORT || 3333;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n=========================================`);
    console.log(`🚀 GOLD SHOP BOT ATIVADO (MODO CÓDIGO PURO)`);
    console.log(`📡 Ouvindo em: http://localhost:${PORT}`);
    console.log(`=========================================\n`);
});
