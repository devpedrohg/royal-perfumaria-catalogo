/* =====================================================
   HERO SLIDER
===================================================== */

const heroSlider = document.getElementById("heroSlider");

if (heroSlider) {
    const slides = heroSlider.querySelectorAll(".slide");
    const dots = heroSlider.querySelectorAll(".dot");
    const btnAnterior = heroSlider.querySelector(".prev");
    const btnProximo = heroSlider.querySelector(".next");

    let slideAtual = 0;
    let intervaloSlider = null;

    function mostrarSlide(indice) {
        if (slides.length === 0) return;

        slideAtual = (indice + slides.length) % slides.length;

        slides.forEach((slide, index) => {
            slide.classList.toggle("ativo", index === slideAtual);
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle("ativo", index === slideAtual);
        });
    }

    function pararAutoplay() {
        if (intervaloSlider) {
            clearInterval(intervaloSlider);
            intervaloSlider = null;
        }
    }

    function iniciarAutoplay() {
        pararAutoplay();

        if (slides.length > 1) {
            intervaloSlider = setInterval(() => {
                mostrarSlide(slideAtual + 1);
            }, 5000);
        }
    }

    btnAnterior?.addEventListener("click", () => {
        mostrarSlide(slideAtual - 1);
        iniciarAutoplay();
    });

    btnProximo?.addEventListener("click", () => {
        mostrarSlide(slideAtual + 1);
        iniciarAutoplay();
    });

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            mostrarSlide(Number(dot.dataset.slide));
            iniciarAutoplay();
        });
    });

    heroSlider.addEventListener("mouseenter", pararAutoplay);
    heroSlider.addEventListener("mouseleave", iniciarAutoplay);

    mostrarSlide(0);
    iniciarAutoplay();
}


/* =====================================================
   CEP
===================================================== */

window.salvarCep = function salvarCep() {
    const cepInput = document.getElementById("cepInput");
    const cepTexto = document.getElementById("cepTexto");

    if (!cepInput || !cepTexto) return;

    const cep = cepInput.value.trim();

    if (!cep) {
        alert("Digite um CEP válido.");
        return;
    }

    cepTexto.textContent = cep;
};


/* =====================================================
   FUNÇÕES AUXILIARES
===================================================== */

function ajustarImagemIndex(caminho) {
    return String(caminho || "").replace("../", "");
}

function abrirCarrinhoIndex() {
    const dropdown = document.querySelector(".dropdown-carrinho");

    if (!dropdown) return;

    dropdown.classList.add("ativo");
}
function abrirModal(nomeProduto){

    const modal = document.getElementById("modalCarrinho");
    const produtoModal = document.getElementById("produtoModal");

    if(!modal || !produtoModal) return;

    produtoModal.textContent = nomeProduto;
    modal.classList.add("ativo");

}



/* =====================================================
   MAIS VENDIDOS
===================================================== */

const containerMaisVendidos =
    document.getElementById("maisVendidos");

if (
    containerMaisVendidos &&
    typeof produtos !== "undefined" &&
    Array.isArray(produtos)
) {
    const maisVendidos = produtos.slice(0, 8);

    function criarCardMaisVendido(produto) {
        return `
            <article class="card-vendido">

                <div class="img-vendido">
                    <img
                        src="${ajustarImagemIndex(produto.imagem)}"
                        alt="${produto.nome}"
                    >
                </div>

                <div class="info-vendido">

                    <h3>${produto.nome}</h3>

                    <span>${produto.categoria}</span>

                    <strong>${produto.preco}</strong>

                    <div class="acoes-vendido">

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

                        <button
                            class="btn-comprar-vendido"
                            type="button"
                        >
                            🛒 COMPRAR
                        </button>

                    </div>

                </div>

            </article>
        `;
    }

    containerMaisVendidos.innerHTML = maisVendidos
        .map(criarCardMaisVendido)
        .join("");

    containerMaisVendidos
        .querySelectorAll(".card-vendido")
        .forEach((card, index) => {
            const produto = maisVendidos[index];

            const btnMenos = card.querySelector(".menos");
            const btnMais = card.querySelector(".mais");
            const textoQuantidade =
                card.querySelector(".quantidade");

            const btnComprar =
                card.querySelector(".btn-comprar-vendido");

            textoQuantidade.textContent = "0";

            btnMais?.addEventListener("click", () => {
                if (typeof adicionarCarrinho !== "function") {
                    console.error(
                        "A função adicionarCarrinho não foi carregada."
                    );
                    return;
                }

                const quantidadeAtual =
                    Number(textoQuantidade.textContent) || 0;

                adicionarCarrinho({
                    nome: produto.nome,
                    preco: produto.preco,
                    imagem: ajustarImagemIndex(produto.imagem),
                    quantidade: 1
                });

                textoQuantidade.textContent =
                    quantidadeAtual + 1;
            });

            btnMenos?.addEventListener("click", () => {
                const quantidadeAtual =
                    Number(textoQuantidade.textContent) || 0;

                if (quantidadeAtual <= 0) return;

                if (
                    typeof diminuirProdutoDoCarrinho !==
                    "function"
                ) {
                    console.error(
                        "A função diminuirProdutoDoCarrinho não foi carregada."
                    );
                    return;
                }

                diminuirProdutoDoCarrinho(produto.nome);

                textoQuantidade.textContent =
                    quantidadeAtual - 1;
            });

            btnComprar?.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();

                const quantidadeAtual =
                    Number(textoQuantidade.textContent) || 0;

                /*
                   Se ainda estiver em 0,
                   Comprar adiciona 1 unidade.
                */
                if (quantidadeAtual === 0) {
                    if (
                        typeof adicionarCarrinho !==
                        "function"
                    ) {
                        console.error(
                            "A função adicionarCarrinho não foi carregada."
                        );
                        return;
                    }

                    adicionarCarrinho({
                        nome: produto.nome,
                        preco: produto.preco,
                        imagem: ajustarImagemIndex(
                            produto.imagem
                        ),
                        quantidade: 1
                    });

                    textoQuantidade.textContent = "1";
                }

                abrirModal(produto.nome);
            });
        });


    /* =================================================
       SETAS DO CARROSSEL
    ================================================= */

    const setaDireita = document.querySelector(
        ".seta-carrossel.direita"
    );

    const setaEsquerda = document.querySelector(
        ".seta-carrossel.esquerda"
    );

    setaDireita?.addEventListener("click", () => {
        containerMaisVendidos.scrollBy({
            left: 320,
            behavior: "smooth"
        });
    });

    setaEsquerda?.addEventListener("click", () => {
        containerMaisVendidos.scrollBy({
            left: -320,
            behavior: "smooth"
        });
    });
} else {
    console.error(
        "Não foi possível carregar os produtos Mais Vendidos."
    );
}
const modal = document.getElementById("modalCarrinho");

document.getElementById("continuarCompra")?.addEventListener("click", () => {
    modal.classList.remove("ativo");
});

document.getElementById("irCheckout")?.addEventListener("click", () => {
    window.location.href = "checkout.html";
});

modal?.addEventListener("click", (e) => {
    if(e.target === modal){
        modal.classList.remove("ativo");
    }
});