# Bola da Copa 2026

Aplicativo estatico de bolao para a Copa do Mundo 2026, pronto para publicar no GitHub Pages.

## Paginas

- `index.html`: tela dos participantes.
- `admin.html`: tela administrativa para atualizar placares.

Codigos do prototipo:

- Codigo do grupo: `COPA2026`
- Codigo admin: `ADMIN2026`

## Como publicar no GitHub Pages

1. Crie um repositorio no GitHub.
2. Envie todos os arquivos desta pasta para a branch `main`.
3. No GitHub, abra `Settings` > `Pages`.
4. Em `Build and deployment`, escolha `Deploy from a branch`.
5. Selecione:
   - Branch: `main`
   - Folder: `/root`
6. Salve.
7. Acesse a URL gerada pelo GitHub Pages.

Exemplo de URL:

```text
https://seu-usuario.github.io/nome-do-repositorio/
```

## Observacao importante

Esta versao usa `localStorage`, ou seja, os dados ficam salvos apenas no navegador de cada pessoa. No GitHub Pages, os palpites e resultados nao ficam compartilhados entre usuarios.

Para um bolao real com varias pessoas vendo o mesmo ranking, o proximo passo e conectar o app a um banco de dados, como Supabase ou Firebase.

## Estrutura

```text
.
├── index.html
├── admin.html
├── app.js
├── admin.js
├── data.js
├── styles.css
└── assets/
```

