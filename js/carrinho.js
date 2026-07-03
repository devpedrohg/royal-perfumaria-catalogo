const CHAVE = "carrinhoRoyal";

let carrinho = JSON.parse(localStorage.getItem(CHAVE)) || [];

function salvarCarrinho() {
    localStorage.setItem(CHAVE, JSON.stringify(carrinho));
}

function adicionarCarrinho(produto) {

    const existente = carrinho.find(p => p.nome === produto.nome);

    if (existente) {
        existente.quantidade += produto.quantidade || 1;
    } else {
        carrinho.push({
            ...produto,
            quantidade: produto.quantidade || 1
        });
    }

    salvarCarrinho();
    atualizarCarrinho();
}

function removerCarrinho(indice) {
    carrinho.splice(indice, 1);
    salvarCarrinho();
    atualizarCarrinho();
}

function atualizarCarrinho() {

    const contador = document.querySelector(".contador-carrinho");
    const lista = document.querySelector(".item-carrinho");

    if (contador) {
        contador.innerText = carrinho.reduce((t, p) => t + p.quantidade, 0);
    }

    if (!lista) return;

    lista.innerHTML = "";

    if (carrinho.length === 0) {
        lista.innerHTML = "<p>Carrinho vazio.</p>";
        return;
    }

    let total = 0;

    carrinho.forEach((produto, i) => {

        const preco = Number(
            produto.preco
                .replace("R$", "")
                .replace(".", "")
                .replace(",", ".")
        );

        total += preco * produto.quantidade;

        lista.innerHTML += `
            <div class="produto-carrinho">

                <div>
                    <strong>${produto.nome}</strong><br>
                    ${produto.quantidade}x ${produto.preco}
                </div>

                <button onclick="removerCarrinho(${i})">
                    ✕
                </button>

            </div>
        `;
    });

    lista.innerHTML += `
        <hr>

        <div class="total-carrinho">
            <strong>Total</strong>
            <strong>R$ ${total.toFixed(2).replace(".", ",")}</strong>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", atualizarCarrinho);