/** @vitest-environment jsdom */

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { indexedDB } from "fake-indexeddb";
import { IndexedDbAdapter } from "../src/frontend/persistence/indexedDb.js";
import {
  type SyncChange,
} from "../src/frontend/persistence/sync.js";
import { LocalFirstSyncCoordinator } from "../src/frontend/persistence/syncEngine.js";
import {
  resetSupabaseClientForTesting,
  isAuthCallbackUrl,
  handleAuthRedirect,
} from "../src/frontend/persistence/supabaseClient.js";
import { CloudAuthService } from "../src/frontend/services/cloudAuth.js";
import { CloudAccountProvider } from "../src/frontend/context/CloudAccountContext.js";
import { LoginPage } from "../src/frontend/pages/auth/LoginPage.js";
import { GoogleIcon } from "../src/frontend/components/ui/GoogleIcon.js";

// Ensure global indexedDB and React act environment are available in jsdom environment
globalThis.indexedDB = indexedDB;
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Mock runtime as static mode for static GitHub Pages tests
vi.mock("../src/frontend/runtime/runtime.js", () => ({
  isStaticRuntime: () => true,
  STATIC_LOCAL_USER: {
    id: "local-user",
    name: "Học viên",
    email: "learner@local.dev",
    role: "student",
    createdAt: "2026-08-20T00:00:00.000Z",
  },
}));

vi.mock("../src/frontend/context/AuthContext.js", () => ({
  useAuth: () => ({
    user: { id: "local-user", name: "Học viên", email: "learner@local.dev" },
    token: "local-profile",
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  }),
}));

vi.mock("../src/frontend/context/ToastContext.js", () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }),
}));

describe("LEXIS Google Account & Cloud Sync Integration", () => {
  let container: HTMLDivElement;
  let root: Root;
  let adapter: IndexedDbAdapter;
  let dbName: string;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    dbName = `test-google-sync-${crypto.randomUUID()}`;
    adapter = new IndexedDbAdapter(dbName, indexedDB);
    resetSupabaseClientForTesting();
    try {
      window.sessionStorage?.clear?.();
      window.localStorage?.clear?.();
    } catch {}
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    resetSupabaseClientForTesting();
    vi.unstubAllEnvs();
    try {
      window.sessionStorage?.clear?.();
      window.localStorage?.clear?.();
    } catch {}
  });

  // =========================================================================
  // GROUP A: LOGIN UI
  // =========================================================================
  describe("Group A: Login UI in Static Mode", () => {
    it("renders LEXIS wordmark, Google button, Magic Link input, and Guest continue button", async () => {
      await act(async () => {
        root.render(
          <MemoryRouter initialEntries={["/login"]}>
            <CloudAccountProvider>
              <LoginPage />
            </CloudAccountProvider>
          </MemoryRouter>,
        );
      });

      expect(container.textContent).toContain("LEXIS");
      expect(container.textContent).toContain("LANGUAGE WORKSPACE");
      expect(container.textContent).toContain("Chào mừng trở lại");

      // Google Button
      const googleBtn = container.querySelector("#login-google-btn") as HTMLButtonElement;
      expect(googleBtn).not.toBeNull();
      expect(googleBtn.textContent).toContain("Tiếp tục với Google");

      // Magic Link
      const magicInput = container.querySelector("#login-magic-email") as HTMLInputElement;
      const magicSubmit = container.querySelector("#login-magic-submit-btn") as HTMLButtonElement;
      expect(magicInput).not.toBeNull();
      expect(magicSubmit).not.toBeNull();
      expect(magicSubmit.textContent).toContain("Gửi liên kết đăng nhập");

      // Guest Continue Button
      const guestBtn = container.querySelector("#login-guest-btn") as HTMLButtonElement;
      expect(guestBtn).not.toBeNull();
      expect(guestBtn.textContent).toContain("Tiếp tục không cần đăng nhập");

      // Offline reassurance text
      expect(container.textContent).toContain("Dữ liệu học tập trên thiết bị luôn được giữ lại 100%");
    });

    it("renders GoogleIcon with standard SVG paths and responsive dimensions", () => {
      const { container: iconContainer } = {
        container: document.createElement("div"),
      };
      const iconRoot = createRoot(iconContainer);
      act(() => {
        iconRoot.render(<GoogleIcon size={24} />);
      });
      const svg = iconContainer.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg?.getAttribute("width")).toBe("24");
      expect(svg?.getAttribute("height")).toBe("24");
      iconRoot.unmount();
    });
  });

  // =========================================================================
  // GROUP B: GOOGLE OAUTH
  // =========================================================================
  describe("Group B: Google OAuth Service", () => {
    it("calls supabase.auth.signInWithOAuth with provider='google', safe scopes, and safe redirectTo", async () => {
      const signInWithOAuthMock = vi.fn().mockResolvedValue({ data: { url: "https://accounts.google.com/o/oauth2/auth" }, error: null });
      const mockSupabase = {
        auth: {
          signInWithOAuth: signInWithOAuthMock,
          getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
          onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
      } as any;

      resetSupabaseClientForTesting(mockSupabase);
      const service = new CloudAuthService();

      const res = await service.signInWithGoogle({ returnTo: "/settings" });
      expect(res.success).toBe(true);

      expect(signInWithOAuthMock).toHaveBeenCalledTimes(1);
      const [callArg] = signInWithOAuthMock.mock.calls[0];
      expect(callArg.provider).toBe("google");
      expect(callArg.options.scopes).toBe("openid email profile");
      expect(callArg.options.queryParams.access_type).toBe("online");
      expect(callArg.options.queryParams.prompt).toBe("select_account");

      // Verify safe returnTo stored in sessionStorage
      expect(sessionStorage.getItem("lexis_auth_return_to")).toBe("/settings");

      // Verify no provider tokens or secrets stored in storage
      expect(window.localStorage?.getItem?.("provider_token") ?? null).toBeNull();
      expect(window.sessionStorage?.getItem?.("provider_token") ?? null).toBeNull();
    });

    it("prevents open redirect attacks by sanitizing unsafe returnTo destinations", async () => {
      const signInWithOAuthMock = vi.fn().mockResolvedValue({ data: { url: "https://accounts.google.com" }, error: null });
      const mockSupabase = {
        auth: {
          signInWithOAuth: signInWithOAuthMock,
          getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
          onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
      } as any;

      resetSupabaseClientForTesting(mockSupabase);
      const service = new CloudAuthService();

      // Unsafe external redirect attempt
      await service.signInWithGoogle({ returnTo: "https://evil.com/phish" as any });

      // Must sanitize to default /settings
      expect(sessionStorage.getItem("lexis_auth_return_to")).toBe("/settings");
    });
  });

  // =========================================================================
  // GROUP C: SESSION & METADATA
  // =========================================================================
  describe("Group C: Session Restoration & Profile Metadata", () => {
    it("extracts display name, email, avatar URL, and provider from Google Supabase user metadata", () => {
      const service = new CloudAuthService();

      const googleUser: any = {
        id: "google-user-uuid-1234",
        email: "tuandat@example.com",
        app_metadata: { provider: "google" },
        user_metadata: {
          full_name: "Tuan Dat",
          avatar_url: "https://lh3.googleusercontent.com/a/photo.jpg",
        },
      };

      expect(service.getUserDisplayName(googleUser)).toBe("Tuan Dat");
      expect(service.getUserAvatarUrl(googleUser)).toBe("https://lh3.googleusercontent.com/a/photo.jpg");
      expect(service.getUserProvider(googleUser)).toBe("google");
    });

    it("signing out clears Supabase session but retains IndexedDB local data", async () => {
      const signOutMock = vi.fn().mockResolvedValue({ error: null });
      const mockSupabase = {
        auth: {
          signOut: signOutMock,
          getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
          onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
      } as any;

      resetSupabaseClientForTesting(mockSupabase);
      const service = new CloudAuthService();

      // Seed local data in IndexedDB
      await adapter.put("vocabulary", {
        id: "vocab-local-1",
        language: "en",
        term: "resilient",
        meaningVi: "kiên cường",
        updatedAt: "2026-08-20T12:00:00.000Z",
      });

      await service.signOut();

      expect(signOutMock).toHaveBeenCalledTimes(1);

      // Verify local data is still intact in IndexedDB
      const savedItem = await adapter.get("vocabulary", "vocab-local-1");
      expect(savedItem).not.toBeNull();
      expect((savedItem as any).term).toBe("resilient");
    });
  });

  // =========================================================================
  // GROUP D: GUEST MODE
  // =========================================================================
  describe("Group D: Guest Mode Accessibility", () => {
    it("allows learning features to function without any active cloud session", async () => {
      resetSupabaseClientForTesting(null);

      // Verify local IndexedDB operations work seamlessly for guest
      await adapter.put("vocabulary", {
        id: "guest-vocab-1",
        language: "en",
        term: "serendipity",
        meaningVi: "sự tình cờ may mắn",
        updatedAt: new Date().toISOString(),
      });

      const guestItems = await adapter.getAll("vocabulary");
      expect(guestItems).toHaveLength(1);
      expect((guestItems[0] as any).term).toBe("serendipity");
    });
  });

  // =========================================================================
  // GROUP E: LOCAL ADOPTION
  // =========================================================================
  describe("Group E: Guest Local Dataset Adoption", () => {
    it("adopts guest local dataset upon first Google sign-in without data loss", async () => {
      // 1. Guest creates 3 vocabulary items offline
      await adapter.put("vocabulary", { id: "v1", language: "en", term: "one", meaningVi: "một", updatedAt: "2026-08-20T01:00:00Z" });
      await adapter.put("vocabulary", { id: "v2", language: "en", term: "two", meaningVi: "hai", updatedAt: "2026-08-20T01:00:00Z" });
      await adapter.put("vocabulary", { id: "v3", language: "en", term: "three", meaningVi: "ba", updatedAt: "2026-08-20T01:00:00Z" });

      const googleUserId = "google-uuid-first-device";
      const uploadedChanges: any[] = [];

      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { user: { id: googleUserId } } },
            error: null,
          }),
          onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
      } as any;
      resetSupabaseClientForTesting(mockSupabase);

      const mockRemoteAdapter = {
        pull: vi.fn().mockResolvedValue({ changes: [], hasMore: false, cursor: "0" }),
        push: vi.fn().mockImplementation(async (changes: SyncChange[]) => {
          uploadedChanges.push(...changes);
          return { acknowledgedKeys: changes.map((c) => `${c.store}:${c.id}`) };
        }),
      };

      const coordinator = new LocalFirstSyncCoordinator(adapter);

      // Perform sync with mock remote adapter and Google user UUID
      const res = await coordinator.sync(mockRemoteAdapter as any);

      // Verify sync succeeds
      expect(res.success).toBe(true);

      // Verify ownership was recorded
      const meta = await coordinator.getMeta();
      expect(meta.localDatasetOwnerUserId).toBe(googleUserId);

      // Verify all 3 local records were preserved and pushed
      const localRecords = await adapter.getAll("vocabulary");
      expect(localRecords).toHaveLength(3);
      expect(uploadedChanges.filter((c) => c.store === "vocabulary")).toHaveLength(3);
    });
  });

  // =========================================================================
  // GROUP F: ACCOUNT MISMATCH PROTECTION
  // =========================================================================
  describe("Group F: Account Mismatch Protection", () => {
    it("detects ACCOUNT_MISMATCH when Account B signs in on a device owned by Account A", async () => {
      // Setup meta with Account A as owner
      await adapter.put("meta", {
        id: "sync-meta",
        localDatasetOwnerUserId: "account-a-uuid",
        lastCursor: "100",
        lastSyncAt: "2026-08-20T00:00:00Z",
        lastSyncStatus: "IDLE",
        lastSyncError: null,
      });

      // Add data belonging to Account A
      await adapter.put("vocabulary", {
        id: "vocab-a-1",
        language: "en",
        term: "confidential",
        meaningVi: "bí mật",
        updatedAt: "2026-08-20T00:00:00Z",
      });

      // Mock client signed in as Account B
      const mockSupabaseAccountB = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { user: { id: "account-b-uuid", email: "userb@example.com" } } },
            error: null,
          }),
          onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
      } as any;

      resetSupabaseClientForTesting(mockSupabaseAccountB);
      vi.stubEnv("VITE_SUPABASE_URL", "https://test.supabase.co");
      vi.stubEnv("VITE_SUPABASE_ANON_KEY", "test-key");

      const coordinator = new LocalFirstSyncCoordinator(adapter);
      const res = await coordinator.sync();

      expect(res.success).toBe(false);
      expect(coordinator.getStatus()).toBe("ACCOUNT_MISMATCH");
      expect(res.error).toContain("Dữ liệu trên máy này thuộc về tài khoản khác");

      // Verify Account A data was NOT pushed or cleared
      const localData = await adapter.getAll("vocabulary");
      expect(localData).toHaveLength(1);
      expect((localData[0] as any).id).toBe("vocab-a-1");
    });
  });

  // =========================================================================
  // GROUP G: MULTI-DEVICE TWO-WAY SYNC SIMULATION
  // =========================================================================
  describe("Group G: Multi-Device Sync Simulation", () => {
    it("propagates add, edit, and delete between Device A and Device B with same Google account UUID", async () => {
      const remoteDatabase: Map<string, { store: string; id: string; payload: any; deleted: boolean; updatedAt: string; changeSeq: string }> = new Map();
      let serverChangeSeq = 0;

      const createMockRemoteAdapter = () => ({
        pull: async (cursor?: string) => {
          const fromSeq = cursor ? parseInt(cursor, 10) : 0;
          const changes: SyncChange[] = [];
          for (const item of remoteDatabase.values()) {
            const seq = parseInt(item.changeSeq, 10);
            if (seq > fromSeq) {
              changes.push({
                store: item.store as any,
                id: item.id,
                record: item.deleted ? undefined : item.payload,
                deleted: item.deleted,
                updatedAt: item.updatedAt,
                changeSeq: item.changeSeq,
              });
            }
          }
          return {
            changes,
            hasMore: false,
            cursor: serverChangeSeq.toString(),
          };
        },
        push: async (changes: SyncChange[]) => {
          const acknowledged: string[] = [];
          for (const c of changes) {
            serverChangeSeq++;
            remoteDatabase.set(`${c.store}:${c.id}`, {
              store: c.store,
              id: c.id,
              payload: c.record,
              deleted: c.deleted,
              updatedAt: c.updatedAt,
              changeSeq: serverChangeSeq.toString(),
            });
            acknowledged.push(`${c.store}:${c.id}`);
          }
          return { acknowledgedKeys: acknowledged };
        },
      });

      // Device A Setup
      const adapterA = new IndexedDbAdapter(`device-a-${crypto.randomUUID()}`, indexedDB);
      const coordinatorA = new LocalFirstSyncCoordinator(adapterA);

      // Device B Setup
      const adapterB = new IndexedDbAdapter(`device-b-${crypto.randomUUID()}`, indexedDB);
      const coordinatorB = new LocalFirstSyncCoordinator(adapterB);

      // --- STEP 1: Device A adds a vocabulary item and syncs ---
      const item1 = {
        id: "vocab-shared-1",
        language: "en",
        term: "epiphany",
        meaningVi: "sự giác ngộ",
        updatedAt: "2026-08-20T10:00:00Z",
      };
      await adapterA.put("vocabulary", item1);
      await coordinatorA.queueLocalChange("vocabulary", item1.id, item1, false);
      const syncA1 = await coordinatorA.sync(createMockRemoteAdapter() as any);
      expect(syncA1.success).toBe(true);
      expect(syncA1.pushedCount).toBe(1);

      // --- STEP 2: Device B syncs (pulls item1) ---
      const syncB1 = await coordinatorB.sync(createMockRemoteAdapter() as any);
      expect(syncB1.success).toBe(true);
      expect(syncB1.pulledCount).toBe(1);

      const deviceBItem = await adapterB.get("vocabulary", "vocab-shared-1");
      expect(deviceBItem).not.toBeNull();
      expect((deviceBItem as any).meaningVi).toBe("sự giác ngộ");

      // --- STEP 3: Device B edits item1 and syncs ---
      const item1Edited = {
        ...item1,
        meaningVi: "sự thấu hiểu đột ngột, giác ngộ",
        updatedAt: "2026-08-20T11:00:00Z",
      };
      await adapterB.put("vocabulary", item1Edited);
      await coordinatorB.queueLocalChange("vocabulary", item1Edited.id, item1Edited, false);
      const syncB2 = await coordinatorB.sync(createMockRemoteAdapter() as any);
      expect(syncB2.success).toBe(true);
      expect(syncB2.pushedCount).toBe(1);

      // --- STEP 4: Device A syncs (pulls edit from B) ---
      const syncA2 = await coordinatorA.sync(createMockRemoteAdapter() as any);
      expect(syncA2.success).toBe(true);
      expect(syncA2.pulledCount).toBe(1);

      const deviceAEditedItem = await adapterA.get("vocabulary", "vocab-shared-1");
      expect((deviceAEditedItem as any).meaningVi).toBe("sự thấu hiểu đột ngột, giác ngộ");

      // --- STEP 5: Device A deletes item1 and syncs ---
      await adapterA.delete("vocabulary", "vocab-shared-1");
      await coordinatorA.queueLocalChange("vocabulary", "vocab-shared-1", undefined, true);
      const syncA3 = await coordinatorA.sync(createMockRemoteAdapter() as any);
      expect(syncA3.success).toBe(true);
      expect(syncA3.pushedCount).toBe(1);

      // --- STEP 6: Device B syncs (pulls delete from A) ---
      const syncB3 = await coordinatorB.sync(createMockRemoteAdapter() as any);
      expect(syncB3.success).toBe(true);
      expect(syncB3.pulledCount).toBe(1);

      const deviceBDeletedItem = await adapterB.get("vocabulary", "vocab-shared-1");
      expect(deviceBDeletedItem).toBeFalsy();
    });
  });

  // =========================================================================
  // GROUP H: CALLBACK ROUTING & HASHROUTER INTEGRATION
  // =========================================================================
  describe("Group H: OAuth Callback Routing", () => {
    it("detects PKCE code callback and redirects cleanly to stored return route", async () => {
      // Mock window.location with ?code=
      const originalLocation = window.location;
      const replaceMock = vi.fn();

      delete (window as any).location;
      window.location = {
        origin: "https://tuandatdl.github.io",
        pathname: "/quizletapp/",
        search: "?code=test-auth-code-1234",
        hash: "",
        replace: replaceMock,
      } as any;

      expect(isAuthCallbackUrl()).toBe(true);

      const exchangeMock = vi.fn().mockResolvedValue({
        data: { session: { user: { id: "test-user-id" } } },
        error: null,
      });

      const mockSupabase = {
        auth: {
          exchangeCodeForSession: exchangeMock,
          getSession: vi.fn(),
        },
      } as any;

      resetSupabaseClientForTesting(mockSupabase);
      sessionStorage.setItem("lexis_auth_return_to", "/vocabulary");

      const session = await handleAuthRedirect();
      expect(exchangeMock).toHaveBeenCalledWith("test-auth-code-1234");
      expect(session).not.toBeNull();

      // Verified redirect to /vocabulary
      expect(replaceMock).toHaveBeenCalledWith("/quizletapp/#/vocabulary");

      window.location = originalLocation;
    });

    it("detects implicit hash tokens and redirects cleanly to #/settings by default", async () => {
      const originalLocation = window.location;
      const replaceMock = vi.fn();

      delete (window as any).location;
      window.location = {
        origin: "https://tuandatdl.github.io",
        pathname: "/quizletapp/",
        search: "",
        hash: "#access_token=test-access-token&refresh_token=test-refresh-token&token_type=bearer",
        replace: replaceMock,
      } as any;

      expect(isAuthCallbackUrl()).toBe(true);

      const setSessionMock = vi.fn().mockResolvedValue({
        data: { session: { user: { id: "test-user-id" } } },
        error: null,
      });

      const mockSupabase = {
        auth: {
          setSession: setSessionMock,
          getSession: vi.fn(),
        },
      } as any;

      resetSupabaseClientForTesting(mockSupabase);

      const session = await handleAuthRedirect();
      expect(setSessionMock).toHaveBeenCalledWith({
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
      });
      expect(session).not.toBeNull();
      expect(replaceMock).toHaveBeenCalledWith("/quizletapp/#/settings");

      window.location = originalLocation;
    });
  });

  // =========================================================================
  // GROUP I: DERIVED DISPLAY STATUS & AUTH STATE CONSISTENCY REGRESSION TESTS
  // =========================================================================
  describe("Group I: Derived Display Status & Auth Consistency", () => {
    it("Regression A & B: No session + IDLE / pendingCount 10 => UI forces SIGNED_OUT and never says 'Đã đồng bộ'", async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
          onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
      } as any;
      resetSupabaseClientForTesting(mockSupabase);
      vi.stubEnv("VITE_SUPABASE_URL", "https://test.supabase.co");
      vi.stubEnv("VITE_SUPABASE_ANON_KEY", "test-key");

      // Queue 10 items in adapter
      for (let i = 1; i <= 10; i++) {
        await adapter.put("syncQueue", {
          id: `vocabulary:v-${i}`,
          store: "vocabulary",
          recordId: `v-${i}`,
          record: { term: `word-${i}` },
          deleted: false,
          updatedAt: new Date().toISOString(),
          attempts: 0,
        });
      }

      const coordinator = new LocalFirstSyncCoordinator(adapter);
      await new Promise((r) => setTimeout(r, 20));
      expect(coordinator.getStatus()).toBe("SIGNED_OUT");

      // Verify pending count is 10
      const pendingCount = await coordinator.getPendingCount();
      expect(pendingCount).toBe(10);
    });

    it("Regression E: Google identity in identities + primary provider=email => getUserProvider identifies Google", () => {
      const service = new CloudAuthService();

      const userWithLinkedGoogle: any = {
        id: "user-123456",
        email: "tuandat@example.com",
        app_metadata: {
          provider: "email",
          providers: ["email", "google"],
        },
        identities: [
          { provider: "email", id: "email-id" },
          { provider: "google", id: "google-id" },
        ],
      };

      expect(service.getUserProvider(userWithLinkedGoogle)).toBe("google");
    });

    it("Regression F: sign out forces syncStatus to SIGNED_OUT, preserving IndexedDB and syncQueue", async () => {
      const mockSupabase = {
        auth: {
          signOut: vi.fn().mockResolvedValue({ error: null }),
          getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
          onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
      } as any;
      resetSupabaseClientForTesting(mockSupabase);

      const service = new CloudAuthService();

      // Seed vocabulary and syncQueue
      await adapter.put("vocabulary", {
        id: "vocab-keep-1",
        language: "en",
        term: "persistence",
        meaningVi: "sự kiên định",
        updatedAt: new Date().toISOString(),
      });
      await adapter.put("syncQueue", {
        id: "vocabulary:vocab-keep-1",
        store: "vocabulary",
        recordId: "vocab-keep-1",
        record: { term: "persistence" },
        deleted: false,
        updatedAt: new Date().toISOString(),
        attempts: 0,
      });

      await service.signOut();

      // Verify local data is 100% intact
      const localVocab = await adapter.get("vocabulary", "vocab-keep-1");
      expect(localVocab).not.toBeNull();

      const queueItems = await adapter.getAll("syncQueue");
      expect(queueItems).toHaveLength(1);
      expect((queueItems[0] as any).recordId).toBe("vocab-keep-1");
    });

    it("Regression C & D: Session present correctly distinguishes between pending changes and IDLE", async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { user: { id: "user-test-sync", email: "user@test.dev" } } },
            error: null,
          }),
          onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
      } as any;
      resetSupabaseClientForTesting(mockSupabase);
      vi.stubEnv("VITE_SUPABASE_URL", "https://test.supabase.co");
      vi.stubEnv("VITE_SUPABASE_ANON_KEY", "test-key");

      const coordinator = new LocalFirstSyncCoordinator(adapter);
      await new Promise((r) => setTimeout(r, 20));

      // With 0 queue items, status is IDLE
      const pending0 = await coordinator.getPendingCount();
      expect(pending0).toBe(0);
      expect(coordinator.getStatus()).toBe("IDLE");

      // With 10 queue items, getPendingCount returns 10
      for (let i = 1; i <= 10; i++) {
        await coordinator.queueLocalChange("vocabulary", `v-${i}`, { term: `w-${i}` }, false);
      }
      const pending10 = await coordinator.getPendingCount();
      expect(pending10).toBe(10);
      expect(coordinator.getStatus()).toBe("PENDING_CHANGES");
    });

    it("Regression G: OAuth session survives reload via persistent storage", async () => {
      const sessionObj = {
        access_token: "persisted-access-token",
        refresh_token: "persisted-refresh-token",
        user: { id: "user-persisted-123", email: "persisted@test.dev" },
      };

      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: sessionObj },
            error: null,
          }),
          onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
      } as any;
      resetSupabaseClientForTesting(mockSupabase);

      const service = new CloudAuthService();
      const currentSession = await service.getCurrentSession();
      expect(currentSession).not.toBeNull();
      expect(currentSession?.user?.id).toBe("user-persisted-123");
    });
  });

  // =========================================================================
  // GROUP J: SAFE GUEST → EXISTING CLOUD MERGE INTEGRATION
  // =========================================================================
  describe("Group J: Safe Guest → Existing Cloud Merge Flow", () => {
    it("detects GUEST_UNOWNED + EXISTING_CLOUD, transitions to MERGE_REQUIRED, and deletes nothing", async () => {
      // 1. Local guest dataset (vocabulary + readings)
      await adapter.put("vocabulary", { id: "local-v1", language: "en", term: "local term", meaningVi: "nghĩa cục bộ", updatedAt: "2026-08-20T00:00:00Z" });
      await adapter.put("readings", { id: "local-r1", title: "Local Reading", content: "Local text", language: "en", updatedAt: "2026-08-20T00:00:00Z" });

      // 2. Remote cloud has existing data
      const mockRemoteAdapter = {
        pull: vi.fn().mockResolvedValue({
          changes: [
            {
              store: "vocabulary",
              id: "remote-v1",
              updatedAt: "2026-08-20T01:00:00Z",
              deleted: false,
              record: { id: "remote-v1", language: "en", term: "remote term", meaningVi: "nghĩa đám mây" },
              changeSeq: "1",
            },
          ],
          hasMore: false,
          cursor: "1",
        }),
        push: vi.fn().mockResolvedValue({ acknowledgedKeys: [] }),
      };

      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { user: { id: "authenticated-user-uuid" } } },
            error: null,
          }),
          onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
      } as any;
      resetSupabaseClientForTesting(mockSupabase);

      const coordinator = new LocalFirstSyncCoordinator(adapter);
      const syncRes = await coordinator.sync(mockRemoteAdapter as any);

      // Verify sync requires merge
      expect(syncRes.success).toBe(false);
      expect(coordinator.getStatus()).toBe("MERGE_REQUIRED");

      // Verify ownership remains null before merge commit point
      const meta = await coordinator.getMeta();
      expect(meta.localDatasetOwnerUserId).toBeNull();
      expect(meta.lastSyncStatus).toBe("MERGE_REQUIRED");

      // Verify no local record was deleted
      const localVocabs = await adapter.getAll("vocabulary");
      expect(localVocabs).toHaveLength(1);
      const localReadings = await adapter.getAll("readings");
      expect(localReadings).toHaveLength(1);
    });

    it("getMergePreview calculates local-only, remote-only, identical, and conflicting counts correctly", async () => {
      // Local setup: 1 local-only, 1 identical, 1 conflicting
      await adapter.put("vocabulary", { id: "v-local-only", language: "en", term: "alpha", meaningVi: "alpha vn" });
      await adapter.put("vocabulary", { id: "v-identical", language: "en", term: "beta", meaningVi: "beta vn" });
      await adapter.put("vocabulary", { id: "v-conflict", language: "en", term: "gamma local", meaningVi: "gamma vn" });

      const mockRemoteAdapter = {
        pull: vi.fn().mockResolvedValue({
          changes: [
            {
              store: "vocabulary",
              id: "v-remote-only",
              updatedAt: "2026-08-20T01:00:00Z",
              deleted: false,
              record: { id: "v-remote-only", language: "en", term: "delta", meaningVi: "delta vn" },
              changeSeq: "1",
            },
            {
              store: "vocabulary",
              id: "v-identical",
              updatedAt: "2026-08-20T01:00:00Z",
              deleted: false,
              record: { id: "v-identical", language: "en", term: "beta", meaningVi: "beta vn" },
              changeSeq: "2",
            },
            {
              store: "vocabulary",
              id: "v-conflict",
              updatedAt: "2026-08-20T01:00:00Z",
              deleted: false,
              record: { id: "v-conflict", language: "en", term: "gamma remote edit", meaningVi: "gamma remote vn" },
              changeSeq: "3",
            },
          ],
          hasMore: false,
          cursor: "3",
        }),
        push: vi.fn().mockResolvedValue({ acknowledgedKeys: [] }),
      };

      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { user: { id: "user-123" } } },
            error: null,
          }),
          onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
      } as any;
      resetSupabaseClientForTesting(mockSupabase);

      const coordinator = new LocalFirstSyncCoordinator(adapter);
      const preview = await coordinator.getMergePreview(mockRemoteAdapter as any);

      expect(preview).not.toBeNull();
      expect(preview?.localOnlyCount).toBe(1); // v-local-only
      expect(preview?.remoteOnlyCount).toBe(1); // v-remote-only
      expect(preview?.sameIdSameContentCount).toBe(1); // v-identical
      expect(preview?.sameIdDifferentContentCount).toBe(1); // v-conflict
      expect(preview?.canMerge).toBe(true);
    });

    it("executeMerge merges records safely, assigns ownership, and preserves conflict versions", async () => {
      // Local setup: 1 local-only, 1 identical, 1 conflict
      await adapter.put("vocabulary", { id: "v-local-only", language: "en", term: "alpha", meaningVi: "alpha vn" });
      await adapter.put("vocabulary", { id: "v-identical", language: "en", term: "beta", meaningVi: "beta vn" });
      await adapter.put("vocabulary", { id: "v-conflict", language: "en", term: "gamma local", meaningVi: "gamma local vn" });

      const uploadedKeys: string[] = [];
      const mockRemoteAdapter = {
        pull: vi.fn().mockResolvedValue({
          changes: [
            {
              store: "vocabulary",
              id: "v-remote-only",
              updatedAt: "2026-08-20T01:00:00Z",
              deleted: false,
              record: { id: "v-remote-only", language: "en", term: "delta", meaningVi: "delta vn" },
              changeSeq: "1",
            },
            {
              store: "vocabulary",
              id: "v-identical",
              updatedAt: "2026-08-20T01:00:00Z",
              deleted: false,
              record: { id: "v-identical", language: "en", term: "beta", meaningVi: "beta vn" },
              changeSeq: "2",
            },
            {
              store: "vocabulary",
              id: "v-conflict",
              updatedAt: "2026-08-20T01:00:00Z",
              deleted: false,
              record: { id: "v-conflict", language: "en", term: "gamma remote", meaningVi: "gamma remote vn" },
              changeSeq: "3",
            },
          ],
          hasMore: false,
          cursor: "3",
        }),
        push: vi.fn().mockImplementation(async (changes: SyncChange[]) => {
          for (const c of changes) {
            uploadedKeys.push(`${c.store}:${c.id}`);
          }
          return { acknowledgedKeys: changes.map((c) => `${c.store}:${c.id}`) };
        }),
      };

      const userId = "target-user-uuid-999";
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { user: { id: userId } } },
            error: null,
          }),
          onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
      } as any;
      resetSupabaseClientForTesting(mockSupabase);

      const coordinator = new LocalFirstSyncCoordinator(adapter);
      const mergeRes = await coordinator.executeMerge(mockRemoteAdapter as any);

      expect(mergeRes.success).toBe(true);

      // Verify ownership was atomically committed to userId
      const meta = await coordinator.getMeta();
      expect(meta.localDatasetOwnerUserId).toBe(userId);

      // Verify remote-only record was written locally
      const remoteWritten = await adapter.get("vocabulary", "v-remote-only");
      expect(remoteWritten).not.toBeNull();
      expect((remoteWritten as any).term).toBe("delta");

      // Verify conflict was recorded with both versions intact
      const conflicts = await coordinator.getConflicts();
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].recordId).toBe("v-conflict");
      expect((conflicts[0].localRecord as any)?.term).toBe("gamma local");
      expect((conflicts[0].remoteRecord as any)?.term).toBe("gamma remote");

      // Verify local-only item was pushed
      expect(uploadedKeys).toContain("vocabulary:v-local-only");
    });

    it("strictly preserves foreign account mismatch and disallows merge when local owner is Account A", async () => {
      // Local dataset is owned by Account A
      await adapter.put("meta", {
        id: "sync-meta",
        localDatasetOwnerUserId: "account-a-uuid",
        lastCursor: "5",
        lastSyncAt: "2026-08-20T00:00:00Z",
        lastSyncStatus: "IDLE",
        lastSyncError: null,
      });

      vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
      vi.stubEnv("VITE_SUPABASE_ANON_KEY", "sb_test_key");
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { user: { id: "account-b-uuid" } } },
            error: null,
          }),
          onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
      } as any;
      resetSupabaseClientForTesting(mockSupabase);

      const coordinator = new LocalFirstSyncCoordinator(adapter);
      const preview = await coordinator.getMergePreview();
      expect(preview).toBeNull();

      const mergeRes = await coordinator.executeMerge();
      expect(mergeRes.success).toBe(false);
      expect(mergeRes.error).toContain("Dữ liệu trên máy này thuộc về tài khoản khác");

      // Verify Account A ownership remained strictly unchanged
      const meta = await coordinator.getMeta();
      expect(meta.localDatasetOwnerUserId).toBe("account-a-uuid");
    });
  });
});
