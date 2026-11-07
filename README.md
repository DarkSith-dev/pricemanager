<img width="1230" height="724" alt="image" src="https://github.com/user-attachments/assets/ec8914a3-091c-4456-b8f4-c2d8a892d13b" />
# 3D Price Manager — precificador de impressão 3D (página única)
HTML, CSS e JavaScript puro. Os dados ficam no LocalStorage do navegador.

## Uso rápido
1. Em **Configurações gerais**, informe o kWh e os custos fixos/variáveis; cadastre impressora, material e embalagens.
2. Em **Taxas das plataformas**, preencha as taxas reais (começam zeradas e não são oficiais).
3. Preencha o **Produto**, escolha onde vender e a margem. O preço aparece na hora.

Fórmula: `preço = (custos + taxas fixas) / (1 − taxas % − margem %)`. Cálculo em `js/calc.js`.

## Hospedagem
1. Baixe/clone o projeto e abra `index.html` para testar.
2. Crie um repositório no GitHub e envie os arquivos: `git init && git add . && git commit -m "3D Price Manager" && git branch -M main && git remote add origin URL && git push -u origin main`.
3. Settings > Pages > Deploy from a branch > `main` / root > Save.

## Backup
Botão **Exportar backup** (JSON) e **Importar backup** no topo. Faça backups periódicos.
