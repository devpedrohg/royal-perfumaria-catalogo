export async function onRequestGet({ env }) {
    try {
        const { results } = await env.DB
            .prepare("SELECT * FROM pedidos ORDER BY id DESC")
            .all();

        return Response.json(results || []);
    } catch (erro) {
        return Response.json(
            {
                sucesso: false,
                erro: erro.message
            },
            {
                status: 500
            }
        );
    }
}

export async function onRequestPost({ request, env }) {
    try {
        const pedido = await request.json();

        if (
            !pedido?.codigo ||
            !pedido?.cliente?.nome ||
            !pedido?.cliente?.telefone ||
            !pedido?.endereco ||
            !Array.isArray(pedido?.itens) ||
            pedido.itens.length === 0
        ) {
            return Response.json(
                {
                    sucesso: false,
                    erro: "Dados do pedido incompletos."
                },
                {
                    status: 400
                }
            );
        }

        await env.DB.prepare(`
            INSERT INTO pedidos
            (
                codigo,
                cliente_nome,
                telefone,
                cep,
                endereco,
                cidade,
                uf,
                complemento,
                pagamento,
                observacao,
                produtos,
                total,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
            pedido.codigo,
            pedido.cliente.nome,
            pedido.cliente.telefone,
            pedido.cep || "",
            pedido.endereco,
            pedido.cidade || "",
            pedido.uf || "",
            pedido.complemento || "",
            pedido.pagamento || "",
            pedido.observacao || "",
            JSON.stringify(pedido.itens),
            Number(pedido.total) || 0,
            "novo"
        )
        .run();

        return Response.json(
            {
                sucesso: true,
                codigo: pedido.codigo
            },
            {
                status: 201
            }
        );
    } catch (erro) {
        console.error("Erro ao registrar pedido:", erro);

        return Response.json(
            {
                sucesso: false,
                erro: erro.message || "Erro ao salvar o pedido."
            },
            {
                status: 500
            }
        );
    }
}