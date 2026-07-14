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
        pedido.cliente,
        pedido.telefone,
        pedido.endereco,
        JSON.stringify(pedido.produtos),
        pedido.total,
        "Novo"
    )
    .run();

    return Response.json({
        sucesso: true
    });
}