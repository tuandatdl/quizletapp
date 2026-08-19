import type { Session, User } from "@supabase/supabase-js";
import { cloudSyncAvailable, getSupabaseClient, handleAuthRedirect } from "../persistence/supabaseClient";
import { getSyncCoordinator, LocalFirstSyncCoordinator } from "../persistence/syncEngine";
import type { SyncConflict, SyncMeta, SyncResult, SyncStatus } from "../persistence/sync";

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

  async signInWithEmail(email: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: "Đồng bộ đám mây chưa được cấu hình cho ứng dụng này." };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes("@")) {
        return { success: false, error: "Vui lòng nhập địa chỉ email hợp lệ." };
      }

      // Compute redirect URL compatible with GitHub Pages HashRouter
      const redirectUrl = typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}#/settings`
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
}

let defaultCloudAuthService: CloudAuthService | undefined;

export function getCloudAuthService(): CloudAuthService {
  defaultCloudAuthService ??= new CloudAuthService();
  return defaultCloudAuthService;
}
