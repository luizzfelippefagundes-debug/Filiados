require('dotenv').config({ path: __dirname + '/.env' });
const { getProduct } = require('./ml-api.cjs');
const { formatMessage } = require('./formatter.cjs');
const WhatsApp = require('./whatsapp.cjs');
const https = require('https');

async function downloadImage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
        }).on('error', reject);
    });
}

async function runTest(url) {
    console.log('--- DISPARO DE TESTE (MODO ROBUSTO) ---');
    const wa = new WhatsApp(process.env.EVOLUTION_URL, process.env.EVOLUTION_KEY, process.env.INSTANCE_NAME);
    const targetGroup = process.env.WHATSAPP_GROUP_ID;

    try {
        console.log('🔍 Buscando dados...');
        const product = await getProduct(url, process.env.ML_CLIENT_ID, process.env.ML_CLIENT_SECRET);

        console.log('🖼️ Baixando imagem localmente para evitar bloqueios...');
        const imageBase64 = await downloadImage(product.image);

        console.log('📤 Enviando oferta completa...');
        const result = await wa.sendImage(targetGroup, imageBase64, formatMessage(product));

        if (result && !result.error) {
            console.log('✅ SUCESSO ABSOLUTO!');
        } else {
            console.log('⚠️ Erro na imagem. Tentando enviar apenas TEXTO como fallback...');
            await wa.sendText(targetGroup, formatMessage(product));
            console.log('✅ TEXTO ENVIADO! (A imagem foi bloqueada mas o link foi)');
        }
    } catch (error) {
        console.error('💥 ERRO:', error.message);
    }
}

runTest(process.argv[2]);
