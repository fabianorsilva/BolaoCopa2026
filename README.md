# Bolao Copa 2026

Um bolao online para um grupo fechado acompanhar a Copa do Mundo 2026 com cadastro, palpites, ranking, pontuacao por jogo e painel administrativo.

## Como funciona para o participante

1. Acesse o link do bolao.
2. Solicite o cadastro informando nome e e-mail.
3. Aguarde a aprovacao do administrador.
4. Receba o codigo de acesso por e-mail, WhatsApp ou outro canal combinado.
5. Entre com seu e-mail e codigo.
6. Registre seus palpites nos jogos disponiveis.
7. Acompanhe sua pontuacao, o ranking geral e os palpites do grupo.

## Regras principais

- Os horarios dos jogos aparecem em horario de Brasilia.
- O participante pode palpitar ate 5 minutos antes do inicio da partida.
- Depois desse prazo, o palpite do jogo fica bloqueado.
- Os palpites dos outros participantes so aparecem depois que o prazo do jogo encerrar.
- Se o participante nao fizer palpite em uma partida, recebe 0 ponto nessa partida.

## Pontuacao

- Placar exato: 5 pontos.
- Tendencia correta: 2 pontos.
- Palpite errado: 0 ponto.
- Sem palpite: 0 ponto.

Exemplo:

- Resultado: Brasil 2 x 1 Argentina.
- Palpite 2 x 1: 5 pontos.
- Palpite 1 x 0: 2 pontos, pois acertou o vencedor.
- Palpite 1 x 1: 0 ponto.

## Tela do participante

A tela logada mostra:

- proximo jogo para palpitar;
- posicao do participante no ranking;
- pontos totais;
- palpites pendentes;
- lider atual;
- jogos do dia;
- classificacao dos grupos;
- pontuacao do dia;
- palpites do grupo apos o fechamento;
- tabela completa.

## Painel administrativo

O administrador acessa `admin.html`.

No painel admin e possivel:

- ver cadastros pendentes;
- aprovar participantes;
- gerar e copiar codigos de acesso;
- remover participantes;
- atualizar placares oficiais;
- acompanhar quantos palpites cada participante fez.

Codigo admin atual:

```text
ADMIN2026
```

Altere esse codigo em `admin.js` antes de divulgar o projeto.

## Configurar Supabase

1. Crie um projeto em https://supabase.com.
2. Abra `SQL Editor`.
3. Execute o conteudo de `supabase-schema.sql`.
4. Va em `Project Settings` > `API`.
5. Copie:
   - `Project URL`
   - `anon public key` ou `publishable key`
6. Atualize `supabase-config.js`.

Exemplo:

```js
window.BOLAO_SUPABASE_CONFIG = {
  url: "https://seu-projeto.supabase.co",
  anonKey: "sua-chave-publica"
};
```

## Publicar no GitHub Pages

1. Crie um repositorio no GitHub.
2. Envie os arquivos do projeto para a branch `main`.
3. No GitHub, abra `Settings` > `Pages`.
4. Em `Build and deployment`, escolha `Deploy from a branch`.
5. Selecione:
   - Branch: `main`
   - Folder: `/root`
6. Salve.
7. Abra a URL gerada pelo GitHub Pages.

Depois de publicar uma nova versao, recarregue a pagina com `Ctrl + F5`.

## Arquivos principais

- `index.html`: pagina dos participantes.
- `admin.html`: painel administrativo.
- `app.js`: regras da tela dos participantes.
- `admin.js`: regras do painel admin.
- `data.js`: tabela de jogos.
- `styles.css`: estilos e responsividade.
- `supabase-state.js`: integracao com Supabase.
- `supabase-config.js`: URL e chave publica do Supabase.
- `supabase-schema.sql`: tabelas e politicas do Supabase.

## Observacao sobre seguranca

Este projeto e um MVP estatico para grupo fechado. A chave publica do Supabase fica visivel no navegador, o que e esperado em aplicacoes front-end. Nao coloque chaves secretas neste repositorio.
