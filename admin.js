const ADMIN_CODE = "ADMIN2026";
const EASTERN_DAYLIGHT_UTC_OFFSET_HOURS = -4;
const BRASILIA_UTC_OFFSET_HOURS = -3;

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

const state = {
  participants: [],
  matches: cloneData(WORLD_CUP_MATCHES),
  guesses: {}
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  Object.assign(els, {
    adminLoginForm: document.querySelector("#adminLoginForm"),
    adminCode: document.querySelector("#adminCode"),
    adminPanel: document.querySelector("#adminPanel"),
    adminParticipantTotal: document.querySelector("#adminParticipantTotal"),
    adminPendingTotal: document.querySelector("#adminPendingTotal"),
    adminParticipantList: document.querySelector("#adminParticipantList"),
    adminDaySelect: document.querySelector("#adminDaySelect"),
    adminRoundSelect: document.querySelector("#adminRoundSelect"),
    adminResultList: document.querySelector("#adminResultList"),
    adminSyncStatus: document.querySelector("#adminSyncStatus")
  });

  els.adminLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await unlockAdmin();
  });
  els.adminDaySelect.addEventListener("change", renderAdminResults);
  els.adminRoundSelect.addEventListener("change", renderAdminResults);
});

async function unlockAdmin() {
  if (els.adminCode.value.trim().toUpperCase() !== ADMIN_CODE) {
    showToast("Código de administrador incorreto.");
    return;
  }

  if (!window.BolaoSupabase?.isConfigured()) {
    const status = window.BolaoSupabase?.getConfigStatus?.();
    showToast(status?.message || "O arquivo supabase-state.js não carregou corretamente.");
    return;
  }

  els.adminLoginForm.classList.add("hidden");
  els.adminPanel.classList.remove("hidden");
  populateSelectors();
  await refreshAdminState();
  renderAdminResults();
  showToast("Área administrativa liberada.");
}

async function refreshAdminState() {
  try {
    const [participants, publicState] = await Promise.all([
      window.BolaoSupabase.listParticipants(),
      window.BolaoSupabase.loadPublicState()
    ]);

    state.participants = participants;
    state.guesses = buildGuessMap(publicState.guesses || []);
    state.matches = mergeResults(publicState.results || []);
    renderParticipants();
    renderAdminResults();
    setAdminStatus("Sincronizado com o Supabase.");
  } catch (error) {
    setAdminStatus(`Falha no Supabase: ${window.BolaoSupabase.describeError(error)}`);
  }
}

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

function renderParticipants() {
  const pending = state.participants.filter((participant) => participant.status !== "approved");
  const approved = state.participants.filter((participant) => participant.status === "approved");
  const ordered = [...pending, ...approved].sort((a, b) => {
    if (a.status !== b.status) return a.status === "pending" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  els.adminParticipantTotal.textContent = approved.length;
  els.adminPendingTotal.textContent = pending.length;
  els.adminParticipantList.innerHTML = ordered.length
    ? ordered.map((participant) => participantCardMarkup(participant)).join("")
    : `<article class="admin-participant-card empty-state">Nenhum cadastro recebido ainda.</article>`;

  els.adminParticipantList.querySelectorAll("[data-approve]").forEach((button) => {
    button.addEventListener("click", () => approveParticipant(button.dataset.approve));
  });

  els.adminParticipantList.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", () => copyAccessCode(button.dataset.copy));
  });

  els.adminParticipantList.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => removeParticipant(button.dataset.remove));
  });
}

function participantCardMarkup(participant) {
  const summary = getParticipantSummary(participant);
  const statusLabel = participant.status === "approved" ? "Aprovado" : "Pendente";
  const code = participant.accessCode || "";

  return `
    <article class="admin-participant-card">
      <div>
        <strong>${escapeHtml(participant.name)}</strong>
        <small>${escapeHtml(participant.email || "sem e-mail")}</small>
      </div>
      <div class="admin-participant-stats">
        <span>${statusLabel}</span>
        <span>${summary.points} pts</span>
        <span>${summary.filledGuesses}/${state.matches.length} palpites</span>
        ${code ? `<span>Código: ${escapeHtml(code)}</span>` : ""}
      </div>
      <div class="admin-actions">
        ${participant.status === "approved"
          ? `<button class="secondary-button" type="button" data-copy="${escapeHtml(code)}">Copiar código</button>`
          : `<button class="primary-button" type="button" data-approve="${participant.id}">Aprovar e gerar código</button>`}
        <button class="secondary-button danger-button" type="button" data-remove="${participant.id}">Remover</button>
      </div>
    </article>
  `;
}

async function approveParticipant(participantId) {
  const code = generateAccessCode();

  try {
    const participant = await window.BolaoSupabase.approveParticipant(participantId, code);
    await navigator.clipboard?.writeText(code);
    await refreshAdminState();
    showToast(`Cadastro aprovado. Código de ${participant.name}: ${code}`);
  } catch (error) {
    showToast(`Não foi possível aprovar: ${window.BolaoSupabase.describeError(error)}`);
  }
}

async function copyAccessCode(code) {
  await navigator.clipboard?.writeText(code);
  showToast("Código copiado.");
}

async function removeParticipant(participantId) {
  if (!confirm("Remover este participante e seus palpites?")) return;

  try {
    await window.BolaoSupabase.removeParticipant(participantId);
    await refreshAdminState();
    showToast("Participante removido.");
  } catch (error) {
    showToast(`Não foi possível remover: ${window.BolaoSupabase.describeError(error)}`);
  }
}

function populateSelectors() {
  const days = [...new Set(state.matches.map((match) => getMatchDateBR(match)))].sort();
  els.adminDaySelect.innerHTML = days.map((day) => `<option value="${day}">${formatDate(day)}</option>`).join("");
  els.adminDaySelect.value = days[0];

  const rounds = ["Todas", ...new Set(state.matches.map((match) => match.round))];
  els.adminRoundSelect.innerHTML = rounds.map((round) => `<option value="${round}">${formatRoundLabel(round)}</option>`).join("");
  els.adminRoundSelect.value = "Todas";
}

function renderAdminResults() {
  const day = els.adminDaySelect.value;
  const round = els.adminRoundSelect.value || "Todas";
  const matches = state.matches.filter((match) =>
    (!day || getMatchDateBR(match) === day) &&
    (round === "Todas" || match.round === round)
  );

  els.adminResultList.innerHTML = matches.map((match) => {
    const result = match.result || { home: "", away: "" };
    return `
      <article class="admin-result-card" data-admin-match="${match.id}">
        <div class="admin-result-teams">
          <strong>${formatTeamName(match.home)}</strong>
          <div class="score-inputs">
            <input class="admin-home-score" type="number" min="0" max="20" inputmode="numeric" value="${result.home}" aria-label="Gols de ${escapeHtml(formatTeamName(match.home))}" />
            <span>x</span>
            <input class="admin-away-score" type="number" min="0" max="20" inputmode="numeric" value="${result.away}" aria-label="Gols de ${escapeHtml(formatTeamName(match.away))}" />
          </div>
          <strong>${formatTeamName(match.away)}</strong>
        </div>
        <div class="admin-result-footer">
          <small>Jogo ${match.number} - ${formatDate(getMatchDateBR(match))} - ${formatMatchTimeBR(match)} BRT - ${formatRoundLabel(match.round)}</small>
          <button class="secondary-button save-admin-result" type="button">Salvar resultado</button>
        </div>
      </article>
    `;
  }).join("");

  els.adminResultList.querySelectorAll("[data-admin-match]").forEach((card) => {
    const button = card.querySelector(".save-admin-result");
    button.addEventListener("click", () => saveAdminResult(
      card.dataset.adminMatch,
      card.querySelector(".admin-home-score").value,
      card.querySelector(".admin-away-score").value,
      button
    ));
  });
}

async function saveAdminResult(matchId, home, away, button) {
  if (home === "" || away === "") {
    showToast("Preencha os dois placares do resultado.");
    return;
  }

  try {
    button.disabled = true;
    button.textContent = "Salvando...";
    const savedResult = await window.BolaoSupabase.saveResult(matchId, normalizeScore(home), normalizeScore(away));
    const match = state.matches.find((item) => item.id === matchId);
    if (match) match.result = { home: savedResult.home, away: savedResult.away };
    renderParticipants();
    markButtonSaved(button);
    setAdminStatus(`Resultado do jogo ${match?.number || matchId} salvo no Supabase: ${savedResult.home} x ${savedResult.away}.`);
    showToast("Resultado salvo no Supabase.");
  } catch (error) {
    button.disabled = false;
    button.textContent = "Salvar resultado";
    setAdminStatus(`Falha ao salvar resultado: ${window.BolaoSupabase.describeError(error)}`);
    showToast(`Não foi possível salvar o resultado: ${window.BolaoSupabase.describeError(error)}`);
  }
}

function getParticipantSummary(participant) {
  const guesses = state.guesses[participant.id] || {};
  const filledGuesses = state.matches.filter((match) => isCompleteScore(guesses[match.id])).length;
  return {
    points: getParticipantPoints(participant.id),
    filledGuesses
  };
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

function isCompleteScore(score) {
  return score && score.home !== "" && score.away !== "" && score.home !== null && score.away !== null && score.home !== undefined && score.away !== undefined;
}

function getOutcome(score) {
  if (Number(score.home) > Number(score.away)) return "home";
  if (Number(score.home) < Number(score.away)) return "away";
  return "draw";
}

function markButtonSaved(button) {
  const originalText = button.textContent;
  button.textContent = "Resultado salvo";
  button.classList.add("is-saved");
  window.setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove("is-saved");
    button.disabled = false;
  }, 2200);
}

function generateAccessCode() {
  return `COPA-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function normalizeScore(value) {
  return Math.max(0, Math.min(20, Number.parseInt(value || 0, 10)));
}

function formatDate(value) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function getMatchStartDate(match) {
  const [year, month, day] = match.date.split("-").map(Number);
  const [hour, minute] = match.time.split(":").map(Number);
  const utcHour = hour - EASTERN_DAYLIGHT_UTC_OFFSET_HOURS;
  return new Date(Date.UTC(year, month - 1, day, utcHour, minute));
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

function formatRoundLabel(round) {
  if (round === "Todas") return "Todas";
  if (round === "R32") return "16 avos de final";
  if (round === "R16") return "Oitavas de final";
  return round;
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

function setAdminStatus(message) {
  els.adminSyncStatus.textContent = message;
}

function showToast(message) {
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), message.length > 80 ? 8000 : 2600);
}

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
