const maisVendidosNomes = [
    "Perfume Asad Black Lattafa 100ml - Eua De Perfum",
    "Perfume Club de Nuit Intense Man Armaf Eau de Toilette",
    "Perfume Masculino Salvo Eau de Parfum 100 Ml- Maison Alhambra",
    "Perfume Al Noble Ameer Eau de Parfum Lattafa",
    "Yara Candy Lattafa Eau de Parfum - Perfume Feminino 100ml.",
    "Perfume Yara Eau de Parfum 100ml(Arabe) – Feminino",
    "Perfume Árabe Badee Al Oud For Glory Lattafa Eau de Parfum 100Ml",
    "Perfume Khamrah Eau De Parfum Compartilhável - Lattafa"
];

const carrossel = document.getElementById("carrosselMaisVendidos");

const maisVendidos = produtos.filter(produto =>
    maisVendidosNomes.includes(produto.nome)
);

maisVendidos.forEach(produto => {
    carrossel.innerHTML += `
        <div class="card-vendido">
            <div class="img-vendido">
                <img src="${produto.imagem}" alt="${produto.nome}">
            </div>

            <div class="info-vendido">
                <h3>${produto.nome}</h3>
                <span>${produto.categoria}</span>
                <strong>${produto.preco}</strong>

                <div class="acoes-vendido">
                    <div class="controle-quantidade">
                        <button class="menos" type="button">−</button>
                        <span class="quantidade">1</span>
                        <button class="mais" type="button">+</button>
                    </div>

                    <button class="btn-comprar" type="button">
                        🛒 Comprar
                    </button>
                </div>
            </div>
        </div>
    `;
});

document.querySelectorAll(".card-vendido").forEach(card => {
    const menos = card.querySelector(".menos");
    const mais = card.querySelector(".mais");
    const quantidade = card.querySelector(".quantidade");
    const botao = card.querySelector(".btn-comprar");

    const nome = card.querySelector("h3").innerText;
    const preco = card.querySelector("strong").innerText;
    const imagem = card.querySelector("img").getAttribute("src");

    let qtd = 1;

    mais.addEventListener("click", () => {
        qtd++;
        quantidade.innerText = qtd;
    });

    menos.addEventListener("click", () => {
        if(qtd > 1){
            qtd--;
            quantidade.innerText = qtd;
        }
    });

    botao.addEventListener("click", () => {
        adicionarCarrinho({
            nome,
            preco,
            imagem,
            quantidade: qtd
        });
    });
});

document.querySelector(".seta-direita").addEventListener("click", () => {
    carrossel.scrollBy({ left: 340, behavior: "smooth" });
});

document.querySelector(".seta-esquerda").addEventListener("click", () => {
    carrossel.scrollBy({ left: -340, behavior: "smooth" });
});