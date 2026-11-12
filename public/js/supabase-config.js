/**
 * MROSHELEVATE Supabase Configuration Manager
 * Handles project URL, Anon Key, connection status, and persistent client settings
 */

const MROSH_SUPABASE = (function () {
  // Default keys can be loaded from localStorage (runtime config) or environment
  const STORAGE_KEY_URL = "mrosh_supabase_url";
  const STORAGE_KEY_ANON = "mrosh_supabase_anon";

  // Default live project credentials
  const DEFAULT_SUPABASE_URL = "https://lemcrtghvbbultjlahwb.supabase.co";
  const DEFAULT_SUPABASE_ANON = "sb_publishable_08b4AYYpHtc9NhODexmefA_rI3nNYa5";

  // Check stored keys or use live defaults
  let supabaseUrl = localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_SUPABASE_URL;
  let supabaseAnonKey = localStorage.getItem(STORAGE_KEY_ANON) || DEFAULT_SUPABASE_ANON;

  let clientInstance = null;

  function isConfigured() {
    return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("https://") && supabaseAnonKey.length > 20);
  }

  function getClient() {
    if (!isConfigured()) return null;

    if (!clientInstance && window.supabase) {
      try {
        clientInstance = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
      } catch (err) {
        console.error("Failed to initialize Supabase client:", err);
      }
    }
    return clientInstance;
  }

  function saveConfig(url, anonKey) {
    if (!url || !anonKey) return false;
    url = url.trim();
    anonKey = anonKey.trim();

    localStorage.setItem(STORAGE_KEY_URL, url);
    localStorage.setItem(STORAGE_KEY_ANON, anonKey);
    supabaseUrl = url;
    supabaseAnonKey = anonKey;
    clientInstance = null; // Re-create client on next getClient()

    return true;
  }

  function clearConfig() {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON);
    supabaseUrl = "";
    supabaseAnonKey = "";
    clientInstance = null;
  }

  function getConfig() {
    return {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      isConfigured: isConfigured()
    };
  }

  return {
    isConfigured,
    getClient,
    saveConfig,
    clearConfig,
    getConfig
  };
})();

