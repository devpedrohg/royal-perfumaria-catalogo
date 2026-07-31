export async function onRequestGet({ env }) {
    try {
        const { results } = await env.DB
            .prepare("SELECT * FROM pedidos ORDER BY id DESC")
            .all();

        return Response.json(results || []);
    } catch (erro) {
        console.error("Erro ao buscar pedidos:", erro);

        return Response.json(
            {
                sucesso: false,
                erro: erro.message || "Erro ao buscar os pedidos."
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

        await env.DB
            .prepare(`
                INSERT INTO pedidos
                (
                    cliente,
                    telefone,
                    endereco,
                    produtos,
                    total,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `)
            .bind(
                pedido.cliente.nome,
                pedido.cliente.telefone,
                pedido.endereco,
                JSON.stringify(pedido.itens),
                Number(pedido.total) || 0,
                "Novo"
            )
            .run();

        return Response.json(
            {
                sucesso: true,
                codigo: pedido.codigo || null
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