import type { Session, User } from "@supabase/supabase-js";
import { cloudSyncAvailable, getSupabaseClient, handleAuthRedirect } from "../persistence/supabaseClient";
import { getSyncCoordinator, LocalFirstSyncCoordinator } from "../persistence/syncEngine";
import type { MergePreview, SyncConflict, SyncMeta, SyncResult, SyncStatus } from "../persistence/sync";

export interface CloudAuthState {
  available: boolean;
  user: User | null;
  session: Session | null;
  syncStatus: SyncStatus;
}

export class CloudAuthService {
  private coordinator: LocalFirstSyncCoordinator = getSyncCoordinator();

  isAvailable(): boolean {
    return cloudSyncAvailable();
  }

  async getCurrentSession(): Promise<Session | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      // First check redirect tokens if any
      const redirectSession = await handleAuthRedirect();
      if (redirectSession) return redirectSession;

      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch {
      return null;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const session = await this.getCurrentSession();
    return session?.user ?? null;
  }

  async signInWithGoogle(options?: { returnTo?: string }): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: "Đồng bộ đám mây chưa được cấu hình cho ứng dụng này." };
    }

    try {
      const allowedRoutes = [
        "/",
        "/settings",
        "/vocabulary",
        "/flashcards",
        "/reading",
        "/shadowing",
        "/pronunciation",
        "/quiz",
        "/games",
        "/progress",
        "/add",
      ];
      const returnTo = options?.returnTo;
      const safeReturnTo = returnTo && allowedRoutes.includes(returnTo) ? returnTo : "/settings";

      if (typeof window !== "undefined" && window.sessionStorage) {
        try {
          window.sessionStorage.setItem("lexis_auth_return_to", safeReturnTo);
        } catch {
          // Ignore session storage write errors
        }
      }

      const redirectUrl = typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}`
        : undefined;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          scopes: "openid email profile",
          queryParams: {
            access_type: "online",
            prompt: "select_account",
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Lỗi khi kết nối với Google." };
    }
  }

  async signInWithMagicLink(email: string, options?: { returnTo?: string }): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: "Đồng bộ đám mây chưa được cấu hình cho ứng dụng này." };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes("@")) {
        return { success: false, error: "Vui lòng nhập địa chỉ email hợp lệ." };
      }

      const allowedRoutes = [
        "/",
        "/settings",
        "/vocabulary",
        "/flashcards",
        "/reading",
        "/shadowing",
        "/pronunciation",
        "/quiz",
        "/games",
        "/progress",
        "/add",
      ];
      const returnTo = options?.returnTo;
      const safeReturnTo = returnTo && allowedRoutes.includes(returnTo) ? returnTo : "/settings";

      if (typeof window !== "undefined" && window.sessionStorage) {
        try {
          window.sessionStorage.setItem("lexis_auth_return_to", safeReturnTo);
        } catch {
          // Ignore session storage write errors
        }
      }

      const redirectUrl = typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}`
        : undefined;

      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: true,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Lỗi khi gửi email đăng nhập." };
    }
  }

  async signInWithEmail(email: string): Promise<{ success: boolean; error?: string }> {
    return this.signInWithMagicLink(email);
  }

  getUserDisplayName(user: User | null): string {
    if (!user) return "Khách";
    const meta = user.user_metadata;
    if (meta?.full_name && typeof meta.full_name === "string" && meta.full_name.trim()) {
      return meta.full_name.trim();
    }
    if (meta?.name && typeof meta.name === "string" && meta.name.trim()) {
      return meta.name.trim();
    }
    if (user.email && typeof user.email === "string") {
      return user.email.split("@")[0];
    }
    return "Tài khoản LEXIS";
  }

  getUserAvatarUrl(user: User | null): string | null {
    if (!user) return null;
    const meta = user.user_metadata;
    if (meta?.avatar_url && typeof meta.avatar_url === "string") return meta.avatar_url;
    if (meta?.picture && typeof meta.picture === "string") return meta.picture;
    return null;
  }

  getUserProvider(user: User | null): string {
    if (!user) return "none";

    const identities = (user as any)?.identities;
    if (Array.isArray(identities) && identities.some((id: any) => id?.provider === "google")) {
      return "google";
    }

    const providers = user.app_metadata?.providers;
    if (Array.isArray(providers) && providers.includes("google")) {
      return "google";
    }

    if (user.app_metadata?.provider && typeof user.app_metadata.provider === "string") {
      return user.app_metadata.provider;
    }

    if (Array.isArray(identities) && identities.length > 0 && identities[0]?.provider) {
      return identities[0].provider;
    }

    return "email";
  }


  async signOut(): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Sign out error:", err);
      }
    }
    // Disconnect coordinator without deleting local IndexedDB data
    await this.coordinator.disconnect();
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void): (() => void) | undefined {
    const supabase = getSupabaseClient();
    if (!supabase) return undefined;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
      if (event === "SIGNED_IN" && session?.user) {
        // Trigger initial sync automatically on sign in
        void this.coordinator.sync();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }

  async syncNow(force = false): Promise<SyncResult> {
    return this.coordinator.sync(undefined, force);
  }

  getSyncStatus(): SyncStatus {
    return this.coordinator.getStatus();
  }

  onSyncStatusChange(listener: (status: SyncStatus) => void): () => void {
    return this.coordinator.onStatusChange(listener);
  }

  async getSyncMeta(): Promise<SyncMeta> {
    return this.coordinator.getMeta();
  }

  async getPendingCount(): Promise<number> {
    return this.coordinator.getPendingCount();
  }

  async getConflicts(): Promise<SyncConflict[]> {
    return this.coordinator.getConflicts();
  }

  async resolveConflict(conflictId: string, choice: "local" | "remote"): Promise<void> {
    return this.coordinator.resolveConflict(conflictId, choice);
  }

  async resolveAllConflicts(choice: "remote"): Promise<{ resolvedCount: number }> {
    return this.coordinator.resolveAllConflicts(choice);
  }

  async getMergePreview(): Promise<MergePreview | null> {
    return this.coordinator.getMergePreview();
  }

  async executeMerge(): Promise<SyncResult> {
    return this.coordinator.executeMerge();
  }
}

let defaultCloudAuthService: CloudAuthService | undefined;

export function getCloudAuthService(): CloudAuthService {
  defaultCloudAuthService ??= new CloudAuthService();
  return defaultCloudAuthService;
}
