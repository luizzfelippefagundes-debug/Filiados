/**
 * Formata a mensagem do produto para WhatsApp.
 * Estilo: imagem + título chamativo + preço + link de afiliado
 */
function formatMessage(product) {
    const { title, price, originalPrice, discount, affiliateLink, freeShipping } = product;

    const priceFormatted = `R$ ${price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    let lines = [];

    // Título chamativo
    lines.push(`🔥 *ACHADO DO DIA!*`);
    lines.push('');
    lines.push(`*${title}*`);
    lines.push('');

    // Preço com desconto
    if (discount > 0) {
        const originalFormatted = `R$ ${originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        lines.push(`~De ${originalFormatted}~ Por *${priceFormatted}* 💚 (${discount}% OFF)`);
    } else {
        lines.push(`Por *${priceFormatted}* 💚`);
    }

    // Frete grátis
    if (freeShipping) {
        lines.push(`🚚 *Frete Grátis!*`);
    }

    lines.push('');
    lines.push(`🏪 Loja Oficial Mercado Livre`);
    lines.push(`🔗 ${affiliateLink}`);

    return lines.join('\n');
}

module.exports = { formatMessage };
