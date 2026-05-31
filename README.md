# Bolao Copa 2026

Aplicativo estatico de bolao para a Copa do Mundo 2026, pronto para publicar no GitHub Pages.

## Paginas

- `index.html`: tela dos participantes.
- `admin.html`: tela administrativa para atualizar placares.

Codigos do prototipo:

- Codigo do grupo: `Unidade4`
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

Esta versao pode rodar de dois jeitos:

- Sem Supabase configurado: usa `localStorage`, bom para testes locais.
- Com Supabase configurado: participantes, palpites e resultados ficam compartilhados.

## Configurar Supabase

1. Acesse https://supabase.com e crie um projeto.
2. No painel do projeto, abra `SQL Editor`.
3. Copie e execute o conteudo de `supabase-schema.sql`.
4. Va em `Project Settings` > `API`.
5. Copie:
   - `Project URL`
   - `anon public key`
6. Abra `supabase-config.js`.
7. Substitua:

```js
url: "COLE_AQUI_A_PROJECT_URL",
anonKey: "COLE_AQUI_A_ANON_PUBLIC_KEY"
```

pelos dados do seu projeto.

8. Suba novamente os arquivos para o GitHub Pages.

Quando esses valores estiverem preenchidos, o app passa a sincronizar os dados com Supabase.

## Importante sobre seguranca

Esta configuracao e um MVP para grupo fechado com codigo. Ela usa a chave publica `anon`, que e normal em apps front-end com Supabase. Para mais seguranca em uma versao final, o ideal e adicionar autenticacao real e regras RLS por usuario.

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
