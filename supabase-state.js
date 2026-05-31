(function () {
  const STATE_ID = "main";
  const TABLE_NAME = "bolao_state";
  let lastError = null;

  function getConfig() {
    return window.BOLAO_SUPABASE_CONFIG || {};
  }

  function isConfigured() {
    const config = getConfig();
    return Boolean(
      window.supabase &&
      config.url &&
      config.anonKey &&
      !config.url.includes("https://zmnwjzzefwmvtflpfkoi.supabase.co") &&
      !config.anonKey.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptbndqenplZndtdnRmbHBma29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNDAxMjUsImV4cCI6MjA5NTYxNjEyNX0.TYSQOQycJTRj5YBy16ywidSsl5tUQ0Q4gbX2DxrIrqw")
    );
  }

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
    if (lastError) console.error("Bolao Supabase:", describeError(lastError), lastError);
  }

  function sharedOnly(state) {
    return {
      participants: state.participants || [],
      matches: state.matches || [],
      guesses: state.guesses || {}
    };
  }

  async function loadSharedState(localState, mergeMatches) {
    const client = getClient();
    if (!client) return localState;

    const { data, error } = await client
      .from(TABLE_NAME)
      .select("data")
      .eq("id", STATE_ID)
      .maybeSingle();

    if (error) {
      setLastError(error);
      throw error;
    }

    if (!data?.data) {
      await saveSharedState(localState);
      return localState;
    }

    const shared = data.data;
    return {
      ...localState,
      participants: Array.isArray(shared.participants) ? shared.participants : [],
      matches: mergeMatches(shared.matches || []),
      guesses: shared.guesses || {}
    };
  }

  async function saveSharedState(state) {
    const client = getClient();
    if (!client) return;

    const { error } = await client
      .from(TABLE_NAME)
      .upsert({
        id: STATE_ID,
        data: sharedOnly(state),
        updated_at: new Date().toISOString()
      }, { onConflict: "id" });

    if (error) {
      setLastError(error);
      throw error;
    }

    setLastError(null);
  }

  function describeError(error) {
    if (!error) return "Erro desconhecido.";
    if (typeof error === "string") return error;
    return [
      error.message,
      error.details,
      error.hint,
      error.code ? `codigo: ${error.code}` : ""
    ].filter(Boolean).join(" | ");
  }

  function getLastError() {
    return lastError;
  }

  async function testConnection() {
    const client = getClient();
    if (!client) {
      return { ok: false, message: "Supabase nao esta configurado em supabase-config.js." };
    }

    const { error } = await client
      .from(TABLE_NAME)
      .select("id")
      .limit(1);

    if (error) {
      setLastError(error);
      return { ok: false, message: describeError(error), error };
    }

    setLastError(null);
    return { ok: true, message: "Conexao com Supabase OK." };
  }

  window.BolaoSupabase = {
    isConfigured,
    loadSharedState,
    saveSharedState,
    testConnection,
    describeError,
    getLastError
  };
})();
