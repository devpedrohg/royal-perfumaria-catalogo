const gridProdutos = document.getElementById("gridProdutos");
const campoBusca = document.getElementById("campoBusca");
const btnBuscar = document.getElementById("btnBuscar");
const quantidadeProdutos = document.getElementById("quantidadeProdutos");
const filtros = document.querySelectorAll(".filtro");
const ordenarProdutos = document.getElementById("ordenarProdutos");

const CHAVE = "carrinhoRoyal";
let categoriaAtual = "todos";

function pegarCarrinho(){
    return JSON.parse(localStorage.getItem(CHAVE)) || [];
}

function salvarCarrinho(carrinho){
    localStorage.setItem(CHAVE, JSON.stringify(carrinho));
}

function converterPreco(preco){
    return Number(
        preco.replace("R$", "")
             .replace(".", "")
             .replace(",", ".")
             .trim()
    );
}

function adicionarCarrinho(produto){
    const carrinho = pegarCarrinho();
    const existente = carrinho.find(item => item.nome === produto.nome);

    if(existente){
        existente.quantidade += produto.quantidade;
    }else{
        carrinho.push(produto);
    }

    salvarCarrinho(carrinho);
    atualizarCarrinho();
}

function removerItem(index){
    const carrinho = pegarCarrinho();
    carrinho.splice(index, 1);
    salvarCarrinho(carrinho);
    atualizarCarrinho();
}

function atualizarCarrinho(){
    const dropdown = document.querySelector(".dropdown-carrinho");
    const contador = document.querySelector(".contador-carrinho");

    if(!dropdown || !contador) return;

    const carrinho = pegarCarrinho();

    if(carrinho.length === 0){
        dropdown.innerHTML = `
            <h3>Seu Carrinho</h3>
            <p>Carrinho vazio.</p>
        `;
        contador.innerText = "0";
        return;
    }

    let totalItens = 0;
    let totalValor = 0;

    let html = `<h3>Seu Carrinho</h3>`;

    carrinho.forEach((produto, index) => {
        totalItens += produto.quantidade;
        totalValor += converterPreco(produto.preco) * produto.quantidade;

        html += `
            <div class="item-carrinho">
                <div>
                    <strong>${produto.nome}</strong>
                    <span>${produto.quantidade}x ${produto.preco}</span>
                </div>

                <button class="btn-remover" onclick="removerItem(${index})">
                    ✕
                </button>
            </div>
        `;
    });

    html += `
        <div class="footer-carrinho">
            <strong>Total:</strong>
            <span>R$ ${totalValor.toFixed(2).replace(".", ",")}</span>
        </div>

        <a href="../checkout.html" class="btn-finalizar">
            Finalizar Pedido
        </a>
    `;

    dropdown.innerHTML = html;
    contador.innerText = totalItens;
}

function criarCard(produto){
    return `
        <div class="card-produto" data-categoria="${produto.filtro}">
            <div class="imagem-produto">
                <img src="${produto.imagem}" alt="${produto.nome}">
            </div>

            <div class="info-produto">
                <h3>${produto.nome}</h3>
                <span class="categoria">${produto.categoria}</span>

                <div class="preco">${produto.preco}</div>

                <div class="acoes-produto">
                    <div class="controle-quantidade">
                        <button class="menos" type="button">−</button>
                        <span class="quantidade">1</span>
                        <button class="mais" type="button">+</button>
                    </div>

                    <button class="btn-comprar" type="button">
                        🛒 COMPRAR
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderizarProdutos(lista){
    gridProdutos.innerHTML = "";

    lista.forEach(produto => {
        gridProdutos.innerHTML += criarCard(produto);
    });

    document.querySelectorAll(".card-produto").forEach((card, index) => {
        const produto = lista[index];

        const menos = card.querySelector(".menos");
        const mais = card.querySelector(".mais");
        const quantidadeTexto = card.querySelector(".quantidade");
        const comprar = card.querySelector(".btn-comprar");

        let quantidade = 1;

        mais.addEventListener("click", () => {
            quantidade++;
            quantidadeTexto.innerText = quantidade;
        });

        menos.addEventListener("click", () => {
            if(quantidade > 1){
                quantidade--;
                quantidadeTexto.innerText = quantidade;
            }
        });

        comprar.addEventListener("click", () => {
            adicionarCarrinho({
                nome: produto.nome,
                preco: produto.preco,
                imagem: produto.imagem,
                quantidade: quantidade
            });

            quantidade = 1;
            quantidadeTexto.innerText = "1";
        });
    });

    atualizarQuantidade(lista.length);
}

function filtrarProdutos(){
    const termo = campoBusca.value.toLowerCase().trim();

    let lista = produtos.filter(produto => {
        const busca =
            produto.nome.toLowerCase().includes(termo) ||
            produto.categoria.toLowerCase().includes(termo);

        const categoria =
            categoriaAtual === "todos" ||
            produto.filtro === categoriaAtual;

        return busca && categoria;
    });

    lista = ordenarLista(lista);

    renderizarProdutos(lista);
}

function ordenarLista(lista){
    const tipo = ordenarProdutos.value;

    return [...lista].sort((a, b) => {
        const precoA = converterPreco(a.preco);
        const precoB = converterPreco(b.preco);

        if(tipo === "menor-preco") return precoA - precoB;
        if(tipo === "maior-preco") return precoB - precoA;
        if(tipo === "az") return a.nome.localeCompare(b.nome);
        if(tipo === "za") return b.nome.localeCompare(a.nome);

        return 0;
    });
}

function atualizarQuantidade(total){
    if(total === 0){
        quantidadeProdutos.innerText = "Nenhum produto encontrado";
    }else if(total === 1){
        quantidadeProdutos.innerText = "1 produto encontrado";
    }else{
        quantidadeProdutos.innerText = `${total} produtos encontrados`;
    }
}

btnBuscar.addEventListener("click", filtrarProdutos);
campoBusca.addEventListener("input", filtrarProdutos);
ordenarProdutos.addEventListener("change", filtrarProdutos);

filtros.forEach(filtro => {
    filtro.addEventListener("click", () => {
        filtros.forEach(btn => btn.classList.remove("ativo"));
        filtro.classList.add("ativo");

        categoriaAtual = filtro.dataset.categoria;
        filtrarProdutos();
    });
});

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

renderizarProdutos(produtos);
atualizarCarrinho();