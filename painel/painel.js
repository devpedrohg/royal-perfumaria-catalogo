(() => {
    "use strict";

    let pedidos = [];

    const elementos = {
        lista: document.getElementById("listaPedidos"),
        vazio: document.getElementById("pedidosVazios"),
        busca: document.getElementById("buscaPedido"),
        filtroStatus: document.getElementById("filtroStatus"),
        btnAtualizar: document.getElementById("btnAtualizar"),

        vendasHoje: document.getElementById("vendasHoje"),
        pedidosNovos: document.getElementById("pedidosNovos"),
        pedidosPendentes: document.getElementById("pedidosPendentes"),
        pedidosConcluidos: document.getElementById(
            "pedidosConcluidos"
        ),

        modal: document.getElementById("modalPedido"),
        fecharModal: document.getElementById("fecharModal"),
        modalCodigo: document.getElementById("modalCodigo"),
        modalDetalhes: document.getElementById("modalDetalhes")
    };

    function formatarMoeda(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function formatarData(data) {
        if (!data) return "—";

        const dataConvertida = new Date(data);

        if (Number.isNaN(dataConvertida.getTime())) {
            return data;
        }

        return dataConvertida.toLocaleString("pt-BR");
    }

    function normalizarStatus(status) {
        return String(status || "novo")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "-");
    }

    function converterProdutos(produtos) {
        if (Array.isArray(produtos)) {
            return produtos;
        }

        if (typeof produtos === "string") {
            try {
                const convertido = JSON.parse(produtos);

                return Array.isArray(convertido)
                    ? convertido
                    : [];
            } catch (erro) {
                console.error(
                    "Erro ao converter produtos:",
                    erro
                );

                return [];
            }
        }

        return [];
    }

    async function carregarPedidos() {
        if (elementos.btnAtualizar) {
            elementos.btnAtualizar.disabled = true;
            elementos.btnAtualizar.textContent =
                "Atualizando...";
        }

        try {
            const resposta = await fetch(
                "/api/pedidos",
                {
                    cache: "no-store"
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.erro ||
                    "Erro ao carregar pedidos."
                );
            }

            pedidos = Array.isArray(resultado)
                ? resultado
                : [];

            renderizarPedidos();
        } catch (erro) {
            console.error(
                "Erro ao carregar pedidos:",
                erro
            );

            pedidos = [];

            if (elementos.lista) {
                elementos.lista.innerHTML = `
                    <tr>
                        <td colspan="6">
                            Não foi possível carregar os pedidos.
                        </td>
                    </tr>
                `;
            }

            if (elementos.vazio) {
                elementos.vazio.style.display = "none";
            }

            calcularResumo();
        } finally {
            if (elementos.btnAtualizar) {
                elementos.btnAtualizar.disabled = false;
                elementos.btnAtualizar.textContent =
                    "Atualizar pedidos";
            }
        }
    }

    function obterPedidosFiltrados() {
        const termo =
            elementos.busca?.value
                .toLowerCase()
                .trim() || "";

        const statusSelecionado =
            elementos.filtroStatus?.value || "todos";

        return pedidos.filter((pedido) => {
            const codigo = String(
                pedido.codigo || ""
            ).toLowerCase();

            const cliente = String(
                pedido.cliente_nome ||
                pedido.cliente?.nome ||
                ""
            ).toLowerCase();

            const telefone = String(
                pedido.telefone ||
                pedido.cliente?.telefone ||
                ""
            ).toLowerCase();

            const correspondeBusca =
                codigo.includes(termo) ||
                cliente.includes(termo) ||
                telefone.includes(termo);

            const correspondeStatus =
                statusSelecionado === "todos" ||
                normalizarStatus(pedido.status) ===
                    statusSelecionado;

            return correspondeBusca && correspondeStatus;
        });
    }

    function calcularResumo() {
        const hoje = new Date()
            .toISOString()
            .slice(0, 10);

        const vendasHoje = pedidos
            .filter((pedido) => {
                const dataPedido = String(
                    pedido.criado_em || ""
                ).slice(0, 10);

                return (
                    dataPedido === hoje &&
                    normalizarStatus(pedido.status) !==
                        "cancelado"
                );
            })
            .reduce(
                (total, pedido) =>
                    total + Number(pedido.total || 0),
                0
            );

        if (elementos.vendasHoje) {
            elementos.vendasHoje.textContent =
                formatarMoeda(vendasHoje);
        }

        if (elementos.pedidosNovos) {
            elementos.pedidosNovos.textContent =
                pedidos.filter(
                    (pedido) =>
                        normalizarStatus(pedido.status) ===
                        "novo"
                ).length;
        }

        if (elementos.pedidosPendentes) {
            elementos.pedidosPendentes.textContent =
                pedidos.filter(
                    (pedido) =>
                        normalizarStatus(pedido.status) ===
                        "aguardando"
                ).length;
        }

        if (elementos.pedidosConcluidos) {
            elementos.pedidosConcluidos.textContent =
                pedidos.filter(
                    (pedido) =>
                        normalizarStatus(pedido.status) ===
                        "concluido"
                ).length;
        }
    }

    function renderizarPedidos() {
        if (!elementos.lista) return;

        const pedidosFiltrados =
            obterPedidosFiltrados();

        elementos.lista.innerHTML = "";

        if (elementos.vazio) {
            elementos.vazio.style.display =
                pedidosFiltrados.length
                    ? "none"
                    : "block";
        }

        pedidosFiltrados.forEach((pedido) => {
            const nome =
                pedido.cliente_nome ||
                pedido.cliente?.nome ||
                "Cliente";

            const telefone =
                pedido.telefone ||
                pedido.cliente?.telefone ||
                "";

            const telefoneNumeros =
                telefone.replace(/\D/g, "");

            const telefoneWhatsApp =
                telefoneNumeros.startsWith("55")
                    ? telefoneNumeros
                    : `55${telefoneNumeros}`;

            const status =
                normalizarStatus(pedido.status);

            const linha =
                document.createElement("tr");

            linha.innerHTML = `
                <td>
                    <strong>
                        ${
                            pedido.codigo ||
                            `ROYAL-${pedido.id}`
                        }
                    </strong>
                </td>

                <td>${nome}</td>

                <td>
                    ${formatarData(pedido.criado_em)}
                </td>

                <td>
                    <strong>
                        ${formatarMoeda(pedido.total)}
                    </strong>
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
                            href="https://wa.me/${telefoneWhatsApp}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            WhatsApp
                        </a>
                    </div>
                </td>
            `;

            elementos.lista.appendChild(linha);
        });

        elementos.lista
            .querySelectorAll("[data-ver]")
            .forEach((botao) => {
                botao.addEventListener(
                    "click",
                    () => {
                        abrirPedido(
                            botao.dataset.ver
                        );
                    }
                );
            });

        calcularResumo();
    }

    function abrirPedido(id) {
        const pedido = pedidos.find(
            (item) =>
                String(item.id) === String(id)
        );

        if (!pedido) return;

        if (elementos.modalCodigo) {
            elementos.modalCodigo.textContent =
                pedido.codigo ||
                `ROYAL-${pedido.id}`;
        }

        const itens = converterProdutos(
            pedido.itens || pedido.produtos
        );

        if (elementos.modalDetalhes) {
            elementos.modalDetalhes.innerHTML = `
                <div class="detalhe-bloco">
                    <h3>Cliente</h3>

                    <p>
                        ${
                            pedido.cliente_nome ||
                            pedido.cliente?.nome ||
                            "—"
                        }
                    </p>

                    <p>
                        ${
                            pedido.telefone ||
                            pedido.cliente?.telefone ||
                            "—"
                        }
                    </p>
                </div>

                <div class="detalhe-bloco">
                    <h3>Entrega</h3>

                    <p>
                        ${
                            pedido.endereco ||
                            "Endereço não informado"
                        }
                    </p>

                    <p>
                        ${pedido.cidade || ""}
                        ${pedido.uf || ""}
                    </p>

                    <p>
                        CEP: ${pedido.cep || "—"}
                    </p>

                    ${
                        pedido.complemento
                            ? `
                                <p>
                                    Complemento:
                                    ${pedido.complemento}
                                </p>
                            `
                            : ""
                    }
                </div>

                <div class="detalhe-bloco">
                    <h3>Produtos</h3>

                    ${
                        itens.length
                            ? itens
                                  .map(
                                      (item) => `
                                        <p>
                                            ${
                                                Number(
                                                    item.quantidade
                                                ) || 1
                                            }x
                                            ${item.nome || "Produto"}
                                            —
                                            ${
                                                item.preco ||
                                                formatarMoeda(
                                                    item.preco_numero
                                                )
                                            }
                                        </p>
                                    `
                                  )
                                  .join("")
                            : `
                                <p>
                                    Nenhum produto registrado.
                                </p>
                            `
                    }
                </div>

                <div class="detalhe-bloco">
                    <h3>Pagamento</h3>
                    <p>${pedido.pagamento || "—"}</p>
                </div>

                ${
                    pedido.observacao
                        ? `
                            <div class="detalhe-bloco">
                                <h3>Observação</h3>
                                <p>${pedido.observacao}</p>
                            </div>
                        `
                        : ""
                }

                <div class="detalhe-bloco">
                    <h3>Total</h3>

                    <p>
                        <strong>
                            ${formatarMoeda(pedido.total)}
                        </strong>
                    </p>
                </div>

                <div class="detalhe-bloco">
                    <h3>Status do pedido</h3>

                    <select
                        class="seletor-status"
                        id="statusPedidoModal"
                    >
                        <option value="novo">
                            Novo
                        </option>

                        <option value="aguardando">
                            Aguardando pagamento
                        </option>

                        <option value="pago">
                            Pago
                        </option>

                        <option value="enviado">
                            Enviado
                        </option>

                        <option value="concluido">
                            Concluído
                        </option>

                        <option value="cancelado">
                            Cancelado
                        </option>
                    </select>
                </div>
            `;
        }

        const seletor = document.getElementById(
            "statusPedidoModal"
        );

        if (seletor) {
            seletor.value =
                normalizarStatus(pedido.status);
            
            seletor.addEventListener("change", () => {
            alterarStatus(
            pedido.id,
            seletor.value
    );
});
    try {
        const resposta = await fetch(
            `/api/pedidos/${id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: novoStatus
                })
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                resultado.erro ||
                "Não foi possível atualizar o status."
            );
        }

        await carregarPedidos();
        elementos.modal?.classList.remove("ativo");
    } catch (erro) {
        console.error("Erro ao atualizar status:", erro);

        alert(
            erro.message ||
            "Não foi possível atualizar o status."
        );
    }
}
                }

        elementos.modal?.classList.add("ativo");

    function alterarStatusLocal(id, novoStatus) {
        const pedido = pedidos.find(
            (item) =>
                String(item.id) === String(id)
        );

        if (!pedido) return;

        pedido.status = novoStatus;

        renderizarPedidos();
    }

    elementos.busca?.addEventListener(
        "input",
        renderizarPedidos
    );

    elementos.filtroStatus?.addEventListener(
        "change",
        renderizarPedidos
    );

    elementos.btnAtualizar?.addEventListener(
        "click",
        carregarPedidos
    );

    elementos.fecharModal?.addEventListener(
        "click",
        () => {
            elementos.modal?.classList.remove("ativo");
        }
    );

    elementos.modal?.addEventListener(
        "click",
        (evento) => {
            if (evento.target === elementos.modal) {
                elementos.modal.classList.remove(
                    "ativo"
                );
            }
        }
    );

    document.addEventListener(
        "keydown",
        (evento) => {
            if (evento.key === "Escape") {
                elementos.modal?.classList.remove(
                    "ativo"
                );
            }
        }
    );

    carregarPedidos();