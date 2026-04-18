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

            if (clientTitle) {
                console.log(`📡 [Server] Usando dados enviados pelo cliente: ${clientTitle}`);
                product = {
                    title: clientTitle,
                    price: clientPrice || '0',
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

            // Se é popup HTML e NÃO veio categoria ainda → mostra formulário
            const isHtml = urlParams.get('format') === 'html';
            if (isHtml && !category) {
                const cats = ['Beleza', 'Eletrônicos', 'Casa', 'Moda', 'Saúde', 'Outros'];
                const btns = cats.map(c => `<button onclick="save('${c}')">${c}</button>`).join('');

                // Passamos os dados extraídos para o formulário para que o clique final os use
                const encodedTitle = encodeURIComponent(product.title || product.name);
                const encodedPrice = encodeURIComponent(product.price);
                const encodedImage = encodeURIComponent(product.image || product.image_url || '');

                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`<html><head><style>
                    body { font-family: sans-serif; background: #0f172a; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; overflow: hidden; }
                    .card { background: #1e293b; padding: 24px; border-radius: 16px; border: 1px solid #334155; text-align: center; width: 85%; max-width: 320px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                    p { font-size: 14px; opacity: 0.8; margin-bottom: 20px; color: #94a3b8; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                    button { background: #334155; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; border: 1px solid transparent; }
                    button:hover { background: #475569; border-color: #d4af37; color: #d4af37; }
                    h2 { color: #d4af37; margin: 0 0 8px 0; font-size: 20px; }
                </style></head><body><div class="card">
                  <h2>Onde salvar?</h2>
                  <p>Escolha a categoria para este achado</p>
                  <div class="grid" id="cats">${btns}</div>
                  <script>
                    function save(cat){
                      const baseUrl = window.location.origin + window.location.pathname;
                      const params = new URLSearchParams();
                      params.set('url', "${targetUrl}");
                      params.set('title', decodeURIComponent("${encodedTitle}"));
                      params.set('price', decodeURIComponent("${encodedPrice}"));
                      params.set('image', decodeURIComponent("${encodedImage}"));
                      params.set('category', cat);

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
                INSERT INTO products (title, price, image_url, affiliate_link, category, description)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (affiliate_link) DO UPDATE SET
                    title = EXCLUDED.title, price = EXCLUDED.price,
                    description = EXCLUDED.description, category = EXCLUDED.category
                RETURNING *;
            `;
            const values = [
                product.title || product.name,
                product.price?.toString().replace('.', ',') || '0',
                product.image || product.image_url || '',
                targetUrl,
                category || 'Geral',
                product.description || ''
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
        runAutomationTask(); // Executa em background
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
 * AUTOMAÇÃO NATIVA (Substitui o n8n para economia de memória)
 */
const runAutomationTask = async () => {
    console.log('\n🤖 [Automation] Iniciando busca agendada de novos achados...');
    try {
        const query = 'Skincare Profissional';
        const response = await axios.get(`https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&limit=15`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });
        const items = response.data.results;
        console.log(`📡 [Automation] Encontrados ${items.length} itens. Sincronizando...`);

        for (const item of items) {
            const price = item.price || 0;
            const product = {
                title: item.title,
                price: price.toString().replace('.', ','),
                image_url: item.thumbnail.replace('-I.jpg', '-O.jpg'),
                affiliate_link: item.permalink,
                category: 'Beleza',
                description: `Oferta encontrada automaticamente: ${item.title}. Preço imbatível!`
            };

            const dbQuery = `
                INSERT INTO products (title, price, image_url, affiliate_link, category, description)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (affiliate_link) DO UPDATE SET
                    title = EXCLUDED.title,
                    price = EXCLUDED.price
                RETURNING title;
            `;
            const values = [product.title, product.price, product.image_url, product.affiliate_link, product.category, product.description];
            await pgClient.query(dbQuery, values);
        }
        console.log('✅ [Automation] Busca agendada concluída com sucesso.');
    } catch (error) {
        console.error('❌ [Automation] Erro na busca agendada:', error.message);
    }
};

cron.schedule('0 */12 * * *', runAutomationTask);

const PORT = process.env.PORT || 3333;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n=========================================`);
    console.log(`🚀 GOLD SHOP BOT ATIVADO (MODO CÓDIGO PURO)`);
    console.log(`📡 Ouvindo em: http://localhost:${PORT}`);
    console.log(`=========================================\n`);
});
