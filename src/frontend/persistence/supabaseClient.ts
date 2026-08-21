import { createClient, type SupabaseClient, type Session } from "@supabase/supabase-js";

let clientInstance: SupabaseClient | null = null;
let clientInitialized = false;

export function getSupabaseUrl(): string | undefined {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return typeof url === "string" && url.trim() ? url.trim() : undefined;
}

export function getSupabaseAnonKey(): string | undefined {
  const key =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLIC_KEY;
  return typeof key === "string" && key.trim() ? key.trim() : undefined;
}

export function cloudSyncAvailable(): boolean {
  return Boolean((getSupabaseUrl() && getSupabaseAnonKey()) || clientInstance);
}

export function getSupabaseClient(): SupabaseClient | null {
  if (clientInitialized) return clientInstance;

  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) {
    clientInitialized = true;
    clientInstance = null;
    return null;
  }

  try {
    clientInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // We handle session detection ourselves to avoid HashRouter conflict
        detectSessionInUrl: false,
        storageKey: "tutrinh_supabase_auth",
      },
    });
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    clientInstance = null;
  }

  clientInitialized = true;
  return clientInstance;
}

/**
 * Resets the cached Supabase client instance (useful for unit testing with mocks/stubs).
 */
export function resetSupabaseClientForTesting(mockClient?: SupabaseClient | null): void {
  clientInitialized = Boolean(mockClient !== undefined);
  clientInstance = mockClient ?? null;
}

/**
 * Returns true if the current URL looks like a Supabase auth callback.
 * This must be called BEFORE HashRouter renders to prevent 404.
 */
export function isAuthCallbackUrl(): boolean {
  if (typeof window === "undefined") return false;
  const search = window.location.search;
  const hash = window.location.hash;
  return (
    search.includes("code=") ||
    hash.includes("access_token=") ||
    hash.includes("refresh_token=") ||
    hash.includes("error_description=")
  );
}

function getSafeReturnRoute(): string {
  if (typeof window === "undefined" || !window.sessionStorage) return "/settings";
  try {
    const stored = window.sessionStorage.getItem("lexis_auth_return_to");
    window.sessionStorage.removeItem("lexis_auth_return_to");
    if (stored && stored.startsWith("/") && !stored.startsWith("//") && !stored.includes("://")) {
      return stored;
    }
  } catch {
    // Ignore storage read errors
  }
  return "/settings";
}

/**
 * Handles HashRouter-compatible Supabase Auth redirect tokens on GitHub Pages.
 *
 * After a successful auth exchange, performs a full same-origin replace to
 * `#/settings` (or safe stored return route) so HashRouter boots with a clean, valid route.
 *
 * Returns the resulting Session (or null on failure / no callback present).
 */
export async function handleAuthRedirect(): Promise<Session | null> {
  const supabase = getSupabaseClient();
  if (!supabase || typeof window === "undefined") return null;

  try {
    const targetRoute = getSafeReturnRoute();

    // ── 1. PKCE flow: ?code= in query string ──────────────────────────────
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      // Build clean search without the code param
      urlParams.delete("code");
      const cleanSearch = urlParams.toString() ? `?${urlParams.toString()}` : "";

      if (error) {
        console.error("Error exchanging code for session:", error);
        // Redirect to settings even on error — do NOT leave user at auth fragment
        window.location.replace(`${window.location.pathname}${cleanSearch}#/settings`);
        return null;
      }

      // Full replace so HashRouter sees a clean route on boot
      window.location.replace(`${window.location.pathname}${cleanSearch}#${targetRoute}`);
      return data.session;
    }

    // ── 2. Implicit / Magic Link flow: #access_token= in hash ─────────────
    const rawHash = window.location.hash;
    if (rawHash && (rawHash.includes("access_token=") || rawHash.includes("error_description="))) {
      const hashContent = rawHash.startsWith("#") ? rawHash.slice(1) : rawHash;
      const hashParams = new URLSearchParams(hashContent);

      const errorDesc = hashParams.get("error_description");
      if (errorDesc) {
        console.error("Supabase auth error in hash:", errorDesc);
        window.location.replace(`${window.location.pathname}${window.location.search}#/settings`);
        return null;
      }

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("Error setting session from hash:", error);
          window.location.replace(`${window.location.pathname}${window.location.search}#/settings`);
          return null;
        }

        // Full replace — HashRouter will boot cleanly
        window.location.replace(`${window.location.pathname}${window.location.search}#${targetRoute}`);
        return data.session;
      }
    }

    // ── 3. Normal (non-callback) page load — just return existing session ──
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch (error) {
    console.error("Auth redirect processing failed:", error);
    return null;
  }
}

