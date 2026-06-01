# Bolão Copa 2026

Aplicativo estático de bolão para a Copa do Mundo 2026, pronto para publicar no GitHub Pages e sincronizar dados pelo Supabase.

## Páginas

- `index.html`: cadastro, login, palpites, ranking e pontuação do participante.
- `admin.html`: aprovação de cadastros, geração de códigos de acesso e atualização de placares.

Código do administrador no protótipo:

```text
ADMIN2026
```

Altere esse código no arquivo `admin.js` antes de divulgar o link.

## Fluxo do grupo fechado

1. O participante abre o link do bolão.
2. Ele solicita cadastro com nome e e-mail.
3. O administrador entra em `admin.html`.
4. O administrador aprova o cadastro e copia o código gerado.
5. O administrador envia esse código para o participante.
6. O participante entra com e-mail + código e registra seus palpites.
7. Quando o administrador atualiza resultados, ranking e pontuação são recalculados.

## Configurar Supabase

1. Acesse https://supabase.com e crie um projeto.
2. No painel do projeto, abra `SQL Editor`.
3. Copie e execute todo o conteúdo de `supabase-schema.sql`.
4. Vá em `Project Settings` > `API`.
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

8. Suba novamente os arquivos para o GitHub Pages.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie todos os arquivos desta pasta para a branch `main`.
3. No GitHub, abra `Settings` > `Pages`.
4. Em `Build and deployment`, escolha `Deploy from a branch`.
5. Selecione:
   - Branch: `main`
   - Folder: `/root`
6. Salve e acesse a URL gerada pelo GitHub Pages.

## Observação sobre segurança

Este é um MVP para grupo fechado. Como o projeto roda direto no navegador, a chave pública do Supabase fica visível, o que é normal em apps front-end. Para uma versão mais segura, o próximo passo seria usar Supabase Auth ou Edge Functions para proteger ações administrativas no servidor.
