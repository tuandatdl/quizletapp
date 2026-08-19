import { createClient, type SupabaseClient, type User, type Session } from "@supabase/supabase-js";

let clientInstance: SupabaseClient | null = null;
let clientInitialized = false;

function getEnvValue(key: string): string | undefined {
  const meta = typeof import.meta !== "undefined" ? (import.meta as unknown as { env?: Record<string, string | undefined> }) : undefined;
  const proc = typeof globalThis !== "undefined" && "process" in globalThis ? (globalThis as Record<string, any>).process : undefined;
  const value = meta?.env?.[key] ?? proc?.env?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function getSupabaseUrl(): string | undefined {
  return getEnvValue("VITE_SUPABASE_URL");
}

export function getSupabaseAnonKey(): string | undefined {
  return (
    getEnvValue("VITE_SUPABASE_ANON_KEY") ||
    getEnvValue("VITE_SUPABASE_PUBLISHABLE_KEY") ||
    getEnvValue("VITE_SUPABASE_PUBLIC_KEY")
  );
}

export function cloudSyncAvailable(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
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
        detectSessionInUrl: true,
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
 * Handles HashRouter-compatible Supabase Auth redirect tokens on GitHub Pages.
 * When Supabase redirects with `#access_token=...` or `?code=...`,
 * this extracts the auth session and cleans up the browser hash route without losing user state.
 */
export async function handleAuthRedirect(): Promise<Session | null> {
  const supabase = getSupabaseClient();
  if (!supabase || typeof window === "undefined") return null;

  try {
    // 1. Check if URL contains query parameter auth code (PKCE flow)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      // Clean up query param
      urlParams.delete("code");
      const newSearch = urlParams.toString() ? `?${urlParams.toString()}` : "";
      window.history.replaceState(null, "", `${window.location.pathname}${newSearch}${window.location.hash || "#/settings"}`);
      if (error) {
        console.error("Error exchanging code for session:", error);
        return null;
      }
      return data.session;
    }

    // 2. Check if window.location.hash contains access_token from Implicit / Magic Link flow
    const rawHash = window.location.hash;
    if (rawHash && (rawHash.includes("access_token=") || rawHash.includes("error_description="))) {
      // Extract hash params
      const hashContent = rawHash.startsWith("#") ? rawHash.slice(1) : rawHash;
      const hashParams = new URLSearchParams(hashContent);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        // Restore clean hash router path
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#/settings`);
        if (error) {
          console.error("Error setting session from hash:", error);
          return null;
        }
        return data.session;
      }
    }

    // 3. Normal session lookup
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch (error) {
    console.error("Auth redirect processing failed:", error);
    return null;
  }
}
