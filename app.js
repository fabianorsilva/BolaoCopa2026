const STORAGE_KEY = "bolao-copa-2026-v2";
const ACCESS_CODE = "UNIDADE4";
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

const seedState = {
  currentParticipantId: "",
  participants: [],
  matches: structuredClone(WORLD_CUP_MATCHES),
  guesses: {}
};

const state = loadState();
const els = {};

document.addEventListener("DOMContentLoaded", async () => {
  bindElements();
  bindEvents();
  await hydrateSharedState();
  ensureStateShape();
  render();
});

async function hydrateSharedState() {
  if (!window.BolaoSupabase?.isConfigured()) return;

  try {
    const sharedState = await window.BolaoSupabase.loadSharedState(state, mergeMatches);
    Object.assign(state, sharedState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    const detail = window.BolaoSupabase.describeError(error);
    showToast(`Falha ao carregar Supabase: ${detail}`);
  }
}

function bindElements() {
  Object.assign(els, {
    authPanel: document.querySelector("#authPanel"),
    authForm: document.querySelector("#authForm"),
    signupName: document.querySelector("#signupName"),
    signupEmail: document.querySelector("#signupEmail"),
    signupCode: document.querySelector("#signupCode"),
    dashboard: document.querySelector("#dashboard"),
    topActions: document.querySelector("#topActions"),
    currentUserChip: document.querySelector("#currentUserChip"),
    logoutButton: document.querySelector("#logoutButton"),
    leaderboard: document.querySelector("#leaderboard"),
    totalParticipants: document.querySelector("#totalParticipants"),
    closedMatches: document.querySelector("#closedMatches"),
    averageScore: document.querySelector("#averageScore"),
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
    participantForm: document.querySelector("#participantForm"),
    participantName: document.querySelector("#participantName"),
    exportButton: document.querySelector("#exportButton"),
    resetButton: document.querySelector("#resetButton"),
    template: document.querySelector("#matchGuessTemplate")
  });
}

function bindEvents() {
  document.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.tab));
  });

  els.authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    registerParticipant(els.signupName.value.trim(), els.signupEmail.value.trim(), els.signupCode.value.trim());
  });

  els.logoutButton.addEventListener("click", () => {
    state.currentParticipantId = "";
    saveState();
    render();
    els.signupName.focus();
  });

  els.playerSelect.addEventListener("change", () => {
    state.currentParticipantId = els.playerSelect.value;
    saveState();
    render();
  });

  els.roundFilter.addEventListener("change", renderGuesses);
  els.matchDaySelect.addEventListener("change", renderDailyMatches);
  els.groupSelect.addEventListener("change", renderGroupTeams);
  els.exportButton.addEventListener("click", exportData);
  els.resetButton.addEventListener("click", resetData);

  els.participantForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addParticipant(els.participantName.value.trim());
  });
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(seedState);

  try {
    const parsed = JSON.parse(saved);
    return {
      currentParticipantId: parsed.currentParticipantId || "",
      participants: normalizeParticipants(parsed.participants),
      matches: mergeMatches(parsed.matches),
      guesses: parsed.guesses || {}
    };
  } catch {
    return structuredClone(seedState);
  }
}

function normalizeParticipants(participants = []) {
  if (!Array.isArray(participants)) return [];
  return participants.map((participant) => ({
    id: participant.id,
    name: participant.name,
    email: participant.email || ""
  }));
}

function mergeMatches(savedMatches = []) {
  const savedById = new Map(savedMatches.map((match) => [match.id, match]));
  return WORLD_CUP_MATCHES.map((match) => ({
    ...match,
    result: savedById.get(match.id)?.result || null
  }));
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (window.BolaoSupabase?.isConfigured()) {
    window.BolaoSupabase.saveSharedState(state).catch((error) => {
      const detail = window.BolaoSupabase.describeError(error);
      showToast(`Nao foi possivel sincronizar: ${detail}`);
    });
  }
}

function ensureStateShape() {
  state.matches = mergeMatches(state.matches);
  state.participants.forEach((participant) => ensureGuessesForParticipant(participant.id));
  if (!state.participants.some((participant) => participant.id === state.currentParticipantId)) {
    state.currentParticipantId = "";
  }
  saveState();
}

function ensureGuessesForParticipant(participantId) {
  state.guesses[participantId] ||= {};
  state.matches.forEach((match) => {
    state.guesses[participantId][match.id] ||= { home: "", away: "" };
  });
}

function registerParticipant(name, email, code) {
  if (!name) {
    showToast("Informe seu nome.");
    return;
  }

  if (!isValidEmail(email)) {
    showToast("Informe um e-mail valido.");
    return;
  }

  if (code.toUpperCase() !== ACCESS_CODE) {
    showToast("Codigo do grupo incorreto.");
    return;
  }

  const participant = addParticipant(name, { email, silent: true });
  state.currentParticipantId = participant.id;
  els.signupName.value = "";
  els.signupEmail.value = "";
  els.signupCode.value = "";
  saveState();
  render();
}

function activateTab(tabName) {
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === tabName));
  document.querySelectorAll(".tab-page").forEach((page) => page.classList.toggle("active", page.id === `tab-${tabName}`));
}

function render() {
  const hasCurrentParticipant = Boolean(getCurrentParticipant());
  els.authPanel.classList.toggle("hidden", hasCurrentParticipant);
  els.dashboard.classList.toggle("hidden", !hasCurrentParticipant);
  els.topActions.classList.toggle("hidden", !hasCurrentParticipant);
  els.currentUserChip.textContent = getCurrentParticipant()?.name || "Sem cadastro";

  renderSelectors();
  renderLeaderboard();
  renderDailyMatches();
  renderGroupTeams();
  renderStats();
  renderMyScore();
  renderGuesses();
  renderResults();
  renderParticipants();
}

function renderSelectors() {
  const currentPlayer = state.currentParticipantId || "";
  const currentParticipant = getCurrentParticipant();
  els.playerSelect.innerHTML = currentParticipant
    ? `<option value="${currentParticipant.id}">${escapeHtml(currentParticipant.name)}</option>`
    : `<option value="">Cadastre alguem</option>`;
  els.playerSelect.value = currentPlayer;
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

function renderLeaderboard() {
  const ranking = getRanking();
  els.leaderboard.innerHTML = ranking.length
    ? ranking.map((row, index) => `
      <li>
        <span class="rank">${index + 1}</span>
        <div>
          <strong>${escapeHtml(row.name)}</strong>
          <br />
          <small>${row.exact} placares exatos - ${row.trend} tendencias corretas</small>
        </div>
        <span class="points">${row.points} pts</span>
      </li>
    `).join("")
    : `<li class="empty-state">Nenhum participante cadastrado.</li>`;

}

function renderDailyMatches() {
  const selectedDay = els.matchDaySelect.value || getDefaultMatchDay(getMatchDays());
  const matches = state.matches.filter((match) => match.date === selectedDay);
  const participantId = state.currentParticipantId;

  els.dailyMatchList.innerHTML = matches.map((match) => {
    const guess = state.guesses[participantId]?.[match.id] || { home: "", away: "" };
    const feedback = getGuessFeedback(guess, match.result);
    return `
      <article class="daily-match" data-daily-match="${match.id}">
        <div class="daily-match-teams">
          ${teamMarkup(match.home)}
          <strong>${isCompleteScore(match.result) ? `${match.result.home} x ${match.result.away}` : `${match.time} ET`}</strong>
          ${teamMarkup(match.away)}
        </div>
        <div class="daily-guess-row">
          <span>Seu palpite</span>
          <div class="score-inputs">
            <input class="daily-home-score" type="number" min="0" max="20" inputmode="numeric" value="${guess.home}" aria-label="Seu palpite para ${escapeHtml(formatTeamName(match.home))}" />
            <span>x</span>
            <input class="daily-away-score" type="number" min="0" max="20" inputmode="numeric" value="${guess.away}" aria-label="Seu palpite para ${escapeHtml(formatTeamName(match.away))}" />
          </div>
          <button class="secondary-button save-daily-guess" type="button">Salvar</button>
        </div>
        ${feedback ? `<div class="guess-feedback ${feedback.className}">${feedback.label}</div>` : ""}
        <small>Jogo ${match.number} - ${formatRoundLabel(match.round)} - ${escapeHtml(match.city)}</small>
      </article>
    `;
  }).join("");

  els.dailyMatchList.querySelectorAll("[data-daily-match]").forEach((card) => {
    const saveButton = card.querySelector(".save-daily-guess");
    saveButton.addEventListener("click", () => {
      saveDailyGuess(
        participantId,
        card.dataset.dailyMatch,
        card.querySelector(".daily-home-score").value,
        card.querySelector(".daily-away-score").value,
        saveButton
      );
    });
  });
}

function saveDailyGuess(participantId, matchId, home, away, button) {
  if (!participantId) {
    showToast("Entre no bolao para salvar seu palpite.");
    return;
  }

  if (home === "" || away === "") {
    showToast("Preencha os dois placares antes de salvar.");
    return;
  }

  state.guesses[participantId] ||= {};
  state.guesses[participantId][matchId] = {
    home: normalizeScore(home),
    away: normalizeScore(away)
  };
  saveState();
  renderLeaderboard();
  renderDailyMatches();
  renderStats();
  renderMyScore();
  renderGuesses();
  renderParticipants();
  markButtonSaved(button);
  showToast("Palpite salvo.");
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

function renderGroupTeams() {
  const groupId = els.groupSelect.value || "A";
  const group = getGroups().find((item) => item.id === groupId);

  if (!group) {
    els.groupTeamList.innerHTML = `<article class="empty-state">Nenhum grupo encontrado.</article>`;
    return;
  }

  const standings = getGroupStandings(group);
  els.groupTeamList.innerHTML = `
    <div class="standings-table" role="table" aria-label="Classificacao do ${group.name}">
      <div class="standings-row standings-head" role="row">
        <span>#</span>
        <span>Selecao</span>
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

function renderMyScore() {
  const participant = getCurrentParticipant();
  if (!participant) return;

  const total = getParticipantPoints(participant.id);
  const settledMatches = state.matches.filter((match) => isCompleteScore(match.result));
  const exact = settledMatches.filter((match) => scoreGuess(state.guesses[participant.id]?.[match.id], match.result) === 5).length;
  const trend = settledMatches.filter((match) => scoreGuess(state.guesses[participant.id]?.[match.id], match.result) === 2).length;

  els.myScoreTitle.textContent = participant.name;
  els.myScoreTotal.textContent = `${total} pts`;
  els.myScoreBreakdown.innerHTML = `
    <div class="score-summary">
      <article><strong>${total}</strong><small>pontos totais</small></article>
      <article><strong>${exact}</strong><small>placares exatos</small></article>
      <article><strong>${trend}</strong><small>tendencias corretas</small></article>
      <article><strong>${settledMatches.length}</strong><small>jogos pontuados</small></article>
    </div>
    <div class="score-list">
      ${state.matches.map((match) => renderScoreRow(match, participant.id)).join("")}
    </div>
  `;
}

function renderScoreRow(match, participantId) {
  const guess = state.guesses[participantId]?.[match.id] || { home: "", away: "" };
  const points = scoreGuess(guess, match.result);
  const resultText = isCompleteScore(match.result) ? `${match.result.home} x ${match.result.away}` : "pendente";
  const guessText = isCompleteScore(guess) ? `${guess.home} x ${guess.away}` : "sem palpite";
  const status = isCompleteScore(match.result) ? `${points} pts` : "aguardando";
  const feedback = getGuessFeedback(guess, match.result);

  return `
    <article class="score-row">
      <div class="score-row-teams">
        ${teamMarkup(match.home)}
        <span>x</span>
        ${teamMarkup(match.away)}
      </div>
      <div class="score-row-detail">
        <span>Palpite: ${guessText}</span>
        <span>Resultado: ${resultText}</span>
        ${feedback ? `<span class="${feedback.className}">${feedback.label}</span>` : ""}
      </div>
      <strong>${status}</strong>
    </article>
  `;
}

function renderStats() {
  if (!els.totalParticipants || !els.closedMatches || !els.averageScore) return;

  const ranking = getRanking();
  const closed = state.matches.filter((match) => isCompleteScore(match.result)).length;
  const average = ranking.length
    ? Math.round(ranking.reduce((sum, row) => sum + row.points, 0) / ranking.length)
    : 0;

  els.totalParticipants.textContent = state.participants.length;
  els.closedMatches.textContent = closed;
  els.averageScore.textContent = average;
}

function renderGuesses() {
  const participantId = els.playerSelect.value || state.currentParticipantId;
  const round = els.roundFilter.value;
  const matches = state.matches.filter((match) => round === "Todas" || match.round === round);

  els.guessList.innerHTML = "";
  if (!participantId) {
    els.guessList.innerHTML = `<article class="match-card empty-state">Cadastre um participante para preencher palpites.</article>`;
    return;
  }

  let currentGroup = "";
  matches.forEach((match) => {
    const group = `${formatRoundLabel(match.round)} - ${formatDate(match.date)}`;
    if (group !== currentGroup) {
      currentGroup = group;
      els.guessList.insertAdjacentHTML("beforeend", `<h3 class="match-group-title">${group}</h3>`);
    }

    const guess = state.guesses[participantId]?.[match.id] || { home: "", away: "" };
    const card = createMatchCard(match, guess, "guess");
    const [homeInput, awayInput] = card.querySelectorAll("input");

    homeInput.addEventListener("change", () => updateGuess(participantId, match.id, "home", homeInput.value));
    awayInput.addEventListener("change", () => updateGuess(participantId, match.id, "away", awayInput.value));
    els.guessList.append(card);
  });
}

function renderResults() {
  els.resultList.innerHTML = "";
  state.matches.forEach((match) => {
    const score = match.result || { home: "", away: "" };
    const card = createMatchCard(match, score, "result");
    const [homeInput, awayInput] = card.querySelectorAll("input");

    homeInput.addEventListener("change", () => updateResult(match.id, "home", homeInput.value));
    awayInput.addEventListener("change", () => updateResult(match.id, "away", awayInput.value));
    els.resultList.append(card);
  });
}

function renderParticipants() {
  els.participantGrid.innerHTML = state.participants.length
    ? state.participants.map((participant) => `
      <article class="participant-card">
        <div>
          <strong>${escapeHtml(participant.name)}</strong>
          <br />
          <small>${getParticipantPoints(participant.id)} pts</small>
        </div>
        <button type="button" data-remove="${participant.id}" aria-label="Remover ${escapeHtml(participant.name)}">x</button>
      </article>
    `).join("")
    : `<article class="participant-card empty-state">O grupo ainda nao tem participantes.</article>`;

  els.participantGrid.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => removeParticipant(button.dataset.remove));
  });
}

function createMatchCard(match, score, mode) {
  const card = els.template.content.firstElementChild.cloneNode(true);
  card.querySelector(".pill").textContent = formatRoundLabel(match.round);
  card.querySelector("small").textContent = `Jogo ${match.number} - ${formatDate(match.date)} - ${match.time} ET`;
  card.querySelector(".home-team").innerHTML = teamMarkup(match.home);
  card.querySelector(".away-team").innerHTML = teamMarkup(match.away);

  const homeInput = card.querySelector(".home-score");
  const awayInput = card.querySelector(".away-score");
  homeInput.value = score.home;
  awayInput.value = score.away;

  if (mode === "result") {
    homeInput.disabled = false;
    awayInput.disabled = false;
  }

  const footer = card.querySelector(".match-footer");
  if (mode === "guess") {
    const feedback = getGuessFeedback(score, match.result);
    footer.innerHTML = isCompleteScore(match.result)
      ? `<span>Resultado: ${match.result.home} x ${match.result.away}</span><strong class="${feedback?.className || ""}">${feedback?.label || `${scoreGuess(score, match.result)} pts`}</strong>`
      : `<span>${escapeHtml(match.city)} - ${escapeHtml(match.venue)}</span><strong>${isCompleteScore(score) ? "palpite salvo" : "preencha o placar"}</strong>`;
  } else {
    footer.textContent = isCompleteScore(match.result)
      ? `${match.city} - resultado registrado`
      : `${match.city} - ${match.venue}`;
  }

  return card;
}

function updateGuess(participantId, matchId, side, value) {
  if (!participantId) return;
  state.guesses[participantId] ||= {};
  state.guesses[participantId][matchId] ||= { home: "", away: "" };
  state.guesses[participantId][matchId][side] = value === "" ? "" : normalizeScore(value);
  saveState();
  renderLeaderboard();
  renderDailyMatches();
  renderStats();
  renderMyScore();
  renderGuesses();
  renderParticipants();
}

function updateResult(matchId, side, value) {
  const match = state.matches.find((item) => item.id === matchId);
  if (!match) return;
  match.result ||= { home: "", away: "" };
  match.result[side] = value === "" ? "" : normalizeScore(value);
  if (match.result.home === "" && match.result.away === "") match.result = null;
  saveState();
  render();
}

function addParticipant(name, options = {}) {
  if (!name) return null;
  const email = (options.email || "").trim().toLowerCase();
  const id = email ? slugify(email) : slugify(name);
  const existing = state.participants.find((participant) => participant.id === id || (email && participant.email === email));
  if (existing) {
    existing.name = name || existing.name;
    existing.email = email || existing.email || "";
    if (!options.silent) showToast("Esse participante ja existe.");
    ensureGuessesForParticipant(existing.id);
    return existing;
  }

  const participant = { id, name, email };
  state.participants.push(participant);
  ensureGuessesForParticipant(id);
  els.participantName.value = "";
  saveState();
  if (!options.silent) render();
  return participant;
}

function removeParticipant(id) {
  state.participants = state.participants.filter((participant) => participant.id !== id);
  delete state.guesses[id];
  if (state.currentParticipantId === id) state.currentParticipantId = "";
  saveState();
  render();
}

function resetData() {
  localStorage.removeItem(STORAGE_KEY);
  Object.assign(state, structuredClone(seedState));
  ensureStateShape();
  render();
}

function exportData() {
  const payload = JSON.stringify(state, null, 2);
  navigator.clipboard?.writeText(payload);
  showToast("Dados do bolao copiados em JSON.");
}

function getCurrentParticipant() {
  return state.participants.find((participant) => participant.id === state.currentParticipantId);
}

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

function getParticipantPoints(participantId) {
  return state.matches.reduce((total, match) => {
    if (!isCompleteScore(match.result)) return total;
    return total + scoreGuess(state.guesses[participantId]?.[match.id], match.result);
  }, 0);
}

function scoreGuess(guess, result) {
  if (!isCompleteScore(guess) || !isCompleteScore(result)) return 0;
  if (Number(guess.home) === Number(result.home) && Number(guess.away) === Number(result.away)) return 5;
  if (getOutcome(guess) === getOutcome(result)) return 2;
  return 0;
}

function getGuessFeedback(guess, result) {
  if (!isCompleteScore(result)) return null;
  if (!isCompleteScore(guess)) {
    return { label: "Sem palpite", className: "feedback-missed" };
  }

  const points = scoreGuess(guess, result);
  if (points === 5) return { label: "Placar correto +5 pts", className: "feedback-exact" };
  if (points === 2) return { label: "Tendencia correta +2 pts", className: "feedback-trend" };
  return { label: "Palpite errado", className: "feedback-wrong" };
}

function isCompleteScore(score) {
  return score && score.home !== "" && score.away !== "" && score.home !== null && score.away !== null;
}

function getOutcome(score) {
  if (Number(score.home) > Number(score.away)) return "home";
  if (Number(score.home) < Number(score.away)) return "away";
  return "draw";
}

function getPopularPrediction(matchId) {
  const counts = new Map();
  state.participants.forEach((participant) => {
    const guess = state.guesses[participant.id]?.[matchId];
    if (!isCompleteScore(guess)) return;
    const key = `${guess.home}-${guess.away}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const [best] = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (!best) return { home: "-", away: "-" };
  const [home, away] = best[0].split("-").map((value) => value.trim());
  return { home, away };
}

function getMatchDays() {
  return [...new Set(state.matches.map((match) => match.date))].sort();
}

function getDefaultMatchDay(matchDays) {
  const today = new Date().toISOString().slice(0, 10);
  return matchDays.find((day) => day >= today) || matchDays[0];
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
    .map((team) => ({
      ...team,
      goalDifference: team.goalsFor - team.goalsAgainst
    }))
    .sort((a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      formatTeamName(a.name).localeCompare(formatTeamName(b.name))
    );
}

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

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(message) {
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), message.length > 80 ? 8000 : 2600);
}
