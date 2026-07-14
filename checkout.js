(() => {
    "use strict";

    /* =====================================================
       CONFIGURAÇÕES
    ===================================================== */

    const CHAVE_CARRINHO_CHECKOUT = "carrinhoRoyal";
    const CHAVE_PEDIDOS_CHECKOUT = "pedidosRoyal";
    const WHATSAPP_ROYAL_CHECKOUT = "5562999736569";

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


    /* =====================================================
       ARMAZENAMENTO
    ===================================================== */

    function lerLocalStorage(chave) {
        try {
            const valor = JSON.parse(localStorage.getItem(chave));
            return Array.isArray(valor) ? valor : [];
        } catch (erro) {
            console.error(`Erro ao ler ${chave}:`, erro);
            return [];
        }
    }

    function pegarCarrinhoCheckout() {
        return lerLocalStorage(CHAVE_CARRINHO_CHECKOUT);
    }

    function salvarCarrinhoCheckout(carrinho) {
        localStorage.setItem(
            CHAVE_CARRINHO_CHECKOUT,
            JSON.stringify(carrinho)
        );

        if (typeof window.atualizarCarrinho === "function") {
            window.atualizarCarrinho();
        }
    }

    function pegarPedidosCheckout() {
        return lerLocalStorage(CHAVE_PEDIDOS_CHECKOUT);
    }

    function salvarPedidosCheckout(pedidos) {
        localStorage.setItem(
            CHAVE_PEDIDOS_CHECKOUT,
            JSON.stringify(pedidos)
        );
    }


    /* =====================================================
       PREÇO E FORMATAÇÃO
    ===================================================== */

    function converterPrecoCheckout(preco) {
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

    function formatarMoedaCheckout(valor) {
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


    /* =====================================================
       TOTAL
    ===================================================== */

    function calcularTotalCheckout(carrinho) {
        return carrinho.reduce((total, item) => {
            const quantidade = Number(item.quantidade) || 1;
            const preco = converterPrecoCheckout(item.preco);

            return total + preco * quantidade;
        }, 0);
    }


    /* =====================================================
       RENDERIZAÇÃO DO CHECKOUT
    ===================================================== */

    function renderizarCheckout() {
        if (!elementos.lista || !elementos.total) {
            console.error(
                "Os elementos listaCheckout ou totalCheckout não foram encontrados."
            );
            return;
        }

        const carrinho = pegarCarrinhoCheckout();

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
                const preco = converterPrecoCheckout(item.preco);
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
                                ${formatarMoedaCheckout(subtotal)}
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

        elementos.total.textContent = formatarMoedaCheckout(
            calcularTotalCheckout(carrinho)
        );
    }


    /* =====================================================
       CONTROLES DOS PRODUTOS
    ===================================================== */

    function aumentarProdutoCheckout(index) {
        const carrinho = pegarCarrinhoCheckout();

        if (!carrinho[index]) return;

        carrinho[index].quantidade =
            (Number(carrinho[index].quantidade) || 0) + 1;

        salvarCarrinhoCheckout(carrinho);
        renderizarCheckout();
    }

    function diminuirProdutoCheckout(index) {
        const carrinho = pegarCarrinhoCheckout();

        if (!carrinho[index]) return;

        const quantidade =
            Number(carrinho[index].quantidade) || 1;

        if (quantidade > 1) {
            carrinho[index].quantidade = quantidade - 1;
        } else {
            carrinho.splice(index, 1);
        }

        salvarCarrinhoCheckout(carrinho);
        renderizarCheckout();
    }

    function removerProdutoCheckout(index) {
        const carrinho = pegarCarrinhoCheckout();

        if (!carrinho[index]) return;

        carrinho.splice(index, 1);

        salvarCarrinhoCheckout(carrinho);
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
                aumentarProdutoCheckout(index);
            }

            if (acao === "diminuir") {
                diminuirProdutoCheckout(index);
            }

            if (acao === "remover") {
                removerProdutoCheckout(index);
            }
        });
    }


    /* =====================================================
       CEP
    ===================================================== */

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

        if (cep.length !== 8) {
            return;
        }

        elementos.cep.disabled = true;

        try {
            const resposta = await fetch(
                `https://viacep.com.br/ws/${cep}/json/`
            );

            if (!resposta.ok) {
                throw new Error("Não foi possível consultar o CEP.");
            }

            const dados = await resposta.json();

            if (dados.erro) {
                alert("CEP não encontrado.");
                return;
            }

            if (elementos.endereco) {
                elementos.endereco.value = dados.logradouro || "";
            }

            if (elementos.bairro) {
                elementos.bairro.value = dados.bairro || "";
            }

            if (elementos.cidade) {
                elementos.cidade.value = dados.localidade || "";
            }

            if (elementos.uf) {
                elementos.uf.value = dados.uf || "";
            }

            elementos.numero?.focus();
        } catch (erro) {
            console.error("Erro ao buscar CEP:", erro);
            alert(
                "Não foi possível buscar o CEP. Preencha o endereço manualmente."
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


    /* =====================================================
       DADOS DO CLIENTE
    ===================================================== */

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
            alert("Informe um número de WhatsApp válido.");
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


    /* =====================================================
       PEDIDO
    ===================================================== */

    function gerarCodigoPedido(pedidos) {
        const numero = pedidos.length + 1;

        return `ROYAL-${String(numero).padStart(4, "0")}`;
    }

    function criarPedido(dados, carrinho, total) {
        const pedidos = pegarPedidosCheckout();

        return {
            id: Date.now(),
            codigo: gerarCodigoPedido(pedidos),
            criado_em: new Date().toISOString(),
            status: "novo",

            cliente: {
                nome: dados.nome,
                telefone: dados.telefone
            },

            telefone: dados.telefone,

            cep: dados.cep,
            endereco: `${dados.endereco}, Nº ${dados.numero} - ${dados.bairro}`,
            numero: dados.numero,
            bairro: dados.bairro,
            cidade: dados.cidade,
            uf: dados.uf,
            complemento: dados.complemento,

            pagamento: dados.pagamento,
            observacao: dados.observacao,

            itens: carrinho.map((item) => {
                const quantidade =
                    Number(item.quantidade) || 1;

                const precoNumero =
                    converterPrecoCheckout(item.preco);

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
            "Não foi possível salvar o pedido no servidor."
        );
    }

    return resultado;

        const pedidos = pegarPedidosCheckout();

        pedidos.unshift(pedido);

        salvarPedidosCheckout(pedidos);
    }


    /* =====================================================
       MENSAGEM DO WHATSAPP
    ===================================================== */

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
            mensagem += `Subtotal: ${formatarMoedaCheckout(item.subtotal)}\n`;
        });

        mensagem += `\n💳 *Pagamento:* ${pedido.pagamento}\n`;
        mensagem += `💰 *Total:* ${formatarMoedaCheckout(pedido.total)}\n`;

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
            `https://wa.me/${WHATSAPP_ROYAL_CHECKOUT}` +
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


    /* =====================================================
       FINALIZAÇÃO
    ===================================================== */

    function limparCarrinhoDepoisDoPedido() {
        localStorage.removeItem(CHAVE_CARRINHO_CHECKOUT);

        if (typeof window.atualizarCarrinho === "function") {
            window.atualizarCarrinho();
        }

        renderizarCheckout();
    }

    async function finalizarPedido() {
        const carrinho = pegarCarrinhoCheckout();

        if (carrinho.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        const dados = pegarDadosCliente();

        if (!validarDadosCliente(dados)) {
            return;
        }

        const total = calcularTotalCheckout(carrinho);
        const pedido = criarPedido(dados, carrinho, total);

        elementos.btnFinalizar.disabled = true;
        elementos.btnFinalizar.textContent =
            "PROCESSANDO PEDIDO...";

        try {
            await registrarPedido(pedido);
            abrirWhatsApp(pedido); 
            limparCarrinhoDepoisDoPedido();

            alert(
                `Pedido ${pedido.codigo} registrado com sucesso!`
            );
        } catch (erro) {
            console.error("Erro ao finalizar pedido:", erro);

            alert(
                "Não foi possível finalizar o pedido. Tente novamente."
            );
        } finally {
            elementos.btnFinalizar.disabled = false;
            elementos.btnFinalizar.textContent =
                "FINALIZAR PELO WHATSAPP";
        }
    }


    /* =====================================================
       INICIALIZAÇÃO
    ===================================================== */

    function iniciarCheckout() {
        if (!elementos.btnFinalizar) {
            console.error(
                "Botão btnFinalizar ou btnEnviarPedido não encontrado."
            );
        }

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