const CHAVE_CARRINHO = "carrinhoRoyal";

function pegarCarrinho(){
    return JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];
}

function salvarCarrinho(carrinho){
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
}

function converterPreco(preco){
    return Number(
        String(preco)
            .replace("R$", "")
            .replace(".", "")
            .replace(",", ".")
            .trim()
    );
}

function formatarMoeda(valor){
    return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

function adicionarCarrinho(produto){
    const carrinho = pegarCarrinho();
    const existente = carrinho.find(item => item.nome === produto.nome);

    if(existente){
        existente.quantidade += produto.quantidade;
    }else{
        carrinho.push({
            nome: produto.nome,
            preco: produto.preco,
            imagem: produto.imagem || "",
            quantidade: produto.quantidade || 1
        });
    }

    salvarCarrinho(carrinho);
    atualizarCarrinho();
}

function removerItemCarrinho(index){
    const carrinho = pegarCarrinho();
    carrinho.splice(index, 1);
    salvarCarrinho(carrinho);
    atualizarCarrinho();
}

function aumentarItemCarrinho(index){
    const carrinho = pegarCarrinho();
    carrinho[index].quantidade++;
    salvarCarrinho(carrinho);
    atualizarCarrinho();
}

function diminuirItemCarrinho(index){
    const carrinho = pegarCarrinho();

    if(carrinho[index].quantidade > 1){
        carrinho[index].quantidade--;
    }else{
        carrinho.splice(index, 1);
    }

    salvarCarrinho(carrinho);
    atualizarCarrinho();
}

function atualizarCarrinho(){
    const contador = document.querySelector(".contador-carrinho");
    const dropdown = document.querySelector(".dropdown-carrinho");
    const carrinho = pegarCarrinho();

    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);

    if(contador){
        contador.innerText = totalItens;
    }

    if(!dropdown) return;

    if(carrinho.length === 0){
        dropdown.innerHTML = `
            <h3>Seu Carrinho</h3>
            <p class="carrinho-vazio">Carrinho vazio.</p>
        `;
        return;
    }

    let total = 0;

    let html = `
        <h3>Seu Carrinho</h3>
        <div class="lista-carrinho">
    `;

    carrinho.forEach((produto, index) => {
        const preco = converterPreco(produto.preco);
        const subtotal = preco * produto.quantidade;

        total += subtotal;

        html += `
            <div class="item-carrinho">

                <div class="foto-carrinho">
                    ${produto.imagem ? `<img src="${produto.imagem}" alt="${produto.nome}">` : "🛍️"}
                </div>

                <div class="info-carrinho">
                    <strong>${produto.nome}</strong>
                    <span>${produto.preco}</span>

                    <div class="controle-carrinho">
                        <button type="button" onclick="diminuirItemCarrinho(${index})">−</button>
                        <span>${produto.quantidade}</span>
                        <button type="button" onclick="aumentarItemCarrinho(${index})">+</button>
                    </div>
                </div>

                <button class="btn-remover" type="button" onclick="removerItemCarrinho(${index})">
                    ✕
                </button>

            </div>
        `;
    });

    html += `
        </div>

        <div class="footer-carrinho">
            <div>
                <span>Total</span>
                <strong>${formatarMoeda(total)}</strong>
            </div>

            <a href="checkout.html" class="btn-finalizar">
                Finalizar Pedido
            </a>
        </div>
    `;

    dropdown.innerHTML = html;
}

function iniciarCarrinho(){
    atualizarCarrinho();

    const btnCarrinho = document.querySelector(".btn-carrinho");
    const dropdown = document.querySelector(".dropdown-carrinho");

    if(btnCarrinho && dropdown){
        btnCarrinho.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.toggle("ativo");
        });

        dropdown.addEventListener("click", e => e.stopPropagation());

        document.addEventListener("click", () => {
            dropdown.classList.remove("ativo");
        });
    }
}

document.addEventListener("DOMContentLoaded", iniciarCarrinho);