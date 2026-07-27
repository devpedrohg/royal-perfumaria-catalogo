export async function onRequestGet({ env }) {
    const { results } = await env.DB
        .prepare("SELECT * FROM pedidos ORDER BY id DESC")
        .all();

    return Response.json(results);
}

export async function onRequestPost({ request, env }) {
    const pedido = await request.json();

    await env.DB.prepare(`
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
    pedido.total,
    "Novo"
)
    .run();

    return Response.json({
        sucesso: true
    });
}