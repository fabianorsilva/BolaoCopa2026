(function () {
  const STATE_ID = "main";
  const TABLE_NAME = "bolao_state";

  function getConfig() {
    return window.BOLAO_SUPABASE_CONFIG || {};
  }

  function isConfigured() {
    const config = getConfig();
    return Boolean(
      window.supabase &&
      config.url &&
      config.anonKey &&
      !config.url.includes("COLE_AQUI") &&
      !config.anonKey.includes("COLE_AQUI")
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

    if (error) throw error;

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
      });

    if (error) throw error;
  }

  window.BolaoSupabase = {
    isConfigured,
    loadSharedState,
    saveSharedState
  };
})();
