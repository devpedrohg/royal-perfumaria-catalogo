const CHAVE_PEDIDOS = "pedidosRoyal";

const elementos = {
    lista: document.getElementById("listaPedidos"),
    vazio: document.getElementById("pedidosVazios"),
    busca: document.getElementById("buscaPedido"),
    filtroStatus: document.getElementById("filtroStatus"),
    btnAtualizar: document.getElementById("btnAtualizar"),

    vendasHoje: document.getElementById("vendasHoje"),
    pedidosNovos: document.getElementById("pedidosNovos"),
    pedidosPendentes: document.getElementById("pedidosPendentes"),
    pedidosConcluidos: document.getElementById("pedidosConcluidos"),

    modal: document.getElementById("modalPedido"),
    fecharModal: document.getElementById("fecharModal"),
    modalCodigo: document.getElementById("modalCodigo"),
    modalDetalhes: document.getElementById("modalDetalhes")
};

function pegarPedidos(){
    try{
        return JSON.parse(localStorage.getItem(CHAVE_PEDIDOS)) || [];
    }catch{
        return [];
    }
}

function salvarPedidos(pedidos){
    localStorage.setItem(CHAVE_PEDIDOS, JSON.stringify(pedidos));
}

function formatarMoeda(valor){
    return Number(valor || 0).toLocaleString("pt-BR", {
        style:"currency",
        currency:"BRL"
    });
}

function formatarData(data){
    if(!data) return "—";

    return new Date(data).toLocaleString("pt-BR");
}

function normalizarStatus(status){
    return String(status || "novo")
        .toLowerCase()
        .replace(/\s+/g, "-");
}

function obterPedidosFiltrados(){
    const termo = elementos.busca.value
        .toLowerCase()
        .trim();

    const status = elementos.filtroStatus.value;

    return pegarPedidos().filter(pedido => {
        const busca =
            String(pedido.codigo || "").toLowerCase().includes(termo) ||
            String(pedido.cliente?.nome || "").toLowerCase().includes(termo) ||
            String(pedido.cliente_nome || "").toLowerCase().includes(termo);

        const filtro =
            status === "todos" ||
            normalizarStatus(pedido.status) === status;

        return busca && filtro;
    });
}

function calcularResumo(){
    const pedidos = pegarPedidos();

    const hoje = new Date().toISOString().slice(0,10);

    const vendasHoje = pedidos
        .filter(pedido =>
            String(pedido.criado_em || "").slice(0,10) === hoje &&
            pedido.status !== "cancelado"
        )
        .reduce((total, pedido) =>
            total + Number(pedido.total || 0), 0
        );

    elementos.vendasHoje.textContent =
        formatarMoeda(vendasHoje);

    elementos.pedidosNovos.textContent =
        pedidos.filter(p => normalizarStatus(p.status) === "novo").length;

    elementos.pedidosPendentes.textContent =
        pedidos.filter(p => normalizarStatus(p.status) === "aguardando").length;

    elementos.pedidosConcluidos.textContent =
        pedidos.filter(p => normalizarStatus(p.status) === "concluido").length;
}

function renderizarPedidos(){
    const pedidos = obterPedidosFiltrados();

    elementos.lista.innerHTML = "";

    elementos.vazio.style.display =
        pedidos.length ? "none" : "block";

    pedidos.forEach(pedido => {
        const nome =
            pedido.cliente?.nome ||
            pedido.cliente_nome ||
            "Cliente";

        const telefone =
            pedido.cliente?.telefone ||
            pedido.telefone ||
            "";

        const status = normalizarStatus(pedido.status);

        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>
                <strong>${pedido.codigo || `ROYAL-${pedido.id}`}</strong>
            </td>

            <td>${nome}</td>

            <td>${formatarData(pedido.criado_em)}</td>

            <td>
                <strong>${formatarMoeda(pedido.total)}</strong>
            </td>

            <td>
                <span class="status status-${status}">
                    ${pedido.status || "Novo"}
                </span>
            </td>

            <td>
                <div class="acoes-pedido">
                    <button
                        type="button"
                        data-ver="${pedido.id}"
                    >
                        Ver
                    </button>

                    <a
                        href="https://wa.me/55${telefone.replace(/\D/g,"")}"
                        target="_blank"
                    >
                        WhatsApp
                    </a>
                </div>
            </td>
        `;

        elementos.lista.appendChild(linha);
    });

    document
        .querySelectorAll("[data-ver]")
        .forEach(botao => {
            botao.addEventListener("click", () => {
                abrirPedido(botao.dataset.ver);
            });
        });

    calcularResumo();
}

function abrirPedido(id){
    const pedido = pegarPedidos().find(
        item => String(item.id) === String(id)
    );

    if(!pedido) return;

    elementos.modalCodigo.textContent =
        pedido.codigo || `ROYAL-${pedido.id}`;

    const itens = pedido.itens || pedido.produtos || [];

    elementos.modalDetalhes.innerHTML = `
        <div class="detalhe-bloco">
            <h3>Cliente</h3>
            <p>
                ${pedido.cliente?.nome || pedido.cliente_nome || "—"}
            </p>
            <p>
                ${pedido.cliente?.telefone || pedido.telefone || "—"}
            </p>
        </div>

        <div class="detalhe-bloco">
            <h3>Entrega</h3>
            <p>
                ${pedido.endereco || "Endereço não informado"}
            </p>
            <p>
                ${pedido.cidade || ""} ${pedido.uf || ""}
            </p>
        </div>

        <div class="detalhe-bloco">
            <h3>Produtos</h3>

            ${
                itens.length
                    ? itens.map(item => `
                        <p>
                            ${item.quantidade}x ${item.nome}
                            — ${item.preco}
                        </p>
                    `).join("")
                    : "<p>Nenhum produto registrado.</p>"
            }
        </div>

        <div class="detalhe-bloco">
            <h3>Total</h3>
            <p>
                <strong>${formatarMoeda(pedido.total)}</strong>
            </p>
        </div>

        <div class="detalhe-bloco">
            <h3>Status do pedido</h3>

            <select
                class="seletor-status"
                id="statusPedidoModal"
            >
                <option value="novo">Novo</option>
                <option value="aguardando">Aguardando pagamento</option>
                <option value="pago">Pago</option>
                <option value="enviado">Enviado</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
            </select>
        </div>
    `;

    const seletor =
        document.getElementById("statusPedidoModal");

    seletor.value = normalizarStatus(pedido.status);

    seletor.addEventListener("change", () => {
        alterarStatus(pedido.id, seletor.value);
    });

    elementos.modal.classList.add("ativo");
}

function alterarStatus(id, novoStatus){
    const pedidos = pegarPedidos();

    const pedido = pedidos.find(
        item => String(item.id) === String(id)
    );

    if(!pedido) return;

    pedido.status = novoStatus;

    salvarPedidos(pedidos);
    renderizarPedidos();
}

elementos.busca.addEventListener("input", renderizarPedidos);
elementos.filtroStatus.addEventListener("change", renderizarPedidos);
elementos.btnAtualizar.addEventListener("click", renderizarPedidos);

elementos.fecharModal.addEventListener("click", () => {
    elementos.modal.classList.remove("ativo");
});

elementos.modal.addEventListener("click", event => {
    if(event.target === elementos.modal){
        elementos.modal.classList.remove("ativo");
    }
});

renderizarPedidos();