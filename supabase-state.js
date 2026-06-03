(function () {
  // Nomes das tabelas no Supabase. Centralizar evita repetir strings pelo código.
  const TABLES = {
    participants: "bolao_participants",
    guesses: "bolao_guesses",
    results: "bolao_results"
  };

  let lastError = null;

  // Lê as credenciais públicas definidas em supabase-config.js.
  function getConfig() {
    return window.BOLAO_SUPABASE_CONFIG || {};
  }

  function isConfigured() {
    return getConfigStatus().ok;
  }

  function getConfigStatus() {
    const config = getConfig();
    if (!window.supabase) {
      return { ok: false, message: "A biblioteca do Supabase não carregou. Verifique a conexão com a internet ou o script CDN." };
    }

    if (!config.url || config.url.includes("COLE_AQUI")) {
      return { ok: false, message: "A Project URL não foi configurada em supabase-config.js." };
    }

    if (!config.anonKey || config.anonKey.includes("COLE_AQUI")) {
      return { ok: false, message: "A chave pública do Supabase não foi configurada em supabase-config.js." };
    }

    if (!/^https:\/\/.+\.supabase\.co\/?$/.test(config.url)) {
      return { ok: false, message: "A Project URL parece inválida. Ela deve ser parecida com https://xxxx.supabase.co." };
    }

    return { ok: true, message: "Supabase configurado." };
  }

  // Cria um cliente Supabase único para reutilizar durante a sessão.
  function getClient() {
    if (!isConfigured()) return null;
    if (!window.__bolaoSupabaseClient) {
      const config = getConfig();
      window.__bolaoSupabaseClient = window.supabase.createClient(config.url, config.anonKey);
    }
    return window.__bolaoSupabaseClient;
  }

  function setLastError(error) {
    lastError = error || null;
    if (lastError) console.error("Bolão Supabase:", describeError(lastError), lastError);
  }

  function describeError(error) {
    if (!error) return "Erro desconhecido.";
    if (typeof error === "string") return error;
    return [
      error.message,
      error.details,
      error.hint,
      error.code ? `código: ${error.code}` : ""
    ].filter(Boolean).join(" | ");
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  // Converte linhas do banco para o formato usado pela aplicação.
  function mapParticipant(row) {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      status: row.status || "pending",
      accessCode: row.access_code || "",
      createdAt: row.created_at || ""
    };
  }

  function mapGuess(row) {
    return {
      participantId: row.participant_id,
      matchId: row.match_id,
      home: row.home_score,
      away: row.away_score
    };
  }

  function mapResult(row) {
    if (row.home_score === null || row.away_score === null) return null;

    return {
      matchId: row.match_id,
      home: row.home_score,
      away: row.away_score
    };
  }

  // Wrapper de segurança para padronizar erros das chamadas ao Supabase.
  async function run(operation) {
    const client = getClient();
    if (!client) throw new Error("Supabase não está configurado em supabase-config.js.");

    const response = await operation(client);
    if (response.error) {
      setLastError(response.error);
      throw response.error;
    }

    setLastError(null);
    return response.data;
  }

  // Carrega dados públicos necessários para ranking, jogos e palpites.
  async function loadPublicState() {
    const [participants, guesses, results] = await Promise.all([
      run((client) => client
        .from(TABLES.participants)
        .select("id,name,email,status,created_at")
        .eq("status", "approved")
        .order("name", { ascending: true })),
      run((client) => client
        .from(TABLES.guesses)
        .select("participant_id,match_id,home_score,away_score")),
      run((client) => client
        .from(TABLES.results)
        .select("match_id,home_score,away_score"))
    ]);

    return {
      participants: participants.map(mapParticipant),
      guesses: guesses.map(mapGuess),
      results: results.map(mapResult).filter(Boolean)
    };
  }

  // Lista todos os participantes para uso do painel administrativo.
  async function listParticipants() {
    const rows = await run((client) => client
      .from(TABLES.participants)
      .select("id,name,email,status,access_code,created_at")
      .order("created_at", { ascending: false }));

    return rows.map(mapParticipant);
  }

  // Cria cadastro pendente; se o e-mail já existe, retorna o cadastro existente.
  async function registerParticipant(name, email) {
    const normalizedEmail = normalizeEmail(email);
    const existing = await run((client) => client
      .from(TABLES.participants)
      .select("id,name,email,status,access_code,created_at")
      .eq("email", normalizedEmail)
      .maybeSingle());

    if (existing) return mapParticipant(existing);

    const row = await run((client) => client
      .from(TABLES.participants)
      .insert({
        name: String(name || "").trim(),
        email: normalizedEmail,
        status: "pending"
      })
      .select("id,name,email,status,access_code,created_at")
      .single());

    return mapParticipant(row);
  }

  // Login simples por e-mail e código gerado pelo administrador.
  async function loginParticipant(email, accessCode) {
    const row = await run((client) => client
      .from(TABLES.participants)
      .select("id,name,email,status,access_code,created_at")
      .eq("email", normalizeEmail(email))
      .eq("access_code", String(accessCode || "").trim().toUpperCase())
      .maybeSingle());

    return row ? mapParticipant(row) : null;
  }

  // Aprova participante e grava o código individual no banco.
  async function approveParticipant(participantId, accessCode) {
    const row = await run((client) => client
      .from(TABLES.participants)
      .update({
        status: "approved",
        access_code: accessCode,
        approved_at: new Date().toISOString()
      })
      .eq("id", participantId)
      .select("id,name,email,status,access_code,created_at")
      .single());

    return mapParticipant(row);
  }

  // Remove participante; os palpites são removidos por cascade no banco.
  async function removeParticipant(participantId) {
    await run((client) => client
      .from(TABLES.participants)
      .delete()
      .eq("id", participantId));
  }

  // Salva ou atualiza palpite usando upsert pela chave participante+jogo.
  async function saveGuess(participantId, matchId, home, away) {
    await run((client) => client
      .from(TABLES.guesses)
      .upsert({
        participant_id: participantId,
        match_id: matchId,
        home_score: Number(home),
        away_score: Number(away),
        updated_at: new Date().toISOString()
      }, { onConflict: "participant_id,match_id" }));
  }

  // Salva ou atualiza resultado oficial do jogo.
  async function saveResult(matchId, home, away) {
    const row = await run((client) => client
      .from(TABLES.results)
      .upsert({
        match_id: matchId,
        home_score: Number(home),
        away_score: Number(away),
        updated_at: new Date().toISOString()
      }, { onConflict: "match_id" })
      .select("match_id,home_score,away_score")
      .single());

    return mapResult(row);
  }

  // Zera resultado oficial usando null, para manter histórico do jogo sem pontuar.
  async function clearResult(matchId, adminCode) {
    const existing = await run((client) => client
      .from(TABLES.results)
      .select("match_id")
      .eq("match_id", matchId)
      .maybeSingle());

    if (!existing) return false;

    try {
      await run((client) => client
        .from(TABLES.results)
        .update({
          home_score: null,
          away_score: null,
          updated_at: new Date().toISOString()
        })
        .eq("match_id", matchId));
    } catch (error) {
      await run((client) => client.rpc("clear_bolao_result", {
        target_match_id: matchId,
        admin_code: String(adminCode || "").trim().toUpperCase()
      }));
    }

    const stillExists = await run((client) => client
      .from(TABLES.results)
      .select("match_id,home_score,away_score")
      .eq("match_id", matchId)
      .maybeSingle());

    if (stillExists && (stillExists.home_score !== null || stillExists.away_score !== null)) {
      await run((client) => client.rpc("clear_bolao_result", {
        target_match_id: matchId,
        admin_code: String(adminCode || "").trim().toUpperCase()
      }));

      const stillExistsAfterRpc = await run((client) => client
        .from(TABLES.results)
        .select("match_id,home_score,away_score")
        .eq("match_id", matchId)
        .maybeSingle());

      if (stillExistsAfterRpc && (stillExistsAfterRpc.home_score !== null || stillExistsAfterRpc.away_score !== null)) {
        throw new Error("O resultado não foi apagado no Supabase. Execute a função clear_bolao_result no SQL Editor.");
      }
    }

    return true;
  }

  // Teste simples para confirmar se o projeto Supabase responde.
  async function testConnection() {
    try {
      await run((client) => client.from(TABLES.participants).select("id").limit(1));
      return { ok: true, message: "Conexão com Supabase OK." };
    } catch (error) {
      return { ok: false, message: describeError(error), error };
    }
  }

  // API exposta globalmente para app.js e admin.js.
  window.BolaoSupabase = {
    isConfigured,
    getConfigStatus,
    describeError,
    getLastError: () => lastError,
    testConnection,
    loadPublicState,
    listParticipants,
    registerParticipant,
    loginParticipant,
    approveParticipant,
    removeParticipant,
    saveGuess,
    saveResult,
    clearResult
  };
})();
