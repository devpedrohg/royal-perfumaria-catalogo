const elementos = {
    grid: document.getElementById("gridProdutos"),
    busca: document.getElementById("campoBusca"),
    btnBuscar: document.getElementById("btnBuscar"),
    filtros: document.querySelectorAll(".filtro"),
    ordenacao: document.getElementById("ordenarProdutos"),
    quantidade: document.getElementById("quantidadeProdutos"),
    modal: document.getElementById("modalCarrinho"),
    produtoModal: document.getElementById("produtoModal"),
    continuarCompra: document.getElementById("continuarCompra"),
    irCheckout: document.getElementById("irCheckout")
};

const parametrosUrl = new URLSearchParams(window.location.search);

const categoriaUrl =
    parametrosUrl.get("categoria") || "todos";

const categoriasPermitidas = [
    "todos",
    "masculino",
    "feminino",
    "body-splash",
    "spray",
    "outros"
];

const estado = {
    categoria: categoriasPermitidas.includes(categoriaUrl)
        ? categoriaUrl
        : "todos"
};

function converterPreco(preco) {
    return Number(
        String(preco)
            .replace("R$", "")
            .replace(/\./g, "")
            .replace(",", ".")
            .trim()
    ) || 0;
}

function criarCard(produto) {
    return `
        <article class="card-produto">
            <div class="imagem-produto">
                <img src="${produto.imagem}" alt="${produto.nome}">
            </div>

            <div class="info-produto">
                <h3>${produto.nome}</h3>

                <span class="categoria">
                    ${produto.categoria}
                </span>

                <div class="preco">
                    ${produto.preco}
                </div>

                <div class="acoes-produto">
                    <div class="controle-quantidade">
                        <button
                            class="menos"
                            type="button"
                            aria-label="Diminuir quantidade"
                        >
                            −
                        </button>

                        <span class="quantidade">0</span>

                        <button
                            class="mais"
                            type="button"
                            aria-label="Aumentar quantidade"
                        >
                            +
                        </button>
                    </div>

                    <button class="btn-comprar" type="button">
                        🛒 COMPRAR
                    </button>
                </div>
            </div>
        </article>
    `;
}

function abrirModal(nomeProduto) {
    if (!elementos.modal || !elementos.produtoModal) return;

    elementos.produtoModal.textContent = nomeProduto;
    elementos.modal.classList.add("ativo");
}

function fecharModal() {
    elementos.modal?.classList.remove("ativo");
}

function adicionarProdutoAoCarrinho(produto, quantidadeExibida) {
    if (typeof adicionarCarrinho !== "function") {
        console.error("A função adicionarCarrinho não foi carregada.");
        return;
    }

    const quantidadeFinal = Math.max(
        1,
        Number(quantidadeExibida) || 0
    );

    adicionarCarrinho({
        nome: produto.nome,
        preco: produto.preco,
        imagem: produto.imagem,
        quantidade: quantidadeFinal
    });

    abrirModal(produto.nome);
}

function configurarCard(card, produto) {
    const btnMenos = card.querySelector(".menos");
    const btnMais = card.querySelector(".mais");
    const textoQuantidade = card.querySelector(".quantidade");
    const btnComprar = card.querySelector(".btn-comprar");

    btnMais?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (typeof window.adicionarCarrinho !== "function") {
            console.error("adicionarCarrinho não encontrada.");
            return;
        }

        window.adicionarCarrinho({
            nome: produto.nome,
            preco: produto.preco,
            imagem: produto.imagem,
            quantidade: 1
        });

        textoQuantidade.textContent =
            Number(textoQuantidade.textContent || 0) + 1;
    });

    btnMenos?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const quantidade = Number(textoQuantidade.textContent) || 0;

        if (quantidade <= 0) return;

        if (typeof window.diminuirProdutoDoCarrinho !== "function") {
            console.error("diminuirProdutoDoCarrinho não encontrada.");
            return;
        }

        window.diminuirProdutoDoCarrinho(produto.nome);

        textoQuantidade.textContent = quantidade - 1;
    });

    btnComprar?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (Number(textoQuantidade.textContent) === 0) {
            window.adicionarCarrinho({
                nome: produto.nome,
                preco: produto.preco,
                imagem: produto.imagem,
                quantidade: 1
            });

            textoQuantidade.textContent = "1";
        }

        abrirModal(produto.nome);
    });
}

function atualizarTextoQuantidade(total) {
    if (!elementos.quantidade) return;

    if (total === 0) {
        elementos.quantidade.textContent =
            "Nenhum produto encontrado";
        return;
    }

    elementos.quantidade.textContent =
        total === 1
            ? "1 produto encontrado"
            : `${total} produtos encontrados`;
}

function renderizarProdutos(lista) {
    if (!elementos.grid) return;

    elementos.grid.innerHTML =
        lista.map(criarCard).join("");

    elementos.grid
        .querySelectorAll(".card-produto")
        .forEach((card, index) => {
            configurarCard(card, lista[index]);
        });

    atualizarTextoQuantidade(lista.length);
}

function ordenarProdutos(lista) {
    const tipo = elementos.ordenacao?.value || "padrao";
    const copia = [...lista];

    copia.sort((produtoA, produtoB) => {
        if (tipo === "menor-preco") {
            return (
                converterPreco(produtoA.preco) -
                converterPreco(produtoB.preco)
            );
        }

        if (tipo === "maior-preco") {
            return (
                converterPreco(produtoB.preco) -
                converterPreco(produtoA.preco)
            );
        }

        if (tipo === "az") {
            return produtoA.nome.localeCompare(produtoB.nome);
        }

        if (tipo === "za") {
            return produtoB.nome.localeCompare(produtoA.nome);
        }

        return 0;
    });

    return copia;
}

function obterProdutosFiltrados() {
    const termo =
        elementos.busca?.value.toLowerCase().trim() || "";

    const lista = produtos.filter((produto) => {
        const nome =
            String(produto.nome || "").toLowerCase();

        const categoria =
            String(produto.categoria || "").toLowerCase();

        const correspondeBusca =
            nome.includes(termo) ||
            categoria.includes(termo);

        const correspondeCategoria =
            estado.categoria === "todos" ||
            produto.filtro === estado.categoria;

        return correspondeBusca && correspondeCategoria;
    });

    return ordenarProdutos(lista);
}

function atualizarCatalogo() {
    renderizarProdutos(obterProdutosFiltrados());
}

function configurarFiltros() {
    elementos.filtros.forEach((filtro) => {
        const categoria =
            filtro.dataset.categoria || "todos";

        filtro.classList.toggle(
            "ativo",
            categoria === estado.categoria
        );

        filtro.addEventListener("click", () => {
            elementos.filtros.forEach((botao) => {
                botao.classList.remove("ativo");
            });

            filtro.classList.add("ativo");

            estado.categoria = categoria;

            const novaUrl =
                categoria === "todos"
                    ? "catalogo.html"
                    : `catalogo.html?categoria=${categoria}`;

            window.history.replaceState(
                {},
                "",
                novaUrl
            );

            atualizarCatalogo();
        });
    });
}

function configurarModal() {
    elementos.continuarCompra?.addEventListener(
        "click",
        fecharModal
    );

    elementos.irCheckout?.addEventListener("click", () => {
        window.location.href = "checkout.html";
    });

    elementos.modal?.addEventListener("click", (event) => {
        if (event.target === elementos.modal) {
            fecharModal();
        }
    });
}

function iniciarCatalogo() {
    if (
        typeof produtos === "undefined" ||
        !Array.isArray(produtos)
    ) {
        console.error("O array produtos não foi carregado.");
        return;
    }

    elementos.btnBuscar?.addEventListener(
        "click",
        atualizarCatalogo
    );

    elementos.busca?.addEventListener(
        "input",
        atualizarCatalogo
    );

    elementos.ordenacao?.addEventListener(
        "change",
        atualizarCatalogo
    );

    configurarFiltros();
    configurarModal();
    atualizarCatalogo();
}

iniciarCatalogo();