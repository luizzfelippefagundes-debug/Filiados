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
pgClient.connect();

/**
 * Servidor Principal Gold Shop (Modo Full Bot + Vitrine)
 */
const server = http.createServer(async (req, res) => {
    // Configurações de Cabeçalho
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

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
            const product = await offerService.extract(targetUrl);
            if (!product) throw new Error('Falha ao extrair dados do produto');

            // Se é popup HTML e NÃO veio categoria ainda → mostra formulário
            if (isHtml && !category) {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                const cats = ['Suplementos', 'Skincare', 'Fitness', 'Eletrônicos', 'Casa', 'Beleza', 'Moda', 'Saúde', 'Geral'];
                const btns = cats.map(c => `<button onclick="save('${c}')" class="cat-btn">${c}</button>`).join('');
                res.end(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Gold Push</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0f172a;color:#fff;font-family:'Inter',system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh}
  .wrap{text-align:center;width:90%;max-width:380px}
  h2{color:#d4af37;font-size:18px;margin-bottom:6px}
  .title{color:#94a3b8;font-size:12px;margin-bottom:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .price{color:#d4af37;font-size:24px;font-weight:900;margin-bottom:18px}
  .label{color:#64748b;font-size:9px;text-transform:uppercase;letter-spacing:3px;margin-bottom:10px}
  .grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:12px}
  .cat-btn{padding:10px 4px;border:1px solid rgba(212,175,55,0.15);background:rgba(255,255,255,0.04);color:#fff;border-radius:10px;cursor:pointer;font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;transition:all 0.2s}
  .cat-btn:hover{background:rgba(212,175,55,0.15);border-color:#d4af37;color:#d4af37}
  .msg{padding:16px;font-size:14px}
  .ok{color:#22c55e}
  .err{color:#ef4444}
</style></head><body>
<div class="wrap">
  <h2>🚀 Gold Push</h2>
  <p class="title">${product.title.replace(/'/g, "\\'")}</p>
  <p class="price">R$ ${product.price}</p>
  <p class="label">Selecione a categoria</p>
  <div class="grid" id="cats">${btns}</div>
  <script>
    function save(cat){
      document.getElementById('cats').innerHTML='<p class="msg" style="color:#d4af37">Salvando...</p>';
      fetch('http://localhost:3333/capture?url=${encodeURIComponent(targetUrl)}&category='+encodeURIComponent(cat))
        .then(r=>r.json())
        .then(()=>{document.getElementById('cats').innerHTML='<p class="msg ok">✅ Salvo!</p>';setTimeout(()=>window.close(),1000)})
        .catch(()=>{document.getElementById('cats').innerHTML='<p class="msg err">❌ Erro</p>'})
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
                product.title,
                product.price.toString().replace('.', ','),
                product.image,
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
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
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
        const response = await axios.get(`https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&limit=10`);
        const items = response.data.results;

        for (const item of items) {
            const product = {
                title: item.title,
                price: item.price.toString().replace('.', ','),
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

const PORT = 3333;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n=========================================`);
    console.log(`🚀 GOLD SHOP BOT ATIVADO (MODO CÓDIGO PURO)`);
    console.log(`📡 Ouvindo em: http://localhost:${PORT}`);
    console.log(`=========================================\n`);
});
