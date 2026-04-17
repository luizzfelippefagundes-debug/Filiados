#!/usr/bin/env node
require('dotenv').config({ path: __dirname + '/.env' });

const readline = require('readline');
const { getProduct } = require('./ml-api');
const { formatMessage } = require('./formatter');
const WhatsApp = require('./whatsapp');

const wa = new WhatsApp(
    process.env.EVOLUTION_URL || 'http://localhost:8080',
    process.env.EVOLUTION_KEY || 'goldshop2026',
    process.env.INSTANCE_NAME || 'goldshop'
);

const groupId = process.env.WHATSAPP_GROUP_ID;

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(r => rl.question(q, r));

const MENU = `
╔══════════════════════════════════╗
║   🏆 GOLD SHOP - Bot Afiliados  ║
╠══════════════════════════════════╣
║  1. Conectar WhatsApp (QR)       ║
║  2. Ver status da conexão        ║
║  3. Listar grupos                ║
║  4. Disparar produto             ║
║  5. Sair                         ║
╚══════════════════════════════════╝
`;

async function connectWhatsApp() {
    console.log('\n⏳ Criando instância...');
    try {
        const result = await wa.createInstance();
        if (result.qrcode?.base64) {
            console.log('\n📱 QR Code gerado! Abra no navegador:');
            console.log(`   ${process.env.EVOLUTION_URL || 'http://localhost:8080'}/manager`);
            console.log('\n   Ou escaneie o QR pelo app Evolution Manager.');
        } else if (result.instance) {
            console.log('✅ Instância já existe. Use opção 2 para ver o status.');
        } else {
            console.log('📋 Resultado:', JSON.stringify(result, null, 2));
        }
    } catch (e) {
        console.error('❌ Erro:', e.message);
    }
}

async function checkStatus() {
    try {
        const status = await wa.getStatus();
        const state = status.instance?.state || status.state || 'desconhecido';
        const icon = state === 'open' ? '✅' : '⏳';
        console.log(`\n${icon} Status: ${state}`);
    } catch (e) {
        console.error('❌ Erro:', e.message);
    }
}

async function listGroups() {
    try {
        console.log('\n⏳ Buscando grupos...');
        const groups = await wa.listGroups();
        if (Array.isArray(groups) && groups.length > 0) {
            console.log(`\n📋 ${groups.length} grupo(s) encontrado(s):\n`);
            groups.forEach((g, i) => {
                console.log(`  ${i + 1}. ${g.subject || g.name}`);
                console.log(`     ID: ${g.id}`);
                console.log(`     Participantes: ${g.size || '?'}`);
                console.log('');
            });
        } else {
            console.log('❌ Nenhum grupo encontrado. Verifique a conexão.');
            console.log('📋 Resposta:', JSON.stringify(groups, null, 2));
        }
    } catch (e) {
        console.error('❌ Erro:', e.message);
    }
}

async function dispararProduto() {
    const targetGroup = groupId;
    if (!targetGroup) {
        console.log('\n⚠️  WHATSAPP_GROUP_ID não configurado no bot/.env');
        console.log('   Use a opção 3 para listar seus grupos e copie o ID.');
        const id = await ask('   Cole o ID do grupo aqui: ');
        if (!id.trim()) return;
        return disparar(id.trim());
    }
    return disparar(targetGroup);
}

async function disparar(target) {
    const link = await ask('\n🔗 Cole o link do ML (ou link de afiliado): ');
    if (!link.trim()) return;

    console.log('\n⏳ Buscando dados do produto...');
    try {
        const product = await getProduct(link.trim());

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📦 PREVIEW DA MENSAGEM:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const message = formatMessage(product);
        console.log(message);

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🖼️  Imagem: ${product.image ? 'Sim' : 'Não'}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const confirm = await ask('\n✅ Disparar no grupo? (s/n): ');
        if (confirm.toLowerCase() !== 's') {
            console.log('❌ Cancelado.');
            return;
        }

        console.log('\n⏳ Enviando...');

        if (product.image) {
            // Envia imagem com caption
            const result = await wa.sendImage(target, product.image, message);
            if (result.key || result.messageId) {
                console.log('✅ Mensagem com imagem enviada com sucesso! 🚀');
            } else {
                console.log('📋 Resposta:', JSON.stringify(result, null, 2));
            }
        } else {
            // Só texto
            const result = await wa.sendText(target, message);
            if (result.key || result.messageId) {
                console.log('✅ Mensagem enviada com sucesso! 🚀');
            } else {
                console.log('📋 Resposta:', JSON.stringify(result, null, 2));
            }
        }
    } catch (e) {
        console.error('❌ Erro:', e.message);
    }
}

async function main() {
    console.log(MENU);

    while (true) {
        const choice = await ask('Escolha uma opção: ');

        switch (choice.trim()) {
            case '1': await connectWhatsApp(); break;
            case '2': await checkStatus(); break;
            case '3': await listGroups(); break;
            case '4': await dispararProduto(); break;
            case '5':
                console.log('\n👋 Até mais!');
                rl.close();
                process.exit(0);
            default:
                console.log('❌ Opção inválida');
        }
        console.log('');
    }
}

main().catch(console.error);
