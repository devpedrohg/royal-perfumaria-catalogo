const CHAVE = "carrinhoRoyal";
const WHATSAPP_LOJA = "5562999736569 ";

const listaCheckout = document.getElementById("listaCheckout");
const totalCheckout = document.getElementById("totalCheckout");
const btnFinalizar = document.getElementById("btnFinalizar");

function pegarCarrinho(){
    return JSON.parse(localStorage.getItem(CHAVE)) || [];
}

function salvarCarrinho(carrinho){
    localStorage.setItem(CHAVE, JSON.stringify(carrinho));
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

function renderizarCheckout(){
    const carrinho = pegarCarrinho();

    if(carrinho.length === 0){
        listaCheckout.innerHTML = "<p class='vazio'>Seu carrinho está vazio.</p>";
        totalCheckout.innerText = "R$ 0,00";
        btnFinalizar.disabled = true;
        return;
    }

    btnFinalizar.disabled = false;

    let total = 0;
    listaCheckout.innerHTML = "";

    carrinho.forEach((item, index) => {
        const subtotal = converterPreco(item.preco) * item.quantidade;
        total += subtotal;

        listaCheckout.innerHTML += `
            <div class="item-checkout">
                <img src="${item.imagem}" alt="${item.nome}">

                <div class="info-item">
                    <strong>${item.nome}</strong>
                    <span>${item.preco}</span>

                    <div class="controle">
                        <button onclick="diminuir(${index})">−</button>
                        <span>${item.quantidade}</span>
                        <button onclick="aumentar(${index})">+</button>
                    </div>
                </div>

                <button class="remover" onclick="remover(${index})">✕</button>
            </div>
        `;
    });

    totalCheckout.innerText = formatarMoeda(total);
}

function aumentar(index){
    const carrinho = pegarCarrinho();
    carrinho[index].quantidade++;
    salvarCarrinho(carrinho);
    renderizarCheckout();
}

function diminuir(index){
    const carrinho = pegarCarrinho();

    if(carrinho[index].quantidade > 1){
        carrinho[index].quantidade--;
    }else{
        carrinho.splice(index, 1);
    }

    salvarCarrinho(carrinho);
    renderizarCheckout();
}

function remover(index){
    const carrinho = pegarCarrinho();
    carrinho.splice(index, 1);
    salvarCarrinho(carrinho);
    renderizarCheckout();
}

document.getElementById("cep").addEventListener("blur", async () => {
    const cep = document.getElementById("cep").value.replace(/\D/g, "");

    if(cep.length !== 8) return;

    try{
        const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const dados = await resposta.json();

        if(dados.erro) return;

        document.getElementById("endereco").value = dados.logradouro || "";
        document.getElementById("bairro").value = dados.bairro || "";
        document.getElementById("cidade").value = dados.localidade || "";
        document.getElementById("uf").value = dados.uf || "";
    }catch{
        console.log("Erro ao buscar CEP");
    }
});

btnFinalizar.addEventListener("click", () => {
    const carrinho = pegarCarrinho();

    if(carrinho.length === 0){
        alert("Seu carrinho está vazio.");
        return;
    }

    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const cep = document.getElementById("cep").value.trim();
    const endereco = document.getElementById("endereco").value.trim();
    const numero = document.getElementById("numero").value.trim();
    const bairro = document.getElementById("bairro").value.trim();
    const cidade = document.getElementById("cidade").value.trim();
    const uf = document.getElementById("uf").value.trim();
    const complemento = document.getElementById("complemento").value.trim();
    const pagamento = document.getElementById("pagamento").value;
    const observacao = document.getElementById("observacao").value.trim();

    if(!nome || !telefone || !cep || !endereco || !numero || !bairro || !cidade || !uf || !pagamento){
        alert("Preencha todos os campos obrigatórios.");
        return;
    }

    let total = 0;

    let mensagem = `🛍️ *NOVO PEDIDO - ROYAL PERFUMARIA*%0A%0A`;

    mensagem += `👤 *Cliente:* ${nome}%0A`;
    mensagem += `📞 *WhatsApp:* ${telefone}%0A%0A`;

    mensagem += `📍 *Entrega:*%0A`;
    mensagem += `${endereco}, Nº ${numero}%0A`;
    mensagem += `${bairro} - ${cidade}/${uf}%0A`;
    mensagem += `CEP: ${cep}%0A`;

    if(complemento){
        mensagem += `Complemento: ${complemento}%0A`;
    }

    mensagem += `%0A🛒 *Produtos:*%0A`;

    carrinho.forEach(item => {
        const subtotal = converterPreco(item.preco) * item.quantidade;
        total += subtotal;

        mensagem += `%0A• ${item.nome}%0A`;
        mensagem += `Qtd: ${item.quantidade}%0A`;
        mensagem += `Preço: ${item.preco}%0A`;
        mensagem += `Subtotal: ${formatarMoeda(subtotal)}%0A`;
    });

    mensagem += `%0A💳 *Pagamento:* ${pagamento}%0A`;
    mensagem += `💰 *Total:* ${formatarMoeda(total)}%0A`;

    if(observacao){
        mensagem += `%0A📝 *Observação:* ${observacao}%0A`;
    }

    window.open(`https://wa.me/${WHATSAPP_LOJA}?text=${mensagem}`, "_blank");
});

renderizarCheckout();