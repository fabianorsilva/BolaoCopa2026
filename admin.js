const STORAGE_KEY = "bolao-copa-2026-v2";
const ADMIN_CODE = "ADMIN2026";

const TEAM_NAME_PT = {
  "Algeria": "Argelia",
  "Argentina": "Argentina",
  "Australia": "Australia",
  "Austria": "Austria",
  "Belgium": "Belgica",
  "Bosnia & Herzegovina": "Bosnia e Herzegovina",
  "Brazil": "Brasil",
  "Canada": "Canada",
  "Cape Verde": "Cabo Verde",
  "Colombia": "Colombia",
  "Croatia": "Croacia",
  "Curacao": "Curacao",
  "Czechia": "Tchequia",
  "DR Congo": "RD Congo",
  "Ecuador": "Equador",
  "Egypt": "Egito",
  "England": "Inglaterra",
  "France": "Franca",
  "Germany": "Alemanha",
  "Ghana": "Gana",
  "Haiti": "Haiti",
  "Iran": "Ira",
  "Iraq": "Iraque",
  "Ivory Coast": "Costa do Marfim",
  "Japan": "Japao",
  "Jordan": "Jordania",
  "Mexico": "Mexico",
  "Morocco": "Marrocos",
  "Netherlands": "Paises Baixos",
  "New Zealand": "Nova Zelandia",
  "Norway": "Noruega",
  "Panama": "Panama",
  "Paraguay": "Paraguai",
  "Portugal": "Portugal",
  "Qatar": "Catar",
  "Saudi Arabia": "Arabia Saudita",
  "Scotland": "Escocia",
  "Senegal": "Senegal",
  "South Africa": "Africa do Sul",
  "South Korea": "Coreia do Sul",
  "Spain": "Espanha",
  "Sweden": "Suecia",
  "Switzerland": "Suica",
  "Tunisia": "Tunisia",
  "Turkiye": "Turquia",
  "United States": "Estados Unidos",
  "Uruguay": "Uruguai",
  "Uzbekistan": "Uzbequistao"
};

const state = loadState();
const els = {};

document.addEventListener("DOMContentLoaded", () => {
  Object.assign(els, {
    adminLoginForm: document.querySelector("#adminLoginForm"),
    adminCode: document.querySelector("#adminCode"),
    adminPanel: document.querySelector("#adminPanel"),
    adminDaySelect: document.querySelector("#adminDaySelect"),
    adminRoundSelect: document.querySelector("#adminRoundSelect"),
    adminResultList: document.querySelector("#adminResultList")
  });

  els.adminLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    unlockAdmin();
  });
  els.adminDaySelect.addEventListener("change", renderAdminResults);
  els.adminRoundSelect.addEventListener("change", renderAdminResults);
});

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return { currentParticipantId: "", participants: [], matches: structuredClone(WORLD_CUP_MATCHES), guesses: {} };
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      currentParticipantId: parsed.currentParticipantId || "",
      participants: Array.isArray(parsed.participants) ? parsed.participants : [],
      matches: mergeMatches(parsed.matches),
      guesses: parsed.guesses || {}
    };
  } catch {
    return { currentParticipantId: "", participants: [], matches: structuredClone(WORLD_CUP_MATCHES), guesses: {} };
  }
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
}

function unlockAdmin() {
  if (els.adminCode.value.trim().toUpperCase() !== ADMIN_CODE) {
    showToast("Codigo de administrador incorreto.");
    return;
  }

  els.adminLoginForm.classList.add("hidden");
  els.adminPanel.classList.remove("hidden");
  populateSelectors();
  renderAdminResults();
  showToast("Area de resultados liberada.");
}

function populateSelectors() {
  const days = [...new Set(state.matches.map((match) => match.date))].sort();
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
    (!day || match.date === day) &&
    (round === "Todas" || match.round === round)
  );

  els.adminResultList.innerHTML = matches.map((match) => {
    const result = match.result || { home: "", away: "" };
    return `
      <article class="admin-result-card" data-admin-match="${match.id}">
        <div class="admin-result-teams">
          <strong>${formatTeamName(match.home)}</strong>
          <div class="score-inputs">
            <input class="admin-home-score" type="number" min="0" max="20" inputmode="numeric" value="${result.home}" />
            <span>x</span>
            <input class="admin-away-score" type="number" min="0" max="20" inputmode="numeric" value="${result.away}" />
          </div>
          <strong>${formatTeamName(match.away)}</strong>
        </div>
        <div class="admin-result-footer">
          <small>Jogo ${match.number} - ${formatDate(match.date)} - ${formatRoundLabel(match.round)}</small>
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

function saveAdminResult(matchId, home, away, button) {
  if (home === "" || away === "") {
    showToast("Preencha os dois placares do resultado.");
    return;
  }

  const match = state.matches.find((item) => item.id === matchId);
  if (!match) return;

  match.result = { home: normalizeScore(home), away: normalizeScore(away) };
  saveState();
  markButtonSaved(button);
  showToast("Resultado salvo. A pagina do bolao ja pode ser atualizada.");
}

function markButtonSaved(button) {
  const originalText = button.textContent;
  button.textContent = "Resultado salvo";
  button.classList.add("is-saved");
  window.setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove("is-saved");
  }, 2200);
}

function normalizeScore(value) {
  return Math.max(0, Math.min(20, Number.parseInt(value || 0, 10)));
}

function formatDate(value) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function formatRoundLabel(round) {
  if (round === "Todas") return "Todas";
  if (round === "R32") return "16 avos de final";
  if (round === "R16") return "Oitavas de final";
  return round;
}

function formatTeamName(team) {
  if (TEAM_NAME_PT[team]) return TEAM_NAME_PT[team];
  const winnerMatch = team.match(/^W(\d+)$/);
  if (winnerMatch) return `Vencedor do Jogo ${winnerMatch[1]}`;
  const loserMatch = team.match(/^L(\d+)$/);
  if (loserMatch) return `Perdedor do Jogo ${loserMatch[1]}`;
  return team;
}

function showToast(message) {
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 2600);
}
