from PIL import Image, ImageChops
import os

ENTRADA = "imagens"
SAIDA = "imagens-recortadas"

os.makedirs(SAIDA, exist_ok=True)

for arquivo in os.listdir(ENTRADA):

    if not arquivo.lower().endswith((".png", ".jpg", ".jpeg", ".webp", ".avif")):
        continue

    try:
        print("Processando:", arquivo)

        caminho = os.path.join(ENTRADA, arquivo)
        img = Image.open(caminho).convert("RGBA")

        alpha = img.getchannel("A")
        bbox = alpha.getbbox()

        if bbox:
            img = img.crop(bbox)

        tela = Image.new("RGBA", (900, 900), (0, 0, 0, 0))

        escala = min(
            900 * 0.98 / img.width,
            900 * 0.98 / img.height
        )

        nova_largura = int(img.width * escala)
        nova_altura = int(img.height * escala)

        img = img.resize((nova_largura, nova_altura), Image.LANCZOS)

        x = (900 - nova_largura) // 2
        y = 900 - nova_altura

        tela.paste(img, (x, y), img)

        nome_saida = os.path.splitext(arquivo)[0].lower() + ".png"
        tela.save(os.path.join(SAIDA, nome_saida))

        print("OK:", nome_saida)

    except Exception as e:
        print("ERRO:", arquivo)
        print(e)

print("Pronto! Imagens recortadas e ampliadas.")