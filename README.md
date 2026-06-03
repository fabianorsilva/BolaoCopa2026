# Bolão Copa 2026

Um bolão online para um grupo fechado acompanhar a Copa do Mundo 2026, com cadastro, palpites, ranking, pontuação por jogo e painel administrativo.

## Como funciona para o participante

1. Acesse o link do bolão.
2. Solicite o cadastro informando nome e e-mail.
3. Aguarde a aprovação do administrador.
4. Receba o código de acesso por e-mail, WhatsApp ou outro canal combinado.
5. Entre com seu e-mail e código.
6. Registre seus palpites nos jogos disponíveis.
7. Acompanhe sua pontuação, o ranking geral e os palpites do grupo.

## Regras principais

* Os horários dos jogos aparecem no horário de Brasília.
* O participante pode palpitar até 5 minutos antes do início da partida.
* Depois desse prazo, o palpite do jogo fica bloqueado.
* Os palpites dos outros participantes só aparecem depois que o prazo do jogo encerrar.
* Se o participante não fizer palpite em uma partida, recebe 0 ponto nessa partida.

## Pontuação

* Placar exato: 5 pontos.
* Tendência correta: 2 pontos.
* Palpite errado: 0 ponto.
* Sem palpite: 0 ponto.

### Exemplo

* Resultado: Brasil 2 x 1 Argentina.
* Palpite 2 x 1: 5 pontos.
* Palpite 1 x 0: 2 pontos, pois acertou o vencedor.
* Palpite 1 x 1: 0 ponto.

## Tela do participante

A tela logada mostra:

* Próximo jogo para palpitar;
* Posição do participante no ranking;
* Pontos totais;
* Palpites pendentes;
* Líder atual;
* Jogos do dia;
* Classificação dos grupos;
* Pontuação do dia;
* Palpites do grupo após o fechamento;
* Tabela completa.

## Painel administrativo

O administrador acessa `admin.html`.

No painel administrativo é possível:

* Ver cadastros pendentes;
* Aprovar participantes;
* Gerar e copiar códigos de acesso;
* Remover participantes;
* Atualizar placares oficiais;
* Acompanhar quantos palpites cada participante fez.

### Código administrativo atual

```text
ADMIN2026
```

Altere esse código em `admin.js` antes de divulgar o projeto.

## Configurar o Supabase

1. Crie um projeto no Supabase.
2. Abra o `SQL Editor`.
3. Execute o conteúdo de `supabase-schema.sql`.
4. Vá em `Project Settings` > `API`.
5. Copie:

   * `Project URL`;
   * `anon public key` ou `publishable key`.
6. Atualize o arquivo `supabase-config.js`.

### Exemplo

```js
window.BOLAO_SUPABASE_CONFIG = {
  url: "https://seu-projeto.supabase.co",
  anonKey: "sua-chave-publica"
};
```

## Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie os arquivos do projeto para a branch `main`.
3. No GitHub, abra `Settings` > `Pages`.
4. Em `Build and deployment`, escolha `Deploy from a branch`.
5. Selecione:

   * Branch: `main`;
   * Folder: `/root`.
6. Salve.
7. Abra a URL gerada pelo GitHub Pages.

Depois de publicar uma nova versão, recarregue a página com `Ctrl + F5`.

## Arquivos principais

* `index.html`: página dos participantes;
* `admin.html`: painel administrativo;
* `app.js`: regras da tela dos participantes;
* `admin.js`: regras do painel administrativo;
* `data.js`: tabela de jogos;
* `styles.css`: estilos e responsividade;
* `supabase-state.js`: integração com o Supabase;
* `supabase-config.js`: URL e chave pública do Supabase;
* `supabase-schema.sql`: tabelas e políticas do Supabase.

## Observação sobre segurança

Este projeto é um MVP estático para grupo fechado. A chave pública do Supabase fica visível no navegador, o que é esperado em aplicações front-end. Não coloque chaves secretas neste repositório.
