export async function onRequestGet() {
    return new Response(
        JSON.stringify({
            status: "ok",
            mensagem: "API funcionando!"
        }),
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
}