import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getCloudAuthService, CloudAuthService } from "../services/cloudAuth";
import type { SyncConflict, SyncMeta, SyncResult, SyncStatus } from "../persistence/sync";

export interface CloudAccountContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  cloudAvailable: boolean;
  provider: string;
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
  signInWithGoogle: (options?: { returnTo?: string }) => Promise<{ success: boolean; error?: string }>;
  signInWithMagicLink: (email: string, options?: { returnTo?: string }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  syncNow: (force?: boolean) => Promise<SyncResult>;
  syncStatus: SyncStatus;
  syncMeta: SyncMeta | null;
  pendingCount: number;
  conflicts: SyncConflict[];
  resolveConflict: (conflictId: string, choice: "local" | "remote") => Promise<void>;
  refreshAccount: () => Promise<void>;
}

const CloudAccountContext = createContext<CloudAccountContextType | undefined>(undefined);

export const CloudAccountProvider: React.FC<{ children: React.ReactNode; service?: CloudAuthService }> = ({
  children,
  service,
}) => {
  const authService = useMemo(() => service ?? getCloudAuthService(), [service]);

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => authService.getSyncStatus());
  const [syncMeta, setSyncMeta] = useState<SyncMeta | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);

  const cloudAvailable = authService.isAvailable();

  const refreshAccount = useCallback(async () => {
    if (!cloudAvailable) {
      setUser(null);
      setSession(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentSession = await authService.getCurrentSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      const [meta, pending, confs] = await Promise.all([
        authService.getSyncMeta(),
        authService.getPendingCount(),
        authService.getConflicts(),
      ]);
      setSyncMeta(meta);
      setPendingCount(pending);
      setConflicts(confs);
    } catch (err) {
      console.error("Failed to load cloud account state:", err);
    } finally {
      setIsLoading(false);
    }
  }, [authService, cloudAvailable]);

  useEffect(() => {
    void refreshAccount();

    const unsubAuth = authService.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      void refreshAccount();
    });

    const unsubSync = authService.onSyncStatusChange((status) => {
      setSyncStatus(status);
      void authService.getSyncMeta().then(setSyncMeta);
      void authService.getPendingCount().then(setPendingCount);
      void authService.getConflicts().then(setConflicts);
    });

    return () => {
      unsubAuth?.();
      unsubSync?.();
    };
  }, [authService, refreshAccount]);

  const signInWithGoogle = useCallback(
    async (options?: { returnTo?: string }) => {
      return authService.signInWithGoogle(options);
    },
    [authService],
  );

  const signInWithMagicLink = useCallback(
    async (email: string, options?: { returnTo?: string }) => {
      return authService.signInWithMagicLink(email, options);
    },
    [authService],
  );

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
    setSession(null);
    await refreshAccount();
  }, [authService, refreshAccount]);

  const syncNow = useCallback(
    async (force = false) => {
      const res = await authService.syncNow(force);
      await refreshAccount();
      return res;
    },
    [authService, refreshAccount],
  );

  const resolveConflict = useCallback(
    async (conflictId: string, choice: "local" | "remote") => {
      await authService.resolveConflict(conflictId, choice);
      await refreshAccount();
    },
    [authService, refreshAccount],
  );

  const displayName = authService.getUserDisplayName(user);
  const avatarUrl = authService.getUserAvatarUrl(user);
  const provider = authService.getUserProvider(user);
  const email = user?.email ?? null;
  const isAuthenticated = Boolean(user);

  return (
    <CloudAccountContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated,
        cloudAvailable,
        provider,
        displayName,
        email,
        avatarUrl,
        signInWithGoogle,
        signInWithMagicLink,
        signOut,
        syncNow,
        syncStatus,
        syncMeta,
        pendingCount,
        conflicts,
        resolveConflict,
        refreshAccount,
      }}
    >
      {children}
    </CloudAccountContext.Provider>
  );
};

export function useCloudAccount(): CloudAccountContextType {
  const context = useContext(CloudAccountContext);
  if (!context) {
    throw new Error("useCloudAccount must be used within a CloudAccountProvider");
  }
  return context;
}
