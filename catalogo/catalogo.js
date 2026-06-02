const cards = document.querySelectorAll(".card-produto");

cards.forEach(card => {

    const menos = card.querySelector(".menos");
    const mais = card.querySelector(".mais");
    const quantidade = card.querySelector(".quantidade");
    const botaoComprar = card.querySelector(".btn-comprar");

    const nome =
        card.querySelector("h3").innerText;

    const preco =
        card.querySelector(".preco").innerText;

    let valor = 1;

    mais.addEventListener("click", () => {

        valor++;

        quantidade.innerText = valor;

    });

    menos.addEventListener("click", () => {

        if(valor > 1){

            valor--;

            quantidade.innerText = valor;

        }

    });

    botaoComprar.addEventListener("click", () => {

        adicionarCarrinho(
            nome,
            preco,
            valor
        );

    });

});

function adicionarCarrinho(nome, preco, qtd){

    let carrinho =
        JSON.parse(
            localStorage.getItem("carrinhoRoyal")
        ) || [];

    carrinho.push({

        nome: nome,
        preco: preco,
        quantidade: qtd

    });

    localStorage.setItem(
        "carrinhoRoyal",
        JSON.stringify(carrinho)
    );

    atualizarCarrinho();
}

function atualizarCarrinho(){

    const dropdown =
        document.querySelector(".dropdown-carrinho");

    let carrinho =
        JSON.parse(
            localStorage.getItem("carrinhoRoyal")
        ) || [];

    if(carrinho.length === 0){

        dropdown.innerHTML = `

            <h3>Seu Carrinho</h3>
            <p>Carrinho vazio.</p>

        `;

        return;
    }

    let html = `
        <h3>Seu Carrinho</h3>
    `;

    carrinho.forEach(produto => {

        html += `

            <div class="item-carrinho">

                <strong>${produto.nome}</strong>

                <span>
                    ${produto.quantidade}x
                </span>

                <p>${produto.preco}</p>

            </div>

        `;

    });

    dropdown.innerHTML = html;
}

atualizarCarrinho();
