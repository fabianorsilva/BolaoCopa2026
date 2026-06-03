const STORAGE_KEY = "bolao-copa-2026-session";
const GUESS_LOCK_MINUTES = 5;
const BRASILIA_UTC_OFFSET_HOURS = -3;

// Mapa entre nome interno da seleção e código usado para buscar a bandeira em SVG.
const FLAG_BY_TEAM = {
  "Algeria": { code: "dz", label: "DZ" },
  "Argentina": { code: "ar", label: "AR" },
  "Australia": { code: "au", label: "AU" },
  "Austria": { code: "at", label: "AT" },
  "Belgium": { code: "be", label: "BE" },
  "Bosnia & Herzegovina": { code: "ba", label: "BA" },
  "Brazil": { code: "br", label: "BR" },
  "Canada": { code: "ca", label: "CA" },
  "Cape Verde": { code: "cv", label: "CV" },
  "Colombia": { code: "co", label: "CO" },
  "Croatia": { code: "hr", label: "HR" },
  "Curacao": { code: "cw", label: "CW" },
  "Czechia": { code: "cz", label: "CZ" },
  "DR Congo": { code: "cd", label: "CD" },
  "Ecuador": { code: "ec", label: "EC" },
  "Egypt": { code: "eg", label: "EG" },
  "England": { code: "gb-eng", label: "ENG" },
  "France": { code: "fr", label: "FR" },
  "Germany": { code: "de", label: "DE" },
  "Ghana": { code: "gh", label: "GH" },
  "Haiti": { code: "ht", label: "HT" },
  "Iran": { code: "ir", label: "IR" },
  "Iraq": { code: "iq", label: "IQ" },
  "Ivory Coast": { code: "ci", label: "CI" },
  "Japan": { code: "jp", label: "JP" },
  "Jordan": { code: "jo", label: "JO" },
  "Mexico": { code: "mx", label: "MX" },
  "Morocco": { code: "ma", label: "MA" },
  "Netherlands": { code: "nl", label: "NL" },
  "New Zealand": { code: "nz", label: "NZ" },
  "Norway": { code: "no", label: "NO" },
  "Panama": { code: "pa", label: "PA" },
  "Paraguay": { code: "py", label: "PY" },
  "Portugal": { code: "pt", label: "PT" },
  "Qatar": { code: "qa", label: "QA" },
  "Saudi Arabia": { code: "sa", label: "SA" },
  "Scotland": { code: "gb-sct", label: "SCO" },
  "Senegal": { code: "sn", label: "SN" },
  "South Africa": { code: "za", label: "ZA" },
  "South Korea": { code: "kr", label: "KR" },
  "Spain": { code: "es", label: "ES" },
  "Sweden": { code: "se", label: "SE" },
  "Switzerland": { code: "ch", label: "CH" },
  "Tunisia": { code: "tn", label: "TN" },
  "Turkiye": { code: "tr", label: "TR" },
  "United States": { code: "us", label: "US" },
  "Uruguay": { code: "uy", label: "UY" },
  "Uzbekistan": { code: "uz", label: "UZ" }
};

// Tradução dos nomes usados nos dados para nomes exibidos ao usuário em português.
const TEAM_NAME_PT = {
  "Algeria": "Argélia",
  "Argentina": "Argentina",
  "Australia": "Austrália",
  "Austria": "Áustria",
  "Belgium": "Bélgica",
  "Bosnia & Herzegovina": "Bósnia e Herzegovina",
  "Brazil": "Brasil",
  "Canada": "Canadá",
  "Cape Verde": "Cabo Verde",
  "Colombia": "Colômbia",
  "Croatia": "Croácia",
  "Curacao": "Curaçao",
  "Czechia": "Tchéquia",
  "DR Congo": "RD Congo",
  "Ecuador": "Equador",
  "Egypt": "Egito",
  "England": "Inglaterra",
  "France": "França",
  "Germany": "Alemanha",
  "Ghana": "Gana",
  "Haiti": "Haiti",
  "Iran": "Irã",
  "Iraq": "Iraque",
  "Ivory Coast": "Costa do Marfim",
  "Japan": "Japão",
  "Jordan": "Jordânia",
  "Mexico": "México",
  "Morocco": "Marrocos",
  "Netherlands": "Países Baixos",
  "New Zealand": "Nova Zelândia",
  "Norway": "Noruega",
  "Panama": "Panamá",
  "Paraguay": "Paraguai",
  "Portugal": "Portugal",
  "Qatar": "Catar",
  "Saudi Arabia": "Arábia Saudita",
  "Scotland": "Escócia",
  "Senegal": "Senegal",
  "South Africa": "África do Sul",
  "South Korea": "Coreia do Sul",
  "Spain": "Espanha",
  "Sweden": "Suécia",
  "Switzerland": "Suíça",
  "Tunisia": "Tunísia",
  "Turkiye": "Turquia",
  "United States": "Estados Unidos",
  "Uruguay": "Uruguai",
  "Uzbekistan": "Uzbequistão"
};

// Estado em memória da tela do participante. Ele é atualizado pelo Supabase e re-renderizado na UI.
const state = {
  currentParticipantId: localStorage.getItem(STORAGE_KEY) || "",
  participants: [],
  matches: cloneData(WORLD_CUP_MATCHES),
  guesses: {}
};

// Cache dos elementos do DOM para evitar procurar os mesmos IDs várias vezes.
const els = {};

// Ponto de entrada da página: conecta eventos, carrega dados e desenha a primeira tela.
document.addEventListener("DOMContentLoaded", async () => {
  bindElements();
  bindEvents();
  await refreshState();
  render();
});

function bindElements() {
  Object.assign(els, {
    authPanel: document.querySelector("#authPanel"),
    registerForm: document.querySelector("#registerForm"),
    registerName: document.querySelector("#registerName"),
    registerEmail: document.querySelector("#registerEmail"),
    loginForm: document.querySelector("#loginForm"),
    loginEmail: document.querySelector("#loginEmail"),
    loginCode: document.querySelector("#loginCode"),
    authMessage: document.querySelector("#authMessage"),
    dashboard: document.querySelector("#dashboard"),
    topActions: document.querySelector("#topActions"),
    currentUserChip: document.querySelector("#currentUserChip"),
    logoutButton: document.querySelector("#logoutButton"),
    refreshButton: document.querySelector("#refreshButton"),
    loggedHero: document.querySelector("#loggedHero"),
    heroNextMatch: document.querySelector("#heroNextMatch"),
    heroStats: document.querySelector("#heroStats"),
    leaderboard: document.querySelector("#leaderboard"),
    matchDaySelect: document.querySelector("#matchDaySelect"),
    dailyMatchList: document.querySelector("#dailyMatchList"),
    groupSelect: document.querySelector("#groupSelect"),
    groupTeamList: document.querySelector("#groupTeamList"),
    myScoreTitle: document.querySelector("#myScoreTitle"),
    myScoreTotal: document.querySelector("#myScoreTotal"),
    myScoreBreakdown: document.querySelector("#myScoreBreakdown"),
    playerSelect: document.querySelector("#playerSelect"),
    roundFilter: document.querySelector("#roundFilter"),
    guessList: document.querySelector("#guessList"),
    resultList: document.querySelector("#resultList"),
    participantGrid: document.querySelector("#participantGrid"),
    template: document.querySelector("#matchGuessTemplate")
  });
}

function bindEvents() {
  document.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.tab));
  });

  els.registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await requestRegistration();
  });

  els.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await loginParticipant();
  });

  els.logoutButton.addEventListener("click", () => {
    state.currentParticipantId = "";
    localStorage.removeItem(STORAGE_KEY);
    render();
    els.loginEmail.focus();
  });

  els.refreshButton.addEventListener("click", async () => {
    await refreshState();
    render();
    showToast("Dados atualizados.");
  });

  els.roundFilter.addEventListener("change", renderGuesses);
  els.matchDaySelect.addEventListener("change", () => {
    renderDailyMatches();
    renderMyScore();
  });
  els.groupSelect.addEventListener("change", renderGroupTeams);
}

// Busca dados online e mantém a tela funcional mesmo quando o Supabase falha.
async function refreshState() {
  if (!window.BolaoSupabase?.isConfigured()) {
    const status = window.BolaoSupabase?.getConfigStatus?.();
    showAuthMessage(status?.message || "O arquivo supabase-state.js não carregou corretamente.");
    return;
  }

  try {
    const shared = await window.BolaoSupabase.loadPublicState();
    applySharedState(shared);
  } catch (error) {
    showAuthMessage(`Não foi possível carregar o Supabase: ${window.BolaoSupabase.describeError(error)}`);
  }
}

function applySharedState(shared) {
  state.participants = shared.participants || [];
  state.matches = mergeResults(shared.results || []);
  state.guesses = buildGuessMap(shared.guesses || []);

  if (!state.participants.some((participant) => participant.id === state.currentParticipantId)) {
    state.currentParticipantId = "";
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Junta os jogos fixos de data.js com os resultados oficiais vindos do Supabase.
function mergeResults(results = []) {
  const resultByMatch = new Map(results.map((result) => [result.matchId, result]));
  return WORLD_CUP_MATCHES.map((match) => {
    const result = resultByMatch.get(match.id);
    return {
      ...match,
      result: result ? { home: result.home, away: result.away } : null
    };
  });
}

function buildGuessMap(guesses = []) {
  return guesses.reduce((map, guess) => {
    map[guess.participantId] ||= {};
    map[guess.participantId][guess.matchId] = { home: guess.home, away: guess.away };
    return map;
  }, {});
}

// Fluxo de cadastro: envia nome/e-mail para aprovação posterior do administrador.
async function requestRegistration() {
  const name = els.registerName.value.trim();
  const email = els.registerEmail.value.trim();

  if (!name) {
    showAuthMessage("Informe seu nome.");
    return;
  }

  if (!isValidEmail(email)) {
    showAuthMessage("Informe um e-mail válido.");
    return;
  }

  if (!window.BolaoSupabase?.isConfigured()) {
    const status = window.BolaoSupabase?.getConfigStatus?.();
    showAuthMessage(status?.message || "O arquivo supabase-state.js não carregou corretamente.");
    return;
  }

  try {
    const participant = await window.BolaoSupabase.registerParticipant(name, email);
    els.registerForm.reset();
    if (participant.status === "approved") {
      showAuthMessage("Seu cadastro já foi aprovado. Use o código enviado pelo administrador para entrar.");
      els.loginEmail.value = participant.email;
      els.loginCode.focus();
      return;
    }

    showAuthMessage("Cadastro enviado. Aguarde o administrador aprovar e enviar seu código de acesso.");
  } catch (error) {
    showAuthMessage(`Não foi possível enviar o cadastro: ${window.BolaoSupabase.describeError(error)}`);
  }
}

// Fluxo de login: valida e-mail + código individual aprovado no painel admin.
async function loginParticipant() {
  const email = els.loginEmail.value.trim();
  const code = els.loginCode.value.trim();

  if (!isValidEmail(email)) {
    showAuthMessage("Informe seu e-mail cadastrado.");
    return;
  }

  if (!code) {
    showAuthMessage("Informe o código enviado pelo administrador.");
    return;
  }

  try {
    const participant = await window.BolaoSupabase.loginParticipant(email, code);
    if (!participant) {
      showAuthMessage("E-mail ou código incorreto. Se você acabou de se cadastrar, aguarde a aprovação do administrador.");
      return;
    }

    if (participant.status !== "approved") {
      showAuthMessage("Seu cadastro ainda está aguardando aprovação.");
      return;
    }

    state.currentParticipantId = participant.id;
    localStorage.setItem(STORAGE_KEY, participant.id);
    await refreshState();
    render();
    showToast("Entrada confirmada. Bons palpites!");
  } catch (error) {
    showAuthMessage(`Não foi possível entrar: ${window.BolaoSupabase.describeError(error)}`);
  }
}

function activateTab(tabName) {
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === tabName));
  document.querySelectorAll(".tab-page").forEach((page) => page.classList.toggle("active", page.id === `tab-${tabName}`));
}

// Renderização central: decide se mostra login ou dashboard e atualiza todos os painéis.
function render() {
  const participant = getCurrentParticipant();
  const isLoggedIn = Boolean(participant);

  els.authPanel.classList.toggle("hidden", isLoggedIn);
  els.dashboard.classList.toggle("hidden", !isLoggedIn);
  els.topActions.classList.toggle("hidden", !isLoggedIn);
  els.currentUserChip.textContent = participant?.name || "Sem acesso";

  renderSelectors();
  renderLoggedHero();
  renderLeaderboard();
  renderDailyMatches();
  renderGroupTeams();
  renderMyScore();
  renderGuesses();
  renderResults();
  renderParticipants();
}

function renderSelectors() {
  const currentParticipant = getCurrentParticipant();
  els.playerSelect.innerHTML = currentParticipant
    ? `<option value="${currentParticipant.id}">${escapeHtml(currentParticipant.name)}</option>`
    : `<option value="">Entre no bolão</option>`;
  els.playerSelect.disabled = true;

  const rounds = ["Todas", ...new Set(state.matches.map((match) => match.round))];
  const currentRound = els.roundFilter.value || "Todas";
  els.roundFilter.innerHTML = rounds.map((round) => `<option value="${round}">${formatRoundLabel(round)}</option>`).join("");
  els.roundFilter.value = rounds.includes(currentRound) ? currentRound : "Todas";

  const matchDays = getMatchDays();
  const currentDay = els.matchDaySelect.value || getDefaultMatchDay(matchDays);
  els.matchDaySelect.innerHTML = matchDays.map((day) => `<option value="${day}">${formatDate(day)}</option>`).join("");
  els.matchDaySelect.value = matchDays.includes(currentDay) ? currentDay : matchDays[0];

  const groups = getGroups();
  const currentGroup = els.groupSelect.value || groups[0]?.id || "";
  els.groupSelect.innerHTML = groups.map((group) => `<option value="${group.id}">${group.name}</option>`).join("");
  els.groupSelect.value = groups.some((group) => group.id === currentGroup) ? currentGroup : groups[0]?.id || "";
}

// Monta o destaque superior do usuário logado com próximo jogo, pontos e ranking.
function renderLoggedHero() {
  const participant = getCurrentParticipant();
  if (!participant || !els.loggedHero) return;

  const ranking = getRanking();
  const position = ranking.findIndex((row) => row.id === participant.id) + 1;
  const total = getParticipantPoints(participant.id);
  const openMatches = state.matches.filter((match) => isGuessOpen(match));
  const pendingOpen = openMatches.filter((match) => !isCompleteScore(state.guesses[participant.id]?.[match.id])).length;
  const nextMatch = openMatches.sort((a, b) => getMatchStartDate(a) - getMatchStartDate(b))[0];
  const leader = ranking[0];

  els.heroStats.innerHTML = `
    <article><strong>${position || "-"}</strong><span>sua posição</span></article>
    <article><strong>${total}</strong><span>pontos totais</span></article>
    <article><strong>${pendingOpen}</strong><span>palpites pendentes</span></article>
    <article><strong>${leader ? escapeHtml(leader.name) : "-"}</strong><span>líder atual</span></article>
  `;

  els.heroNextMatch.innerHTML = nextMatch ? `
    <div>
      <p class="eyebrow">Próximo palpite</p>
      <div class="hero-match-line">
        ${teamMarkup(nextMatch.home)}
        <strong>${formatMatchTimeBR(nextMatch)} BRT</strong>
        ${teamMarkup(nextMatch.away)}
      </div>
      <small>${formatDate(getMatchDateBR(nextMatch))} - ${formatRoundLabel(nextMatch.round)} - prazo até ${formatGuessDeadlineLabel(nextMatch)}</small>
    </div>
    <button class="primary-button" type="button" data-jump-match-day="${getMatchDateBR(nextMatch)}">Palpitar agora</button>
  ` : `
    <div>
      <p class="eyebrow">Palpites</p>
      <h2>Todos os prazos abertos foram preenchidos ou encerrados.</h2>
    </div>
  `;

  els.heroNextMatch.querySelector("[data-jump-match-day]")?.addEventListener("click", (event) => {
    els.matchDaySelect.value = event.currentTarget.dataset.jumpMatchDay;
    renderDailyMatches();
    renderMyScore();
    window.scrollTo({ top: els.dailyMatchList.getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth" });
  });
}

function renderLeaderboard() {
  const ranking = getRanking();
  els.leaderboard.innerHTML = ranking.length
    ? ranking.map((row, index) => `
      <li>
        <span class="rank">${index + 1}</span>
        <div>
          <strong>${escapeHtml(row.name)}</strong>
          <br />
          <small>${row.exact} placares exatos - ${row.trend} tendências corretas</small>
        </div>
        <span class="points">${row.points} pts</span>
      </li>
    `).join("")
    : `<li class="empty-state">Nenhum participante aprovado ainda.</li>`;
}

// Renderiza os jogos da data selecionada e os campos de palpite do participante.
function renderDailyMatches() {
  const selectedDay = els.matchDaySelect.value || getDefaultMatchDay(getMatchDays());
  const matches = state.matches.filter((match) => getMatchDateBR(match) === selectedDay);
  const participantId = state.currentParticipantId;

  els.dailyMatchList.innerHTML = matches.map((match) => {
    const guess = state.guesses[participantId]?.[match.id] || { home: "", away: "" };
    const feedback = getGuessFeedback(guess, match.result);
    const guessOpen = isGuessOpen(match);
    const lockMessage = guessOpen
      ? `Palpites abertos até ${formatGuessDeadlineLabel(match)}`
      : "Palpites encerrados para este jogo";
    return `
      <article class="daily-match" data-daily-match="${match.id}">
        <div class="daily-match-teams">
          ${teamMarkup(match.home)}
          <strong>${isCompleteScore(match.result) ? `${match.result.home} x ${match.result.away}` : `${formatMatchTimeBR(match)} BRT`}</strong>
          ${teamMarkup(match.away)}
        </div>
        <div class="daily-guess-row ${guessOpen ? "" : "is-locked"}">
          <span>Seu palpite</span>
          <div class="score-inputs">
            <input class="daily-home-score" type="number" min="0" max="20" inputmode="numeric" value="${guess.home}" ${guessOpen ? "" : "disabled"} aria-label="Gols de ${escapeHtml(formatTeamName(match.home))}" />
            <span>x</span>
            <input class="daily-away-score" type="number" min="0" max="20" inputmode="numeric" value="${guess.away}" ${guessOpen ? "" : "disabled"} aria-label="Gols de ${escapeHtml(formatTeamName(match.away))}" />
          </div>
          <button class="secondary-button save-daily-guess" type="button" ${guessOpen ? "" : "disabled"}>${guessOpen ? "Salvar" : "Encerrado"}</button>
        </div>
        ${feedback ? `<div class="guess-feedback ${feedback.className}">${feedback.label}</div>` : ""}
        <small>Jogo ${match.number} - ${formatRoundLabel(match.round)} - ${escapeHtml(match.city)} - ${lockMessage}</small>
      </article>
    `;
  }).join("");

  els.dailyMatchList.querySelectorAll("[data-daily-match]").forEach((card) => {
    const saveButton = card.querySelector(".save-daily-guess");
    saveButton.addEventListener("click", () => saveGuess(
      participantId,
      card.dataset.dailyMatch,
      card.querySelector(".daily-home-score").value,
      card.querySelector(".daily-away-score").value,
      saveButton
    ));
  });
}

// Salva um palpite no Supabase, respeitando o fechamento 5 minutos antes do jogo.
async function saveGuess(participantId, matchId, home, away, button) {
  if (!participantId) {
    showToast("Entre no bolão para salvar seu palpite.");
    return;
  }

  if (home === "" || away === "") {
    showToast("Preencha os dois placares antes de salvar.");
    return;
  }

  const match = state.matches.find((item) => item.id === matchId);
  if (!match || !isGuessOpen(match)) {
    showToast("O prazo para palpitar neste jogo já encerrou.");
    renderDailyMatches();
    renderGuesses();
    return;
  }

  try {
    await window.BolaoSupabase.saveGuess(participantId, matchId, normalizeScore(home), normalizeScore(away));
    state.guesses[participantId] ||= {};
    state.guesses[participantId][matchId] = { home: normalizeScore(home), away: normalizeScore(away) };
    renderLeaderboard();
    renderDailyMatches();
    renderMyScore();
    renderGuesses();
    renderParticipants();
    markButtonSaved(button);
    showToast("Palpite salvo.");
  } catch (error) {
    showToast(`Não foi possível salvar o palpite: ${window.BolaoSupabase.describeError(error)}`);
  }
}

function markButtonSaved(button, text = "Salvo") {
  if (!button) return;
  const originalText = button.dataset.originalText || button.textContent;
  button.dataset.originalText = originalText;
  button.textContent = text;
  button.classList.add("is-saved");
  window.setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove("is-saved");
  }, 2200);
}

// Calcula e exibe a classificação de um grupo a partir dos resultados já registrados.
function renderGroupTeams() {
  const groupId = els.groupSelect.value || "A";
  const group = getGroups().find((item) => item.id === groupId);

  if (!group) {
    els.groupTeamList.innerHTML = `<article class="empty-state">Nenhum grupo encontrado.</article>`;
    return;
  }

  const standings = getGroupStandings(group);
  els.groupTeamList.innerHTML = `
    <div class="standings-table" role="table" aria-label="Classificação do ${group.name}">
      <div class="standings-row standings-head" role="row">
        <span>#</span>
        <span>Seleção</span>
        <span>Pts</span>
        <span>J</span>
        <span>V</span>
        <span>E</span>
        <span>D</span>
        <span>SG</span>
      </div>
      ${standings.map((team, index) => `
        <div class="standings-row" role="row">
          <span>${index + 1}</span>
          <span>${teamMarkup(team.name)}</span>
          <strong>${team.points}</strong>
          <span>${team.played}</span>
          <span>${team.wins}</span>
          <span>${team.draws}</span>
          <span>${team.losses}</span>
          <span>${team.goalDifference}</span>
        </div>
      `).join("")}
    </div>
  `;
}

// Aba Minha pontuação: mostra somente os jogos do dia selecionado e os pontos jogo a jogo.
function renderMyScore() {
  const participant = getCurrentParticipant();
  if (!participant) return;

  const total = getParticipantPoints(participant.id);
  const selectedDay = els.matchDaySelect.value || getDefaultMatchDay(getMatchDays());
  const dayMatches = state.matches.filter((match) => getMatchDateBR(match) === selectedDay);
  const daySettledMatches = dayMatches.filter((match) => isCompleteScore(match.result));
  const dayPoints = dayMatches.reduce((sum, match) => sum + scoreGuess(state.guesses[participant.id]?.[match.id], match.result), 0);
  const exact = daySettledMatches.filter((match) => scoreGuess(state.guesses[participant.id]?.[match.id], match.result) === 5).length;
  const trend = daySettledMatches.filter((match) => scoreGuess(state.guesses[participant.id]?.[match.id], match.result) === 2).length;

  els.myScoreTitle.textContent = participant.name;
  els.myScoreTotal.textContent = `${total} pts`;
  els.myScoreBreakdown.innerHTML = `
    <div class="score-summary">
      <article><strong>${dayPoints}</strong><small>pontos em ${formatDate(selectedDay)}</small></article>
      <article><strong>${exact}</strong><small>placares exatos</small></article>
      <article><strong>${trend}</strong><small>tendências corretas</small></article>
      <article><strong>${daySettledMatches.length}</strong><small>jogos com resultado</small></article>
    </div>
    <div class="score-card-list">
      ${dayMatches.map((match) => renderScoreRow(match, participant.id)).join("")}
    </div>
  `;
}

function renderScoreRow(match, participantId) {
  const guess = state.guesses[participantId]?.[match.id] || { home: "", away: "" };
  const points = scoreGuess(guess, match.result);
  const hasResult = isCompleteScore(match.result);
  const hasGuess = isCompleteScore(guess);
  const resultText = hasResult ? `${match.result.home} x ${match.result.away}` : "Pendente";
  const guessText = hasGuess ? `${guess.home} x ${guess.away}` : "Sem palpite";
  const status = hasResult ? `${points} pts` : "Aguardando";
  const feedback = getGuessFeedback(guess, match.result);

  return `
    <article class="score-card">
      <div class="score-card-game">
        <div>
          <span class="pill">Jogo ${match.number}</span>
          <span class="score-row-meta">${formatMatchTimeBR(match)} BRT</span>
        </div>
        <div class="score-row-teams">
          ${teamMarkup(match.home)}
          <span>x</span>
          ${teamMarkup(match.away)}
        </div>
      </div>
      <div class="score-card-metrics">
      <div class="score-card-metric">
        <small>Palpite</small>
        <strong>${guessText}</strong>
      </div>
      <div class="score-card-metric">
        <small>Resultado</small>
        <strong>${resultText}</strong>
      </div>
      <div class="score-card-metric score-card-points">
        <small>Pontuação</small>
        <strong>${status}</strong>
        ${feedback ? `<span class="${feedback.className}">${feedback.label}</span>` : ""}
      </div>
      </div>
    </article>
  `;
}

// Aba Palpites do grupo: só mostra palpites depois do encerramento do prazo daquele jogo.
function renderGuesses() {
  const round = els.roundFilter.value;
  const matches = state.matches.filter((match) => round === "Todas" || match.round === round);

  els.guessList.innerHTML = "";
  if (!state.currentParticipantId) {
    els.guessList.innerHTML = `<article class="match-card empty-state">Entre no bolão para ver os palpites do grupo.</article>`;
    return;
  }

  let currentGroup = "";
  matches.forEach((match) => {
    const group = `${formatRoundLabel(match.round)} - ${formatDate(getMatchDateBR(match))}`;
    if (group !== currentGroup) {
      currentGroup = group;
      els.guessList.insertAdjacentHTML("beforeend", `<h3 class="match-group-title">${group}</h3>`);
    }

    els.guessList.insertAdjacentHTML("beforeend", renderGroupGuessCard(match));
  });
}

// Aba Tabela: lista os jogos com informações extras, status e resultado quando existir.
function renderResults() {
  els.resultList.innerHTML = state.matches.map((match) => {
    const result = match.result || { home: "", away: "" };
    const guessCount = countGuessesForMatch(match.id);
    const status = isCompleteScore(match.result)
        ? "Resultado registrado"
      : isGuessOpen(match)
        ? `Palpites abertos até ${formatGuessDeadlineLabel(match)}`
        : "Palpites encerrados";
    return `
      <article class="match-card">
        <div class="match-meta">
          <span class="pill">${formatRoundLabel(match.round)}</span>
          <small>Jogo ${match.number} - ${formatDate(getMatchDateBR(match))} - ${formatMatchTimeBR(match)} BRT</small>
        </div>
        <div class="teams-row">
          <strong class="home-team">${teamMarkup(match.home)}</strong>
          <div class="score-inputs result-readonly">
            <strong>${isCompleteScore(result) ? result.home : "-"}</strong>
            <span>x</span>
            <strong>${isCompleteScore(result) ? result.away : "-"}</strong>
          </div>
          <strong class="away-team">${teamMarkup(match.away)}</strong>
        </div>
        <div class="match-info-grid">
          <span><strong>Data</strong>${formatDate(getMatchDateBR(match))}</span>
          <span><strong>Local</strong>${escapeHtml(match.city)}</span>
          <span><strong>Estádio</strong>${escapeHtml(match.venue)}</span>
          <span><strong>Palpites</strong>${guessCount}/${state.participants.length}</span>
          <span><strong>Status</strong>${status}</span>
        </div>
      </article>
    `;
  }).join("");
}

function renderParticipants() {
  els.participantGrid.innerHTML = state.participants.length
    ? getRanking().map((participant, index) => `
      <article class="participant-card">
        <div>
          <strong>${index + 1}. ${escapeHtml(participant.name)}</strong>
          <br />
          <small>${participant.points} pts - ${participant.exact} placares exatos</small>
        </div>
      </article>
    `).join("")
    : `<article class="participant-card empty-state">O grupo ainda não tem participantes aprovados.</article>`;
}

function renderGroupGuessCard(match) {
  const closedForGuesses = !isGuessOpen(match);
  const guesses = getGuessesForMatch(match.id);

  if (!closedForGuesses) {
    return `
      <article class="match-card locked-guess-card">
        <div class="match-meta">
          <span class="pill">${formatRoundLabel(match.round)}</span>
          <small>Jogo ${match.number} - ${formatDate(getMatchDateBR(match))} - ${formatMatchTimeBR(match)} BRT</small>
        </div>
        <div class="teams-row compact-teams">
          <strong class="home-team">${teamMarkup(match.home)}</strong>
          <strong class="result-readonly">x</strong>
          <strong class="away-team">${teamMarkup(match.away)}</strong>
        </div>
        <div class="match-footer">
          <span>Os palpites do grupo ficam ocultos até o encerramento.</span>
          <strong>abre após ${formatGuessDeadlineLabel(match)}</strong>
        </div>
      </article>
    `;
  }

  return `
    <article class="match-card">
      <div class="match-meta">
        <span class="pill">${formatRoundLabel(match.round)}</span>
        <small>Jogo ${match.number} - ${formatDate(getMatchDateBR(match))} - ${formatMatchTimeBR(match)} BRT</small>
      </div>
      <div class="teams-row compact-teams">
        <strong class="home-team">${teamMarkup(match.home)}</strong>
        <strong class="result-readonly">x</strong>
        <strong class="away-team">${teamMarkup(match.away)}</strong>
      </div>
      <div class="group-guess-list">
        ${guesses.length
          ? guesses.map(({ participant, guess }) => `
            <div class="group-guess-row">
              <strong>${escapeHtml(participant.name)}</strong>
              <span>${guess.home} x ${guess.away}</span>
            </div>
          `).join("")
          : `<div class="empty-state">Nenhum participante registrou palpite para este jogo.</div>`}
      </div>
    </article>
  `;
}

// Cria um card de jogo a partir do template HTML, evitando duplicação de marcação.
function createMatchCard(match, score, mode) {
  const card = els.template.content.firstElementChild.cloneNode(true);
  const guessOpen = isGuessOpen(match);
  card.querySelector(".pill").textContent = formatRoundLabel(match.round);
  card.querySelector("small").textContent = `Jogo ${match.number} - ${formatDate(getMatchDateBR(match))} - ${formatMatchTimeBR(match)} BRT`;
  card.querySelector(".home-team").innerHTML = teamMarkup(match.home);
  card.querySelector(".away-team").innerHTML = teamMarkup(match.away);

  const homeInput = card.querySelector(".home-score");
  const awayInput = card.querySelector(".away-score");
  homeInput.value = score.home ?? "";
  awayInput.value = score.away ?? "";
  homeInput.disabled = !guessOpen;
  awayInput.disabled = !guessOpen;

  const footer = card.querySelector(".match-footer");
  const feedback = getGuessFeedback(score, match.result);
  footer.innerHTML = isCompleteScore(match.result)
    ? `<span>Resultado: ${match.result.home} x ${match.result.away}</span><strong class="${feedback?.className || ""}">${feedback?.label || `${scoreGuess(score, match.result)} pts`}</strong>`
    : `<span>${escapeHtml(match.city)} - ${escapeHtml(match.venue)}</span><strong>${getGuessStatusLabel(match, score)}</strong>`;

  return card;
}

function getCurrentParticipant() {
  return state.participants.find((participant) => participant.id === state.currentParticipantId);
}

// Ranking geral: soma pontos, placares exatos e tendências corretas para ordenar participantes.
function getRanking() {
  return state.participants
    .map((participant) => {
      const points = getParticipantPoints(participant.id);
      const settled = state.matches.filter((match) => isCompleteScore(match.result));
      return {
        ...participant,
        points,
        exact: settled.filter((match) => scoreGuess(state.guesses[participant.id]?.[match.id], match.result) === 5).length,
        trend: settled.filter((match) => scoreGuess(state.guesses[participant.id]?.[match.id], match.result) === 2).length
      };
    })
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
}

function getGuessesForMatch(matchId) {
  return state.participants
    .map((participant) => ({
      participant,
      guess: state.guesses[participant.id]?.[matchId]
    }))
    .filter((item) => isCompleteScore(item.guess))
    .sort((a, b) => a.participant.name.localeCompare(b.participant.name));
}

function countGuessesForMatch(matchId) {
  return getGuessesForMatch(matchId).length;
}

function getParticipantPoints(participantId) {
  return state.matches.reduce((total, match) => {
    if (!isCompleteScore(match.result)) return total;
    return total + scoreGuess(state.guesses[participantId]?.[match.id], match.result);
  }, 0);
}

// Regra de pontuação: 5 pontos placar exato, 2 pontos tendência correta, 0 caso contrário.
function scoreGuess(guess, result) {
  if (!isCompleteScore(guess) || !isCompleteScore(result)) return 0;
  if (Number(guess.home) === Number(result.home) && Number(guess.away) === Number(result.away)) return 5;
  if (getOutcome(guess) === getOutcome(result)) return 2;
  return 0;
}

function getGuessFeedback(guess, result) {
  if (!isCompleteScore(result)) return null;
  if (!isCompleteScore(guess)) return { label: "Sem palpite: 0 pts", className: "feedback-missed" };

  const points = scoreGuess(guess, result);
  if (points === 5) return { label: "Placar correto +5 pts", className: "feedback-exact" };
  if (points === 2) return { label: "Tendência correta +2 pts", className: "feedback-trend" };
  return { label: "Palpite errado", className: "feedback-wrong" };
}

function isCompleteScore(score) {
  return score && score.home !== "" && score.away !== "" && score.home !== null && score.away !== null && score.home !== undefined && score.away !== undefined;
}

function getGuessStatusLabel(match, score) {
  if (!isGuessOpen(match)) return "palpites encerrados";
  return isCompleteScore(score) ? "palpite salvo" : "preencha o placar";
}

// Regras de prazo: palpite fica aberto até 5 minutos antes do início do jogo em Brasília.
function isGuessOpen(match) {
  return Date.now() < getGuessDeadline(match).getTime();
}

function getGuessDeadline(match) {
  return new Date(getMatchStartDate(match).getTime() - GUESS_LOCK_MINUTES * 60 * 1000);
}

function getMatchStartDate(match) {
  const [year, month, day] = match.date.split("-").map(Number);
  const [hour, minute] = match.time.split(":").map(Number);
  const utcHour = hour - BRASILIA_UTC_OFFSET_HOURS;
  return new Date(Date.UTC(year, month - 1, day, utcHour, minute));
}

function formatGuessDeadline(match) {
  const deadline = getGuessDeadline(match);
  const local = getOffsetDateParts(deadline, BRASILIA_UTC_OFFSET_HOURS);
  const hours = String(local.hour).padStart(2, "0");
  const minutes = String(deadline.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatGuessDeadlineLabel(match) {
  const deadline = getGuessDeadline(match);
  const deadlineDate = getDateKeyForOffset(deadline, BRASILIA_UTC_OFFSET_HOURS);
  const time = `${formatGuessDeadline(match)} BRT`;
  return deadlineDate === getMatchDateBR(match) ? time : `${time} de ${formatDate(deadlineDate)}`;
}

function formatMatchTimeBR(match) {
  const local = getOffsetDateParts(getMatchStartDate(match), BRASILIA_UTC_OFFSET_HOURS);
  return `${String(local.hour).padStart(2, "0")}:${String(local.minute).padStart(2, "0")}`;
}

function getMatchDateBR(match) {
  const local = getOffsetDateParts(getMatchStartDate(match), BRASILIA_UTC_OFFSET_HOURS);
  return `${local.year}-${String(local.month).padStart(2, "0")}-${String(local.day).padStart(2, "0")}`;
}

function getOffsetDateParts(date, utcOffsetHours) {
  const shifted = new Date(date.getTime() + utcOffsetHours * 60 * 60 * 1000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes()
  };
}

function getOutcome(score) {
  if (Number(score.home) > Number(score.away)) return "home";
  if (Number(score.home) < Number(score.away)) return "away";
  return "draw";
}

function getMatchDays() {
  return [...new Set(state.matches.map((match) => getMatchDateBR(match)))].sort();
}

function getDefaultMatchDay(matchDays) {
  const today = getDateKeyForOffset(new Date(), BRASILIA_UTC_OFFSET_HOURS);
  return matchDays.find((day) => day >= today) || matchDays[0];
}

function getDateKeyForOffset(date, utcOffsetHours) {
  const local = getOffsetDateParts(date, utcOffsetHours);
  return `${local.year}-${String(local.month).padStart(2, "0")}-${String(local.day).padStart(2, "0")}`;
}

function getGroups() {
  const groups = new Map();
  state.matches
    .filter((match) => /^Grupo [A-L]$/.test(match.round))
    .forEach((match) => {
      const id = match.round.replace("Grupo ", "");
      if (!groups.has(id)) groups.set(id, new Set());
      groups.get(id).add(match.home);
      groups.get(id).add(match.away);
    });

  return [...groups.entries()].map(([id, teams]) => ({
    id,
    name: `Grupo ${id}`,
    teams: [...teams]
  }));
}

// Gera tabela de classificação de grupos com jogos, vitórias, saldo e pontos.
function getGroupStandings(group) {
  const table = new Map(group.teams.map((team) => [team, {
    name: team,
    points: 0,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0
  }]));

  state.matches
    .filter((match) => match.round === group.name && isCompleteScore(match.result))
    .forEach((match) => {
      const home = table.get(match.home);
      const away = table.get(match.away);
      if (!home || !away) return;

      const homeGoals = Number(match.result.home);
      const awayGoals = Number(match.result.away);

      home.played += 1;
      away.played += 1;
      home.goalsFor += homeGoals;
      home.goalsAgainst += awayGoals;
      away.goalsFor += awayGoals;
      away.goalsAgainst += homeGoals;

      if (homeGoals > awayGoals) {
        home.wins += 1;
        away.losses += 1;
        home.points += 3;
      } else if (homeGoals < awayGoals) {
        away.wins += 1;
        home.losses += 1;
        away.points += 3;
      } else {
        home.draws += 1;
        away.draws += 1;
        home.points += 1;
        away.points += 1;
      }
    });

  return [...table.values()]
    .map((team) => ({ ...team, goalDifference: team.goalsFor - team.goalsAgainst }))
    .sort((a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      formatTeamName(a.name).localeCompare(formatTeamName(b.name))
    );
}

// Exibe bandeira + nome traduzido da seleção em um bloco reutilizável.
function teamMarkup(team) {
  const flag = getFlag(team);
  const flagImage = flag.code === "tbd"
    ? ""
    : `<img src="${flagUrl(flag.code)}" alt="" loading="lazy" onerror="this.closest('.flag').classList.add('missing'); this.remove()" />`;
  return `<span class="team-display"><span class="flag flag-${flag.code}" aria-hidden="true">${flagImage}<span>${flag.label}</span></span><span class="team-label">${escapeHtml(formatTeamName(team))}</span></span>`;
}

function getFlag(team) {
  return FLAG_BY_TEAM[team] || { code: "tbd", label: "TBD" };
}

function flagUrl(code) {
  return `https://flagcdn.com/${code}.svg`;
}

function formatTeamName(team) {
  if (TEAM_NAME_PT[team]) return TEAM_NAME_PT[team];

  const positionMatch = team.match(/^([123])([A-L])$/);
  if (positionMatch) {
    const [, position, group] = positionMatch;
    const label = position === "1" ? "1º" : position === "2" ? "2º" : "3º";
    return `${label} do Grupo ${group}`;
  }

  const winnerMatch = team.match(/^W(\d+)$/);
  if (winnerMatch) return `Vencedor do Jogo ${winnerMatch[1]}`;

  const loserMatch = team.match(/^L(\d+)$/);
  if (loserMatch) return `Perdedor do Jogo ${loserMatch[1]}`;

  const thirdPlaceMatch = team.match(/^3([A-L]+)$/);
  if (thirdPlaceMatch) return `3º de um dos Grupos ${thirdPlaceMatch[1].split("").join(", ")}`;

  return team;
}

function formatRoundLabel(round) {
  if (round === "Todas") return "Todas";
  if (round === "R32") return "16 avos de final";
  if (round === "R16") return "Oitavas de final";
  return round;
}

function normalizeScore(value) {
  return Math.max(0, Math.min(20, Number.parseInt(value || 0, 10)));
}

function formatDate(value) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Sanitiza textos antes de injetar no HTML, reduzindo risco de marcação indesejada.
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function showAuthMessage(message) {
  els.authMessage.textContent = message;
}

// Mensagem temporária usada para confirmações, erros e feedback de ações.
function showToast(message) {
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), message.length > 80 ? 8000 : 2600);
}
