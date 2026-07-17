const CHAVE_CARRINHO = "carrinhoRoyal";

/* =====================================================
   ARMAZENAMENTO
===================================================== */

function pegarCarrinho() {
    try {
        const carrinho = JSON.parse(
            localStorage.getItem(CHAVE_CARRINHO)
        );

        return Array.isArray(carrinho) ? carrinho : [];
    } catch (erro) {
        console.error("Erro ao carregar o carrinho:", erro);
        return [];
    }
}

function salvarCarrinho(carrinho) {
    localStorage.setItem(
        CHAVE_CARRINHO,
        JSON.stringify(carrinho)
    );
}

/* =====================================================
   PREÇO
===================================================== */

function converterPreco(preco) {
    return Number(
        String(preco || "0")
            .replace("R$", "")
            .replace(/\./g, "")
            .replace(",", ".")
            .trim()
    ) || 0;
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

/* =====================================================
   ADICIONAR PRODUTO
===================================================== */

function adicionarCarrinho(produto) {
    if (!produto || !produto.nome) {
        console.error("Produto inválido:", produto);
        return;
    }

    const carrinho = pegarCarrinho();
    const quantidade = Number(produto.quantidade) || 1;

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
    }

    salvarCarrinho(carrinho);
    atualizarCarrinho();
}

/* =====================================================
   DIMINUIR PELO NOME
   Usado no index e no catálogo
===================================================== */

function diminuirProdutoDoCarrinho(nomeProduto) {
    const carrinho = pegarCarrinho();

    const index = carrinho.findIndex(
        item => item.nome === nomeProduto
    );

    if (index === -1) return;

    const quantidade =
        Number(carrinho[index].quantidade) || 1;

    if (quantidade > 1) {
        carrinho[index].quantidade = quantidade - 1;
    } else {
        carrinho.splice(index, 1);
    }

    salvarCarrinho(carrinho);
    atualizarCarrinho();
}

/* =====================================================
   CONTROLES DO DROPDOWN
===================================================== */

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

    const quantidade =
        Number(carrinho[index].quantidade) || 1;

    if (quantidade > 1) {
        carrinho[index].quantidade = quantidade - 1;
    } else {
        carrinho.splice(index, 1);
    }

    salvarCarrinho(carrinho);
    atualizarCarrinho();
}

/* =====================================================
   ATUALIZAR CONTADOR E DROPDOWN
===================================================== */

function atualizarCarrinho() {
    const carrinho = pegarCarrinho();

    const contadores = document.querySelectorAll(
        ".contador-carrinho"
    );

    const dropdowns = document.querySelectorAll(
        ".dropdown-carrinho"
    );

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

                <p class="carrinho-vazio">
                    Carrinho vazio.
                </p>
            `;

            return;
        }

        let total = 0;

        const itensHtml = carrinho
            .map((item, index) => {
                const quantidade =
                    Number(item.quantidade) || 1;

                const subtotal =
                    converterPreco(item.preco) * quantidade;

                total += subtotal;

                return `
                    <div class="item-carrinho">
                        <div class="foto-carrinho">
                            ${
                                item.imagem
                                    ? `
                                        <img
                                            src="${item.imagem}"
                                            alt="${item.nome}"
                                        >
                                    `
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
                                    aria-label="Diminuir quantidade"
                                >
                                    −
                                </button>

                                <span>${quantidade}</span>

                                <button
                                    type="button"
                                    onclick="aumentarItemCarrinho(${index})"
                                    aria-label="Aumentar quantidade"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <button
                            class="btn-remover"
                            type="button"
                            onclick="removerItemCarrinho(${index})"
                            aria-label="Remover produto"
                        >
                            ✕
                        </button>
                    </div>
                `;
            })
            .join("");

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
            </div>

            <a href="checkout.html" class="btn-finalizar">
                Ir para o Checkout
            </a>
        `;
    });
}

/* =====================================================
   ABRIR E FECHAR DROPDOWN
===================================================== */

function iniciarCarrinho() {
    atualizarCarrinho();

    const botoesCarrinho = document.querySelectorAll(
        ".btn-carrinho"
    );

    botoesCarrinho.forEach(botao => {
        const areaCarrinho = botao.closest(
            ".icone-carrinho"
        );

        const dropdown = areaCarrinho?.querySelector(
            ".dropdown-carrinho"
        );

        if (!dropdown) return;

        botao.addEventListener("click", evento => {
            evento.preventDefault();
            evento.stopPropagation();

            document
                .querySelectorAll(".dropdown-carrinho.ativo")
                .forEach(outroDropdown => {
                    if (outroDropdown !== dropdown) {
                        outroDropdown.classList.remove("ativo");
                    }
                });

            dropdown.classList.toggle("ativo");
        });

        dropdown.addEventListener("click", evento => {
            evento.stopPropagation();
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

/* =====================================================
   DISPONIBILIZAR FUNÇÕES GLOBALMENTE
===================================================== */

window.adicionarCarrinho = adicionarCarrinho;
window.diminuirProdutoDoCarrinho =
    diminuirProdutoDoCarrinho;

window.removerItemCarrinho = removerItemCarrinho;
window.aumentarItemCarrinho = aumentarItemCarrinho;
window.diminuirItemCarrinho = diminuirItemCarrinho;
window.atualizarCarrinho = atualizarCarrinho;
window.pegarCarrinho = pegarCarrinho;

document.addEventListener(
    "DOMContentLoaded",
    iniciarCarrinho
);