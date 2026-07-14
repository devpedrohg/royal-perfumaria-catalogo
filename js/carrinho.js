const CHAVE_CARRINHO = "carrinhoRoyal";
const WHATSAPP_ROYAL = "5562999736569";
{
    const carrinho = pegarCarrinho();

    if (!carrinho.length) {
        alert("Seu carrinho está vazio.");
        return;
    }

    let total = 0;

    let mensagem = `🛍️ *NOVO PEDIDO - ROYAL PERFUMARIA*\n\n`;
    mensagem += `🛒 *Produtos selecionados*\n`;

    carrinho.forEach((item) => {
        const quantidade = Number(item.quantidade) || 1;
        const subtotal = converterPreco(item.preco) * quantidade;

        total += subtotal;

        mensagem += `\n• *${item.nome}*\n`;
        mensagem += `Quantidade: ${quantidade}\n`;
        mensagem += `Preço unitário: ${item.preco}\n`;
        mensagem += `Subtotal: ${formatarMoeda(subtotal)}\n`;
    });

    mensagem += `\n💰 *Total:* ${formatarMoeda(total)}\n`;
    mensagem += `\nOlá! Gostaria de finalizar este pedido.`;

    const urlWhatsApp =
        `https://wa.me/${WHATSAPP_ROYAL}?text=${encodeURIComponent(mensagem)}`;

    window.open(urlWhatsApp, "_blank");
}

function pegarCarrinho() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];
    } catch {
        return [];
    }
}

function salvarCarrinho(carrinho) {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
}

function adicionarCarrinho(produto) {
    const quantidade = Number(produto.quantidade) || 1;
    const carrinho = pegarCarrinho();

    const existente = carrinho.find(
        item => item.nome === produto.nome
    );

    if (existente) {
        existente.quantidade =
            (Number(existente.quantidade) || 0) + quantidade;
    } else {
        carrinho.push({
            nome: produto.nome,
            preco: produto.preco,
            imagem: produto.imagem || "",
            quantidade
        });
        salvarCarrinho(carrinho);
        atualizarCarrinho();
}
        function diminuirProdutoDoCarrinho(nomeProduto) {
    const carrinho = pegarCarrinho();

    const index = carrinho.findIndex(
        item => item.nome === nomeProduto
    );

    if (index === -1) return;

    const quantidadeAtual =
        Number(carrinho[index].quantidade) || 1;

    if (quantidadeAtual > 1) {
        carrinho[index].quantidade = quantidadeAtual - 1;
    } else {
        carrinho.splice(index, 1);
    }
    
    salvarCarrinho(carrinho);
    atualizarCarrinho();
    
}
    }

    salvarCarrinho(carrinho);
    atualizarCarrinho();
}

function removerItemCarrinho(index) {
    const carrinho = pegarCarrinho();

    if (!carrinho[index]) return;

    carrinho.splice(index, 1);
    salvarCarrinho(carrinho);
    atualizarCarrinho();
}

function aumentarItemCarrinho(index) {
    const carrinho = pegarCarrinho();

    if (!carrinho[index]) return;

    carrinho[index].quantidade =
        (Number(carrinho[index].quantidade) || 0) + 1;

    salvarCarrinho(carrinho);
    atualizarCarrinho();
}

function diminuirItemCarrinho(index) {
    const carrinho = pegarCarrinho();

    if (!carrinho[index]) return;

    const quantidade = Number(carrinho[index].quantidade) || 1;

    if (quantidade > 1) {
        carrinho[index].quantidade = quantidade - 1;
    } else {
        carrinho.splice(index, 1);
    }

    salvarCarrinho(carrinho);
    atualizarCarrinho();
}

function converterPreco(preco) {
    return Number(
        String(preco)
            .replace("R$", "")
            .replace(/\./g, "")
            .replace(",", ".")
            .trim()
    ) || 0;
}

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function atualizarCarrinho() {
    const carrinho = pegarCarrinho();
    const contadores = document.querySelectorAll(".contador-carrinho");
    const dropdowns = document.querySelectorAll(".dropdown-carrinho");

    const totalItens = carrinho.reduce(
        (total, item) =>
            total + (Number(item.quantidade) || 0),
        0
    );

    contadores.forEach(contador => {
        contador.textContent = totalItens;
    });

    dropdowns.forEach(dropdown => {
        if (carrinho.length === 0) {
            dropdown.innerHTML = `
                <h3>Seu Carrinho</h3>
                <p class="carrinho-vazio">Carrinho vazio.</p>
            `;
            return;
        }

        let total = 0;

        const itensHtml = carrinho.map((item, index) => {
            const quantidade = Number(item.quantidade) || 1;
            const subtotal =
                converterPreco(item.preco) * quantidade;

            total += subtotal;

            return `
                <div class="item-carrinho">
                    <div class="foto-carrinho">
                        ${
                            item.imagem
                                ? `<img src="${item.imagem}" alt="${item.nome}">`
                                : ""
                        }
                    </div>

                    <div class="info-carrinho">
                        <strong>${item.nome}</strong>
                        <span>${item.preco}</span>

                        <div class="controle-carrinho">
                            <button
                                type="button"
                                onclick="diminuirItemCarrinho(${index})"
                            >
                                −
                            </button>

                            <span>${quantidade}</span>

                            <button
                                type="button"
                                onclick="aumentarItemCarrinho(${index})"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <button
                        class="btn-remover"
                        type="button"
                        onclick="removerItemCarrinho(${index})"
                    >
                        ✕
                    </button>
                </div>
            `;
        }).join("");

        dropdown.innerHTML = `
            <h3>Seu Carrinho</h3>

            <div class="lista-carrinho">
                ${itensHtml}
            </div>

            <div class="footer-carrinho">
                <div>
                    <span>Total</span>
                    <strong>${formatarMoeda(total)}</strong>
                </div>
    
               <a href="checkout.html" class="btn-finalizar">
    Ir para o Checkout
</a>
        `;
    });
}

function iniciarCarrinho() {
    atualizarCarrinho();

    const botoesCarrinho =
        document.querySelectorAll(".btn-carrinho");

    botoesCarrinho.forEach(botao => {
        const areaCarrinho = botao.closest(".icone-carrinho");
        const dropdown =
            areaCarrinho?.querySelector(".dropdown-carrinho");

        if (!dropdown) return;

        botao.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            dropdown.classList.toggle("ativo");
        });

        dropdown.addEventListener("click", event => {
            event.stopPropagation();
        });
    });

    document.addEventListener("click", () => {
        document
            .querySelectorAll(".dropdown-carrinho.ativo")
            .forEach(dropdown => {
                dropdown.classList.remove("ativo");
            });
    });
}

document.addEventListener("DOMContentLoaded", iniciarCarrinho); 

window.adicionarCarrinho = adicionarCarrinho;
window.diminuirProdutoDoCarrinho = diminuirProdutoDoCarrinho;
window.atualizarCarrinho = atualizarCarrinho;