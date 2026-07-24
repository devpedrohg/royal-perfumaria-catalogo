from io import BytesIO
from pathlib import Path
from PIL import Image
from rembg import remove

from pathlib import Path

PASTA_ENTRADA = Path("imagens")
PASTA_SAIDA = Path("imagens-recortadas")

print("SCRIPT INICIADO")
print("Pasta atual:", PASTA_ENTRADA)

PASTA_ENTRADA = Path("imagens")
PASTA_SAIDA = Path("imagens-recortadas")

TAMANHO_TELA = 900
MARGEM = 50
EXTENSOES = {".png", ".jpg", ".jpeg", ".webp", ".avif"}

PASTA_SAIDA.mkdir(parents=True, exist_ok=True)

if not PASTA_ENTRADA.exists():
    raise FileNotFoundError(
        f'A pasta "{PASTA_ENTRADA}" não foi encontrada.'
    )

arquivos = [
    arquivo
    for arquivo in PASTA_ENTRADA.iterdir()
    if arquivo.is_file() and arquivo.suffix.lower() in EXTENSOES
]

print(f"{len(arquivos)} imagens encontradas.\n")

print(f"{len(arquivos)} imagens encontradas")

for indice, arquivo in enumerate(arquivos, start=1):
    try:
        print(f"[{indice}/{len(arquivos)}] Processando: {arquivo.name}")

        dados_originais = arquivo.read_bytes()
        dados_sem_fundo = remove(dados_originais)

        imagem = Image.open(BytesIO(dados_sem_fundo)).convert("RGBA")

        alpha = imagem.getchannel("A")
        bbox = alpha.getbbox()

        if not bbox:
            print(f"AVISO: nenhuma área visível encontrada em {arquivo.name}")
            continue

        imagem = imagem.crop(bbox)

        area_util = TAMANHO_TELA - (MARGEM * 2)

        escala = min(
            area_util / imagem.width,
            area_util / imagem.height
        )

        nova_largura = max(1, int(imagem.width * escala))
        nova_altura = max(1, int(imagem.height * escala))

        imagem = imagem.resize(
            (nova_largura, nova_altura),
            Image.Resampling.LANCZOS
        )

        tela = Image.new(
            "RGBA",
            (TAMANHO_TELA, TAMANHO_TELA),
            (0, 0, 0, 0)
        )

        x = (TAMANHO_TELA - nova_largura) // 2

        # Mantém o produto próximo da base, sem encostar.
        y = TAMANHO_TELA - nova_altura - MARGEM

        tela.alpha_composite(imagem, (x, y))

        nome_saida = arquivo.stem.lower() + ".png"
        caminho_saida = PASTA_SAIDA / nome_saida

        tela.save(
            caminho_saida,
            format="PNG",
            optimize=True
        )

        print(f"OK: {nome_saida}\n")

    except Exception as erro:
        print(f"ERRO em {arquivo.name}: {erro}\n")

print("Processamento concluído.")

