# Bolao Copa 2026

Aplicativo estatico de bolao para a Copa do Mundo 2026, pronto para publicar no GitHub Pages e sincronizar dados pelo Supabase.

## Paginas

- `index.html`: cadastro, login, palpites, ranking e pontuacao do participante.
- `admin.html`: aprovacao de cadastros, geracao de codigos de acesso e atualizacao de placares.

Codigo do administrador no prototipo:

```text
ADMIN2026
```

Altere esse codigo no arquivo `admin.js` antes de divulgar o link.

## Fluxo do grupo fechado

1. O participante abre o link do bolao.
2. Ele solicita cadastro com nome e e-mail.
3. O administrador entra em `admin.html`.
4. O administrador aprova o cadastro.
5. O sistema gera um codigo individual e copia esse codigo automaticamente.
6. O administrador envia o codigo manualmente por e-mail, WhatsApp ou outro canal.
7. O participante entra com e-mail + codigo e registra seus palpites.
8. Quando o administrador atualiza resultados, ranking e pontuacao sao recalculados.

## Configurar Supabase

1. Acesse https://supabase.com e crie um projeto.
2. No painel do projeto, abra `SQL Editor`.
3. Copie e execute todo o conteudo de `supabase-schema.sql`.
4. Va em `Project Settings` > `API`.
5. Copie:
   - `Project URL`
   - `anon public key` ou `publishable key`
6. Abra `supabase-config.js`.
7. Substitua:

```js
url: "COLE_AQUI_A_PROJECT_URL",
anonKey: "COLE_AQUI_A_ANON_PUBLIC_KEY"
```

pelos dados do seu projeto.

## Publicar no GitHub Pages

1. Crie um repositorio no GitHub.
2. Envie todos os arquivos desta pasta para a branch `main`.
3. No GitHub, abra `Settings` > `Pages`.
4. Em `Build and deployment`, escolha `Deploy from a branch`.
5. Selecione:
   - Branch: `main`
   - Folder: `/root`
6. Salve e acesse a URL gerada pelo GitHub Pages.

## Observacao sobre seguranca

Este e um MVP para grupo fechado. A chave publica do Supabase fica visivel no navegador, o que e normal em apps front-end. Para uma versao final mais segura, o ideal e usar autenticacao real e regras RLS por usuario.
