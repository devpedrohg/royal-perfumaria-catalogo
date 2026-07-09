let categoriaAtual = "todos";

const gridProdutos = document.getElementById("gridProdutos");
const campoBusca = document.getElementById("campoBusca");
const btnBuscar = document.getElementById("btnBuscar");
const filtros = document.querySelectorAll(".filtro");
const ordenarProdutos = document.getElementById("ordenarProdutos");
const quantidadeProdutos = document.getElementById("quantidadeProdutos");

function precoNumero(preco){
    return Number(
        String(preco)
            .replace("R$", "")
            .replace(".", "")
            .replace(",", ".")
            .trim()
    );
}

function criarCard(produto){
    return `
        <div class="card-produto">
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

function abrirModal(nomeProduto){
    const modal = document.getElementById("modalCarrinho");
    const produtoModal = document.getElementById("produtoModal");

    if(modal && produtoModal){
        produtoModal.innerText = nomeProduto;
        modal.classList.add("ativo");
    }
}

function renderizar(lista){
    gridProdutos.innerHTML = lista.map(criarCard).join("");

    document.querySelectorAll(".card-produto").forEach((card, index) => {
        const produto = lista[index];

        let qtd = 1;

        const menos = card.querySelector(".menos");
        const mais = card.querySelector(".mais");
        const textoQtd = card.querySelector(".quantidade");
        const comprar = card.querySelector(".btn-comprar");

        mais.onclick = () => {
            qtd++;
            textoQtd.innerText = qtd;
        };

        menos.onclick = () => {
            if(qtd > 1){
                qtd--;
                textoQtd.innerText = qtd;
            }
        };

        comprar.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            adicionarCarrinho({
                nome: produto.nome,
                preco: produto.preco,
                imagem: produto.imagem,
                quantidade: qtd
            });

            atualizarCarrinho();
            abrirModal(produto.nome);

            qtd = 1;
            textoQtd.innerText = "1";
        };
    });

    quantidadeProdutos.innerText =
        lista.length === 1
            ? "1 produto encontrado"
            : `${lista.length} produtos encontrados`;
}

function filtrar(){
    const termo = campoBusca.value.toLowerCase().trim();

    let lista = produtos.filter(produto => {
        const bateBusca =
            produto.nome.toLowerCase().includes(termo) ||
            produto.categoria.toLowerCase().includes(termo);

        const bateCategoria =
            categoriaAtual === "todos" ||
            produto.filtro === categoriaAtual;

        return bateBusca && bateCategoria;
    });

    const ordem = ordenarProdutos.value;

    lista.sort((a, b) => {
        if(ordem === "menor-preco") return precoNumero(a.preco) - precoNumero(b.preco);
        if(ordem === "maior-preco") return precoNumero(b.preco) - precoNumero(a.preco);
        if(ordem === "az") return a.nome.localeCompare(b.nome);
        if(ordem === "za") return b.nome.localeCompare(a.nome);
        return 0;
    });

    renderizar(lista);
}

btnBuscar.onclick = filtrar;
campoBusca.oninput = filtrar;
ordenarProdutos.onchange = filtrar;

filtros.forEach(filtro => {
    filtro.onclick = () => {
        filtros.forEach(btn => btn.classList.remove("ativo"));
        filtro.classList.add("ativo");
        categoriaAtual = filtro.dataset.categoria;
        filtrar();
    };
});

renderizar(produtos);

const modal = document.getElementById("modalCarrinho");
const continuarCompra = document.getElementById("continuarCompra");
const irCheckout = document.getElementById("irCheckout");

if(modal && continuarCompra && irCheckout){
    continuarCompra.onclick = () => {
        modal.classList.remove("ativo");
    };

    irCheckout.onclick = () => {
        window.location.href = "checkout.html";
    };

    modal.onclick = (e) => {
        if(e.target === modal){
            modal.classList.remove("ativo");
        }
    };
}