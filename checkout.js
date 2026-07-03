const gridProdutos = document.getElementById("gridProdutos");
const campoBusca = document.getElementById("campoBusca");
const btnBuscar = document.getElementById("btnBuscar");
const quantidadeProdutos = document.getElementById("quantidadeProdutos");
const filtros = document.querySelectorAll(".filtro");
const ordenarProdutos = document.getElementById("ordenarProdutos");

const CHAVE_CARRINHO = "carrinhoRoyal";
let categoriaAtual = "todos";

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

    let totalValor = 0;

    let html = `<h3>Seu Carrinho</h3>`;

    carrinho.forEach((produto, index) => {
        const precoNumero = converterPreco(produto.preco);

        totalItens += produto.quantidade;
        totalValor += precoNumero * produto.quantidade;

        html += `
            <div class="item-carrinho">
                <div>
                    <strong>${produto.nome}</strong>
                    <span>${produto.quantidade}x ${produto.preco}</span>
                </div>

                <button class="btn-remover" type="button" onclick="removerItem(${index})">
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

}

function criarCardProduto(produto){
    return `
        <div class="card-produto" data-categoria="${produto.filtro}">
            <div class="imagem-produto">
                <img src="${produto.imagem}" alt="${produto.nome}">
            </div>

            <div class="info-produto">
                <h3>${produto.nome}</h3>

                <span class="categoria">${produto.categoria}</span>

                <div class="preco">
                    ${produto.preco}
                </div>

                <div class="acoes-produto">
                    <div class="controle-quantidade">
                        <button class="menos" type="button">−</button>
                        <span class="quantidade">1</span>
                        <button class="mais" type="button">+</button>
                    </div>

                    <button class="btn-comprar" type="button">
                        <svg xmlns="http://www.w3.org/2000/svg"
                             width="18"
                             height="18"
                             fill="none"
                             stroke="currentColor"
                             stroke-width="2"
                             viewBox="0 0 24 24">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"></path>
                        </svg>
                        COMPRAR
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderizarProdutos(lista){
    gridProdutos.innerHTML = "";

    lista.forEach(produto => {
        gridProdutos.innerHTML += criarCardProduto(produto);
    });

    ativarEventosDosCards(lista);
    atualizarContadorProdutos(lista.length);
}

function ativarEventosDosCards(listaProdutos){
    const cards = document.querySelectorAll(".card-produto");

    cards.forEach((card, index) => {
        const produto = listaProdutos[index];

        const btnMenos = card.querySelector(".menos");
        const btnMais = card.querySelector(".mais");
        const textoQuantidade = card.querySelector(".quantidade");
        const btnComprar = card.querySelector(".btn-comprar");

        let quantidade = 1;

        btnMais.addEventListener("click", () => {
            quantidade++;
            textoQuantidade.innerText = quantidade;
        });

        btnMenos.addEventListener("click", () => {
            if(quantidade > 1){
                quantidade--;
                textoQuantidade.innerText = quantidade;
            }
        });

            btnComprar.addEventListener("click", () => {
    adicionarCarrinho({
        nome: produto.nome,
        preco: produto.preco,
        imagem: produto.imagem,
        quantidade: quantidade
    });

});

function obterProdutosFiltrados(){
    const termo = campoBusca.value.toLowerCase().trim();

    let lista = produtos.filter(produto => {
        const nome = produto.nome.toLowerCase();
        const categoria = produto.categoria.toLowerCase();

        const bateBusca = nome.includes(termo) || categoria.includes(termo);

        const bateCategoria =
            categoriaAtual === "todos" ||
            produto.filtro === categoriaAtual;

        return bateBusca && bateCategoria;
    });

    return ordenarLista(lista);
}

function ordenarLista(lista){
    const tipo = ordenarProdutos.value;
    const copia = [...lista];

    copia.sort((a, b) => {
        const precoA = converterPreco(a.preco);
        const precoB = converterPreco(b.preco);

        if(tipo === "menor-preco") return precoA - precoB;
        if(tipo === "maior-preco") return precoB - precoA;
        if(tipo === "az") return a.nome.localeCompare(b.nome);
        if(tipo === "za") return b.nome.localeCompare(a.nome);

        return 0;
    });

    return copia;
}

function atualizarProdutos(){
    renderizarProdutos(obterProdutosFiltrados());
}

function atualizarContadorProdutos(total){
    if(total === 0){
        quantidadeProdutos.innerText = "Nenhum produto encontrado";
    }else if(total === 1){
        quantidadeProdutos.innerText = "1 produto encontrado";
    }else{
        quantidadeProdutos.innerText = `${total} produtos encontrados`;
    }
}

function iniciarDropdownCarrinho(){
    const btnCarrinho = document.querySelector(".btn-carrinho");
    const dropdown = document.querySelector(".dropdown-carrinho");

    if(!btnCarrinho || !dropdown) return;

    btnCarrinho.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("ativo");
    });

    dropdown.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    document.addEventListener("click", () => {
        dropdown.classList.remove("ativo");
    });
}

btnBuscar.addEventListener("click", atualizarProdutos);
campoBusca.addEventListener("input", atualizarProdutos);

filtros.forEach(filtro => {
    filtro.addEventListener("click", () => {
        filtros.forEach(btn => btn.classList.remove("ativo"));
        filtro.classList.add("ativo");
        categoriaAtual = filtro.dataset.categoria;
        atualizarProdutos();
    });
});

ordenarProdutos.addEventListener("change", atualizarProdutos);

renderizarProdutos(produtos);
atualizarCarrinho();
iniciarDropdownCarrinho();