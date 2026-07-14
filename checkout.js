(() => {
    "use strict";

    const CHAVE_CARRINHO = "carrinhoRoyal";
    const WHATSAPP_ROYAL = "5562999736569";

    const elementos = {
        lista: document.getElementById("listaCheckout"),
        total: document.getElementById("totalCheckout"),

        btnFinalizar:
            document.getElementById("btnFinalizar") ||
            document.getElementById("btnEnviarPedido"),

        nome: document.getElementById("nome"),
        telefone: document.getElementById("telefone"),
        cep: document.getElementById("cep"),
        endereco: document.getElementById("endereco"),
        numero: document.getElementById("numero"),
        bairro: document.getElementById("bairro"),
        cidade: document.getElementById("cidade"),
        uf: document.getElementById("uf"),
        complemento: document.getElementById("complemento"),
        pagamento: document.getElementById("pagamento"),
        observacao: document.getElementById("observacao")
    };

    function pegarCarrinho() {
        try {
            const carrinho = JSON.parse(
                localStorage.getItem(CHAVE_CARRINHO)
            );

            return Array.isArray(carrinho) ? carrinho : [];
        } catch (erro) {
            console.error("Erro ao carregar o carrinho:", erro);
            return [];
        }
    }

    function salvarCarrinho(carrinho) {
        localStorage.setItem(
            CHAVE_CARRINHO,
            JSON.stringify(carrinho)
        );

        if (typeof window.atualizarCarrinho === "function") {
            window.atualizarCarrinho();
        }
    }

    function converterPreco(preco) {
        if (typeof preco === "number") {
            return preco;
        }

        return Number(
            String(preco || "0")
                .replace("R$", "")
                .replace(/\./g, "")
                .replace(",", ".")
                .trim()
        ) || 0;
    }

    function formatarMoeda(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function escaparHtml(texto) {
        return String(texto || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function calcularTotal(carrinho) {
        return carrinho.reduce((total, item) => {
            const quantidade = Number(item.quantidade) || 1;
            const preco = converterPreco(item.preco);

            return total + preco * quantidade;
        }, 0);
    }

    function renderizarCheckout() {
        if (!elementos.lista || !elementos.total) {
            console.error(
                "listaCheckout ou totalCheckout não encontrado."
            );
            return;
        }

        const carrinho = pegarCarrinho();

        if (carrinho.length === 0) {
            elementos.lista.innerHTML = `
                <div class="checkout-vazio">
                    <strong>Seu carrinho está vazio.</strong>
                    <p>Adicione produtos antes de finalizar o pedido.</p>

                    <a href="catalogo.html">
                        Voltar ao catálogo
                    </a>
                </div>
            `;

            elementos.total.textContent = "R$ 0,00";

            if (elementos.btnFinalizar) {
                elementos.btnFinalizar.disabled = true;
            }

            return;
        }

        if (elementos.btnFinalizar) {
            elementos.btnFinalizar.disabled = false;
        }

        elementos.lista.innerHTML = carrinho
            .map((item, index) => {
                const quantidade = Number(item.quantidade) || 1;
                const preco = converterPreco(item.preco);
                const subtotal = preco * quantidade;

                return `
                    <article class="item-checkout">
                        <div class="imagem-item-checkout">
                            ${
                                item.imagem
                                    ? `
                                        <img
                                            src="${escaparHtml(item.imagem)}"
                                            alt="${escaparHtml(item.nome)}"
                                        >
                                    `
                                    : ""
                            }
                        </div>

                        <div class="info-item">
                            <strong>
                                ${escaparHtml(item.nome)}
                            </strong>

                            <span>
                                ${escaparHtml(item.preco)}
                            </span>

                            <small>
                                Subtotal:
                                ${formatarMoeda(subtotal)}
                            </small>

                            <div class="controle">
                                <button
                                    type="button"
                                    data-acao="diminuir"
                                    data-index="${index}"
                                    aria-label="Diminuir quantidade"
                                >
                                    −
                                </button>

                                <span>${quantidade}</span>

                                <button
                                    type="button"
                                    data-acao="aumentar"
                                    data-index="${index}"
                                    aria-label="Aumentar quantidade"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <button
                            class="remover"
                            type="button"
                            data-acao="remover"
                            data-index="${index}"
                            aria-label="Remover produto"
                        >
                            ✕
                        </button>
                    </article>
                `;
            })
            .join("");

        elementos.total.textContent = formatarMoeda(
            calcularTotal(carrinho)
        );
    }

    function aumentarProduto(index) {
        const carrinho = pegarCarrinho();

        if (!carrinho[index]) return;

        carrinho[index].quantidade =
            (Number(carrinho[index].quantidade) || 0) + 1;

        salvarCarrinho(carrinho);
        renderizarCheckout();
    }

    function diminuirProduto(index) {
        const carrinho = pegarCarrinho();

        if (!carrinho[index]) return;

        const quantidade =
            Number(carrinho[index].quantidade) || 1;

        if (quantidade > 1) {
            carrinho[index].quantidade = quantidade - 1;
        } else {
            carrinho.splice(index, 1);
        }

        salvarCarrinho(carrinho);
        renderizarCheckout();
    }

    function removerProduto(index) {
        const carrinho = pegarCarrinho();

        if (!carrinho[index]) return;

        carrinho.splice(index, 1);

        salvarCarrinho(carrinho);
        renderizarCheckout();
    }

    function configurarEventosDosProdutos() {
        elementos.lista?.addEventListener("click", (evento) => {
            const botao = evento.target.closest("[data-acao]");

            if (!botao) return;

            const index = Number(botao.dataset.index);
            const acao = botao.dataset.acao;

            if (!Number.isInteger(index)) return;

            if (acao === "aumentar") {
                aumentarProduto(index);
            }

            if (acao === "diminuir") {
                diminuirProduto(index);
            }

            if (acao === "remover") {
                removerProduto(index);
            }
        });
    }

    function formatarCep(valor) {
        const numeros = String(valor || "")
            .replace(/\D/g, "")
            .slice(0, 8);

        if (numeros.length > 5) {
            return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
        }

        return numeros;
    }

    async function buscarCep() {
        if (!elementos.cep) return;

        const cep = elementos.cep.value.replace(/\D/g, "");

        if (cep.length !== 8) return;

        elementos.cep.disabled = true;

        try {
            const resposta = await fetch(
                `https://viacep.com.br/ws/${cep}/json/`
            );

            if (!resposta.ok) {
                throw new Error("Erro ao consultar o CEP.");
            }

            const dados = await resposta.json();

            if (dados.erro) {
                alert("CEP não encontrado.");
                return;
            }

            elementos.endereco.value = dados.logradouro || "";
            elementos.bairro.value = dados.bairro || "";
            elementos.cidade.value = dados.localidade || "";
            elementos.uf.value = dados.uf || "";

            elementos.numero?.focus();
        } catch (erro) {
            console.error("Erro ao buscar CEP:", erro);

            alert(
                "Não foi possível buscar o CEP. Preencha manualmente."
            );
        } finally {
            elementos.cep.disabled = false;
        }
    }

    function configurarCep() {
        elementos.cep?.addEventListener("input", () => {
            elementos.cep.value = formatarCep(
                elementos.cep.value
            );
        });

        elementos.cep?.addEventListener("blur", buscarCep);
    }

    function pegarValor(elemento) {
        return elemento?.value.trim() || "";
    }

    function pegarDadosCliente() {
        return {
            nome: pegarValor(elementos.nome),
            telefone: pegarValor(elementos.telefone),
            cep: pegarValor(elementos.cep),
            endereco: pegarValor(elementos.endereco),
            numero: pegarValor(elementos.numero),
            bairro: pegarValor(elementos.bairro),
            cidade: pegarValor(elementos.cidade),
            uf: pegarValor(elementos.uf).toUpperCase(),
            complemento: pegarValor(elementos.complemento),
            pagamento: elementos.pagamento?.value || "",
            observacao: pegarValor(elementos.observacao)
        };
    }

    function validarDadosCliente(dados) {
        const obrigatorios = [
            ["nome", "Nome completo"],
            ["telefone", "WhatsApp"],
            ["cep", "CEP"],
            ["endereco", "Endereço"],
            ["numero", "Número"],
            ["bairro", "Bairro"],
            ["cidade", "Cidade"],
            ["uf", "UF"],
            ["pagamento", "Forma de pagamento"]
        ];

        const campoInvalido = obrigatorios.find(
            ([chave]) => !dados[chave]
        );

        if (campoInvalido) {
            alert(
                `Preencha o campo obrigatório: ${campoInvalido[1]}.`
            );

            elementos[campoInvalido[0]]?.focus();

            return false;
        }

        if (dados.telefone.replace(/\D/g, "").length < 10) {
            alert("Informe um WhatsApp válido.");
            elementos.telefone?.focus();
            return false;
        }

        if (dados.cep.replace(/\D/g, "").length !== 8) {
            alert("Informe um CEP válido.");
            elementos.cep?.focus();
            return false;
        }

        return true;
    }

    function gerarCodigoPedido() {
        return `ROYAL-${Date.now().toString().slice(-8)}`;
    }

    function criarPedido(dados, carrinho, total) {
        return {
            codigo: gerarCodigoPedido(),
            criado_em: new Date().toISOString(),
            status: "novo",

            cliente: {
                nome: dados.nome,
                telefone: dados.telefone
            },

            cep: dados.cep,
            endereco: `${dados.endereco}, Nº ${dados.numero} - ${dados.bairro}`,
            cidade: dados.cidade,
            uf: dados.uf,
            complemento: dados.complemento,

            pagamento: dados.pagamento,
            observacao: dados.observacao,

            itens: carrinho.map((item) => {
                const quantidade =
                    Number(item.quantidade) || 1;

                const precoNumero =
                    converterPreco(item.preco);

                return {
                    nome: item.nome,
                    preco: item.preco,
                    preco_numero: precoNumero,
                    quantidade,
                    subtotal: precoNumero * quantidade,
                    imagem: item.imagem || ""
                };
            }),

            total
        };
    }

    async function registrarPedido(pedido) {
        const resposta = await fetch("/api/pedidos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(pedido)
        });

        let resultado = {};

        try {
            resultado = await resposta.json();
        } catch {
            resultado = {};
        }

        if (!resposta.ok) {
            throw new Error(
                resultado.erro ||
                "Não foi possível registrar o pedido."
            );
        }

        return resultado;
    }

    function gerarMensagemWhatsApp(pedido) {
        let mensagem = "";

        mensagem += `🛍️ *NOVO PEDIDO - ROYAL PERFUMARIA*\n`;
        mensagem += `🔖 *Pedido:* ${pedido.codigo}\n\n`;

        mensagem += `👤 *DADOS DO CLIENTE*\n`;
        mensagem += `Nome: ${pedido.cliente.nome}\n`;
        mensagem += `WhatsApp: ${pedido.cliente.telefone}\n\n`;

        mensagem += `📍 *ENDEREÇO DE ENTREGA*\n`;
        mensagem += `${pedido.endereco}\n`;
        mensagem += `${pedido.cidade}/${pedido.uf}\n`;
        mensagem += `CEP: ${pedido.cep}\n`;

        if (pedido.complemento) {
            mensagem += `Complemento: ${pedido.complemento}\n`;
        }

        mensagem += `\n🛒 *PRODUTOS*\n`;

        pedido.itens.forEach((item) => {
            mensagem += `\n• *${item.nome}*\n`;
            mensagem += `Quantidade: ${item.quantidade}\n`;
            mensagem += `Preço unitário: ${item.preco}\n`;
            mensagem += `Subtotal: ${formatarMoeda(item.subtotal)}\n`;
        });

        mensagem += `\n💳 *Pagamento:* ${pedido.pagamento}\n`;
        mensagem += `💰 *Total:* ${formatarMoeda(pedido.total)}\n`;

        if (pedido.observacao) {
            mensagem += `\n📝 *Observação:*\n`;
            mensagem += `${pedido.observacao}\n`;
        }

        mensagem += `\nOlá! Gostaria de confirmar este pedido.`;

        return mensagem;
    }

    function abrirWhatsApp(pedido) {
        const mensagem = gerarMensagemWhatsApp(pedido);

        const url =
            `https://wa.me/${WHATSAPP_ROYAL}` +
            `?text=${encodeURIComponent(mensagem)}`;

        const janela = window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );

        if (!janela) {
            window.location.href = url;
        }
    }

    function limparCarrinho() {
        localStorage.removeItem(CHAVE_CARRINHO);

        if (typeof window.atualizarCarrinho === "function") {
            window.atualizarCarrinho();
        }

        renderizarCheckout();
    }

    async function finalizarPedido() {
        const carrinho = pegarCarrinho();

        if (carrinho.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        const dados = pegarDadosCliente();

        if (!validarDadosCliente(dados)) {
            return;
        }

        const total = calcularTotal(carrinho);
        const pedido = criarPedido(dados, carrinho, total);

        elementos.btnFinalizar.disabled = true;
        elementos.btnFinalizar.textContent =
            "PROCESSANDO PEDIDO...";

        try {
            await registrarPedido(pedido);

            abrirWhatsApp(pedido);
            limparCarrinho();

            alert(
                `Pedido ${pedido.codigo} registrado com sucesso!`
            );
        } catch (erro) {
            console.error("Erro ao finalizar pedido:", erro);

            alert(
                erro.message ||
                "Não foi possível finalizar o pedido."
            );
        } finally {
            elementos.btnFinalizar.disabled = false;
            elementos.btnFinalizar.textContent =
                "FINALIZAR PELO WHATSAPP";
        }
    }

    function iniciarCheckout() {
        configurarEventosDosProdutos();
        configurarCep();

        elementos.btnFinalizar?.addEventListener(
            "click",
            finalizarPedido
        );

        renderizarCheckout();
    }

    iniciarCheckout();
})();