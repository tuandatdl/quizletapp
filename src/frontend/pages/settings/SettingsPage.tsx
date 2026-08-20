import React, { useEffect, useRef, useState } from "react";
import {
  Settings,
  Globe,
  Volume2,
  BookOpen,
  Sun,
  Moon,
  Laptop,
  Save,
  CheckCircle2,
  Sliders,
  Database,
  Download,
  Upload,
  Trash2,
  Play,
  Sparkles,
  Cloud,
  HelpCircle,
  Loader2,
  RefreshCw,
  LogIn,
  LogOut,
  Check,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { getFriendlyErrorMessage } from "../../api/client";
import type { UserSettings, VocabularyItem } from "../../types/api";
import { isStaticRuntime } from "../../runtime/runtime";
import { getIndexedDbAdapter } from "../../persistence/indexedDb";
import { backupFileName, exportBackup, importBackup, previewBackup, validateBackup, type BackupPreview } from "../../persistence/backup";
import type { StaticBackup } from "../../persistence/types";
import { configureSpeechUtterance, getAvailableVoicesForLanguage } from "../../services/speech";
import {
  CLOUD_VOICES_EN,
  DEFAULT_CLOUD_VOICE_EN,
  synthesizeCloudSpeech,
  configureAudioElementPlaybackRate,
} from "../../services/cloudTts";
import { getCloudAuthService } from "../../services/cloudAuth";
import { getSyncCoordinator } from "../../persistence/syncEngine";
import { LanguageApiClient } from "../../services/languageApi";
import { isLikelyIpa, matchesLocalVocabularyIdentity, needsExistingVocabularyRepair, normalizeLocalTerm } from "../../static/localDomain";
import type { SyncConflict, SyncMeta, SyncStatus } from "../../persistence/sync";
import type { User } from "@supabase/supabase-js";

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, isLoadingSettings } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { success, error, info } = useToast();

  const [form, setForm] = useState<Partial<UserSettings>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<{ backup: StaticBackup; preview: BackupPreview } | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlayingPreview, setIsPlayingPreview] = useState<"en" | "zh" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Legacy data repair state
  const [legacyScanResult, setLegacyScanResult] = useState<{
    total: number;
    needsRepairCount: number;
    missingIpaCount: number;
    missingPosCount: number;
    items: VocabularyItem[];
  } | null>(null);
  const [isScanningLegacy, setIsScanningLegacy] = useState(false);
  const [isRepairingLegacy, setIsRepairingLegacy] = useState(false);

  // Cloud Sync state
  const cloudAuth = getCloudAuthService();
  const [cloudAvailable] = useState<boolean>(() => cloudAuth.isAvailable());
  const [cloudUser, setCloudUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => cloudAuth.getSyncStatus());
  const [syncMeta, setSyncMeta] = useState<SyncMeta | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [emailInput, setEmailInput] = useState<string>("");
  const [isSendingMagicLink, setIsSendingMagicLink] = useState<boolean>(false);
  const [magicLinkSent, setMagicLinkSent] = useState<boolean>(false);
  const [isSyncingManual, setIsSyncingManual] = useState<boolean>(false);
  const [syncConflicts, setSyncConflicts] = useState<SyncConflict[]>([]);
  const [resolvingConflictId, setResolvingConflictId] = useState<string | null>(null);

  const refreshCloudState = async () => {
    if (!cloudAuth.isAvailable()) return;
    const user = await cloudAuth.getCurrentUser();
    setCloudUser(user);
    const meta = await cloudAuth.getSyncMeta();
    setSyncMeta(meta);
    const pending = await cloudAuth.getPendingCount();
    setPendingCount(pending);
    const conflicts = await cloudAuth.getConflicts();
    setSyncConflicts(conflicts.filter((conflict) => !conflict.resolvedAt));
  };

  useEffect(() => {
    if (!cloudAuth.isAvailable()) return;

    void refreshCloudState();

    const unsubscribeStatus = cloudAuth.onSyncStatusChange((status) => {
      setSyncStatus(status);
      void refreshCloudState();
    });

    const unsubscribeAuth = cloudAuth.onAuthStateChange((_event, session) => {
      setCloudUser(session?.user ?? null);
      void refreshCloudState();
    });

    const handleSyncComplete = () => {
      void refreshCloudState();
    };

    window.addEventListener("tutrinh:sync-complete", handleSyncComplete);

    return () => {
      unsubscribeStatus();
      unsubscribeAuth?.();
      window.removeEventListener("tutrinh:sync-complete", handleSyncComplete);
    };
  }, []);

  const handleSendMagicLink = async () => {
    if (!emailInput.trim()) return;
    setIsSendingMagicLink(true);
    try {
      const res = await cloudAuth.signInWithEmail(emailInput);
      if (!res.success) {
        error(res.error || "Không thể gửi email đăng nhập.");
      } else {
        setMagicLinkSent(true);
        success("Đã gửi liên kết đăng nhập tới " + emailInput + ". Vui lòng kiểm tra hộp thư!");
      }
    } catch (err: any) {
      error(getFriendlyErrorMessage(err));
    } finally {
      setIsSendingMagicLink(false);
    }
  };

  const handleSignOutCloud = async () => {
    try {
      await cloudAuth.signOut();
      setCloudUser(null);
      setMagicLinkSent(false);
      setEmailInput("");
      success("Đã đăng xuất khỏi đám mây. Dữ liệu trên thiết bị được giữ nguyên.");
    } catch (err: any) {
      error(getFriendlyErrorMessage(err));
    }
  };

  const handleManualSync = async () => {
    setIsSyncingManual(true);
    try {
      const res = await cloudAuth.syncNow(true);
      if (res.success) {
        success(`Đồng bộ thành công! (+${res.pulledCount} từ đám mây, +${res.pushedCount} tải lên)`);
      } else {
        error(res.error || "Đồng bộ thất bại.");
      }
      await refreshCloudState();
    } catch (err: any) {
      error(getFriendlyErrorMessage(err));
    } finally {
      setIsSyncingManual(false);
    }
  };

  const handleResolveSyncConflict = async (conflict: SyncConflict, choice: "local" | "remote") => {
    setResolvingConflictId(conflict.id);
    try {
      await cloudAuth.resolveConflict(conflict.id, choice);
      await refreshCloudState();
      if (choice === "local") {
        info("Đã giữ bản cục bộ. Thay đổi này sẽ được tải lên ở lần đồng bộ kế tiếp.");
      } else {
        info("Đã giữ bản đám mây.");
      }
    } catch (err: any) {
      error(getFriendlyErrorMessage(err));
    } finally {
      setResolvingConflictId(null);
    }
  };

  const handleScanLegacyVocabulary = async () => {
    setIsScanningLegacy(true);
    try {
      const adapter = getIndexedDbAdapter();
      const allItems = await adapter.getAll<VocabularyItem>("vocabulary");
      const enItems = allItems.filter((i) => i.language === "en");
      const repairItems = enItems.filter((i) => needsExistingVocabularyRepair(i));
      const missingIpa = enItems.filter((i) => !isLikelyIpa((i.metadata as any)?.ipa) && !isLikelyIpa(i.pronunciation)).length;
      const missingPos = enItems.filter((i) => !i.partOfSpeech?.trim()).length;
      setLegacyScanResult({
        total: allItems.length,
        needsRepairCount: repairItems.length,
        missingIpaCount: missingIpa,
        missingPosCount: missingPos,
        items: repairItems,
      });
      if (repairItems.length === 0) {
        success("Tất cả từ vựng tiếng Anh đã có đầy đủ IPA và từ loại!");
      } else {
        info(`Tìm thấy ${repairItems.length} từ cần cập nhật.`);
      }
    } catch (err: any) {
      error(getFriendlyErrorMessage(err));
    } finally {
      setIsScanningLegacy(false);
    }
  };

  const handleRepairLegacyVocabulary = async () => {
    if (!legacyScanResult || !legacyScanResult.items.length) return;
    setIsRepairingLegacy(true);
    try {
      const adapter = getIndexedDbAdapter();
      const client = new LanguageApiClient(adapter);
      const itemsToRepair = legacyScanResult.items;
      let repairedCount = 0;

      const BATCH_SIZE = 5;
      for (let i = 0; i < itemsToRepair.length; i += BATCH_SIZE) {
        const batch = itemsToRepair.slice(i, i + BATCH_SIZE);
        const terms = batch.map((item) => item.term);
        try {
          const enrichments = await client.enrichTerms("en", terms, true);
          const enrichmentMap = new Map(enrichments.map((e) => [normalizeLocalTerm(e.term, "en"), e]));

          for (const item of batch) {
            const currentItem = await adapter.get<VocabularyItem>("vocabulary", item.id);
            const normalizedTerm = normalizeLocalTerm(item.term, "en");
            const enriched = enrichmentMap.get(normalizedTerm);
            if (currentItem && matchesLocalVocabularyIdentity(currentItem, item.term, "en") && enriched && normalizeLocalTerm(enriched.term, "en") === normalizedTerm) {
              const updatedMeta = {
                ...currentItem.metadata,
                ipa: enriched.ipa ?? (currentItem.metadata as any)?.ipa,
                synonyms: enriched.synonyms?.length ? enriched.synonyms : (currentItem.metadata as any)?.synonyms,
                senses: enriched.senses?.length ? enriched.senses : (currentItem.metadata as any)?.senses,
              };
              const updatedItem: VocabularyItem = {
                ...currentItem,
                pronunciation: enriched.pronunciation ?? currentItem.pronunciation,
                partOfSpeech: enriched.partOfSpeech ?? currentItem.partOfSpeech,
                meaningVi: enriched.meaningVi ?? currentItem.meaningVi,
                example: enriched.example ?? currentItem.example,
                exampleTranslation: enriched.exampleTranslation ?? currentItem.exampleTranslation,
                metadata: updatedMeta,
                updatedAt: new Date().toISOString(),
              };
              await adapter.put("vocabulary", updatedItem as any);
              void getSyncCoordinator().queueLocalChange("vocabulary", updatedItem.id, updatedItem as any, false);
              repairedCount++;
            }
          }
        } catch {}
      }

      success(`Đã cập nhật thành công ${repairedCount} từ vựng!`);
      setLegacyScanResult(null);
    } catch (err: any) {
      error(getFriendlyErrorMessage(err));
    } finally {
      setIsRepairingLegacy(false);
    }
  };

  useEffect(() => {
    if (settings) {
      setForm({ ...settings });
    }
  }, [settings]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleChange = (key: keyof UserSettings, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const testBrowserVoice = (lang: "en" | "zh", testText: string, currentSpeed: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      error("Trình duyệt không hỗ trợ phát âm (SpeechSynthesis).");
      setIsPlayingPreview(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(testText);
    const preferredVoice = lang === "en" ? form.preferredVoiceEn : form.preferredVoiceZh;
    configureSpeechUtterance(utterance, lang, currentSpeed, voices, preferredVoice);

    setIsPlayingPreview(lang);
    utterance.onend = () => setIsPlayingPreview(null);
    utterance.onerror = () => setIsPlayingPreview(null);
    window.speechSynthesis.speak(utterance);
  };

  const handleTestVoice = async (lang: "en" | "zh") => {
    if (previewAudioRef.current) {
      try {
        previewAudioRef.current.pause();
      } catch {}
      previewAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const testText = lang === "en"
      ? "Hello! Learning languages every day brings great results."
      : "你好！每天坚持学习语言会带来很大的进步。";
    const currentSpeed = form.audioSpeed || 1;
    const isCloud = (form.audioEngine !== "BROWSER") && lang === "en";

    setIsPlayingPreview(lang);

    if (isCloud) {
      try {
        const voice = form.preferredCloudVoiceEn || DEFAULT_CLOUD_VOICE_EN;
        const blob = await synthesizeCloudSpeech({ text: testText, language: "en", voice });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        previewAudioRef.current = audio;
        configureAudioElementPlaybackRate(audio, currentSpeed);
        audio.onended = () => {
          setIsPlayingPreview(null);
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
          setIsPlayingPreview(null);
          URL.revokeObjectURL(url);
          testBrowserVoice(lang, testText, currentSpeed);
        };
        await audio.play();
        return;
      } catch {
        testBrowserVoice(lang, testText, currentSpeed);
        return;
      }
    }

    testBrowserVoice(lang, testText, currentSpeed);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(form);
      if (form.themePreference) {
        setTheme(form.themePreference);
      }
      success("Đã lưu các cài đặt thành công!");
    } catch (err: any) {
      error(getFriendlyErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const backup = await exportBackup(getIndexedDbAdapter());
      const href = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = backupFileName();
      anchor.click();
      URL.revokeObjectURL(href);
      success("Đã xuất bản sao lưu trên thiết bị.");
    } catch (caught) { error(getFriendlyErrorMessage(caught)); }
  };

  const handleBackupFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 20_000_000) throw new Error("Tệp sao lưu vượt quá 20 MB.");
      const backup = validateBackup(JSON.parse(await file.text()));
      setPendingBackup({ backup, preview: previewBackup(backup) });
    } catch (caught) {
      setPendingBackup(null);
      error(getFriendlyErrorMessage(caught));
    } finally { event.target.value = ""; }
  };

  const handleImport = async (mode: "merge" | "replace") => {
    if (!pendingBackup) return;
    if (mode === "replace" && !window.confirm("Thay thế sẽ xóa dữ liệu hiện tại trước khi nhập. Bạn có chắc chắn?")) return;
    try {
      await importBackup(getIndexedDbAdapter(), pendingBackup.backup, mode);
      setPendingBackup(null);
      success(mode === "merge" ? "Đã gộp bản sao lưu." : "Đã thay thế dữ liệu từ bản sao lưu.");
      await refreshSettingsAfterImport();
    } catch (caught) { error(getFriendlyErrorMessage(caught)); }
  };

  const refreshSettingsAfterImport = async () => {
    window.dispatchEvent(new Event("tutrinh:data-imported"));
    window.location.reload();
  };

  const handleDeleteLocalData = async () => {
    const confirmation = window.prompt("Nhập XÓA DỮ LIỆU để xác nhận xóa toàn bộ dữ liệu trên thiết bị này.");
    if (confirmation !== "XÓA DỮ LIỆU") return;
    try {
      await getIndexedDbAdapter().clearAll();
      success("Đã xóa dữ liệu trên thiết bị.");
      window.location.reload();
    } catch (caught) { error(getFriendlyErrorMessage(caught)); }
  };

  if (isLoadingSettings && !settings) {
    return (
      <div className="page-container flex-col gap-6" style={{ maxWidth: "780px" }}>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const enVoices = getAvailableVoicesForLanguage(voices, "en");
  const zhVoices = getAvailableVoicesForLanguage(voices, "zh");

  return (
    <div className="page-container flex-col gap-8 animate-fade-in" style={{ maxWidth: "780px" }}>
      <div>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>Cài Đặt Học Tập & Không Gian</h1>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginTop: "4px" }}>
          Tùy chỉnh ngôn ngữ hiển thị, giọng đọc tự nhiên, âm thanh và mục tiêu cá nhân
        </p>
      </div>

      <form onSubmit={handleSave} className="flex-col gap-6">
        {/* 1. Learning Preferences */}
        <Card className="flex-col gap-4">
          <div className="flex-row items-center gap-2">
            <Globe size={20} color="var(--accent-en-primary)" />
            <h2 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>Ngôn ngữ học tập</h2>
          </div>

          <div className="settings-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, marginBottom: "6px" }}>
                Ngôn ngữ học mặc định
              </label>
              <select
                value={form.currentLearningLanguage || "en"}
                onChange={(e) => handleChange("currentLearningLanguage", e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-default)",
                  backgroundColor: "var(--bg-surface)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                }}
              >
                <option value="en">🇬🇧 Tiếng Anh (English)</option>
                <option value="zh">🇨🇳 Tiếng Trung (中文)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, marginBottom: "6px" }}>
                Mục tiêu hoàn thành mỗi ngày (từ)
              </label>
              <input
                type="number"
                min={1}
                max={300}
                value={form.dailyGoal || 20}
                onChange={(e) => handleChange("dailyGoal", Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-default)",
                  backgroundColor: "var(--bg-surface)",
                  fontSize: "var(--text-sm)",
                }}
              />
            </div>
          </div>

          <div className="flex-row items-center gap-6" style={{ marginTop: "8px", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "var(--text-sm)" }}>
              <input
                type="checkbox"
                checked={form.englishEnabled ?? true}
                onChange={(e) => handleChange("englishEnabled", e.target.checked)}
              />
              <span>Kích hoạt học Tiếng Anh</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "var(--text-sm)" }}>
              <input
                type="checkbox"
                checked={form.chineseEnabled ?? true}
                onChange={(e) => handleChange("chineseEnabled", e.target.checked)}
              />
              <span>Kích hoạt học Tiếng Trung</span>
            </label>
          </div>
        </Card>

        {/* 2. Reading Display Settings */}
        <Card className="flex-col gap-4">
          <div className="flex-row items-center gap-2">
            <BookOpen size={20} color="var(--accent-en-primary)" />
            <h2 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>Tùy chọn đọc & dịch</h2>
          </div>

          <div className="flex-col gap-3">
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "var(--text-sm)" }}>
              <input
                type="checkbox"
                checked={form.showTranslation ?? true}
                onChange={(e) => handleChange("showTranslation", e.target.checked)}
              />
              <span>Tự động mở bảng dịch tiếng Việt toàn bài khi vào đọc</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "var(--text-sm)" }}>
              <input
                type="checkbox"
                checked={form.showPinyin ?? true}
                onChange={(e) => handleChange("showPinyin", e.target.checked)}
              />
              <span>Hiển thị phiên âm Pinyin khi học tiếng Trung</span>
            </label>
          </div>
        </Card>

        {/* 3. Audio & Text to Speech (Cloud TTS First) */}
        <Card className="flex-col gap-5">
          <div className="flex-row items-center justify-between" style={{ flexWrap: "wrap", gap: "8px" }}>
            <div className="flex-row items-center gap-2">
              <Volume2 size={20} color="var(--accent-en-primary)" />
              <div>
                <h2 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>Âm thanh & Giọng đọc</h2>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                  Giọng đọc đồng nhất trên điện thoại và máy tính (Cloud TTS)
                </p>
              </div>
            </div>
            <Badge variant="en" size="sm">
              <Sparkles size={12} style={{ marginRight: "4px" }} />
              Cloud TTS First
            </Badge>
          </div>

          {/* Engine Selector */}
          <div>
            <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, marginBottom: "6px" }}>
              Cơ chế phát âm (Audio Engine)
            </label>
            <select
              value={form.audioEngine || "AUTO"}
              onChange={(e) => handleChange("audioEngine", e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-default)",
                backgroundColor: "var(--bg-surface)",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
              }}
            >
              <option value="AUTO">✨ [Tự động - Khuyên dùng] Cloud TTS (Đồng nhất mọi thiết bị, tự động chuyển giọng thiết bị khi offline)</option>
              <option value="CLOUD">☁️ Chỉ dùng Cloud TTS (Âm thanh studio cao cấp)</option>
              <option value="BROWSER">💻 Chỉ dùng giọng trình duyệt (Web Speech API thiết bị)</option>
            </select>
          </div>

          {/* English Cloud Voice Selector */}
          <div style={{ backgroundColor: "var(--bg-muted)", padding: "14px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)" }}>
            <div className="flex-row justify-between items-center" style={{ marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
              <label style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-primary)" }}>
                🇬🇧 Giọng đọc Tiếng Anh (English Cloud Voice)
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleTestVoice("en")}
                disabled={isPlayingPreview === "en"}
                leftIcon={isPlayingPreview === "en" ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
              >
                {isPlayingPreview === "en" ? "Đang phát..." : "Nghe thử tiếng Anh"}
              </Button>
            </div>
            <select
              value={form.preferredCloudVoiceEn || DEFAULT_CLOUD_VOICE_EN}
              onChange={(e) => handleChange("preferredCloudVoiceEn", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-default)",
                backgroundColor: "var(--bg-surface)",
                fontSize: "var(--text-sm)",
              }}
            >
              {CLOUD_VOICES_EN.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} — {v.description}
                </option>
              ))}
            </select>
          </div>

          {/* Chinese Voice Selector (SpeechSynthesis fallback) */}
          <div style={{ backgroundColor: "var(--bg-muted)", padding: "14px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)" }}>
            <div className="flex-row justify-between items-center" style={{ marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
              <div>
                <label style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-primary)" }}>
                  🇨🇳 Giọng đọc Tiếng Trung (Chinese Voice)
                </label>
                <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginLeft: "6px" }}>
                  (Giọng trình duyệt)
                </span>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleTestVoice("zh")}
                disabled={isPlayingPreview === "zh"}
                leftIcon={isPlayingPreview === "zh" ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
              >
                {isPlayingPreview === "zh" ? "Đang phát..." : "Nghe thử tiếng Trung"}
              </Button>
            </div>
            <select
              value={form.preferredVoiceZh || "AUTO"}
              onChange={(e) => handleChange("preferredVoiceZh", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-default)",
                backgroundColor: "var(--bg-surface)",
                fontSize: "var(--text-sm)",
              }}
            >
              <option value="AUTO">✨ [Tự động] Ưu tiên giọng tự nhiên tốt nhất của thiết bị (zh-CN / zh-TW)</option>
              {zhVoices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang}) {v.localService ? "• Thiết bị" : "• Online/Natural"}
                </option>
              ))}
            </select>
          </div>

          {/* Advanced / Fallback Section */}
          <details style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
            <summary style={{ fontWeight: 700, cursor: "pointer", color: "var(--text-primary)" }}>
              ⚙️ Tùy chọn nâng cao: Giọng trình duyệt khi ngoại tuyến
            </summary>
            <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontWeight: 600 }}>Giọng tiếng Anh thiết bị dự phòng:</label>
              <select
                value={form.preferredVoiceEn || "AUTO"}
                onChange={(e) => handleChange("preferredVoiceEn", e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-default)",
                  backgroundColor: "var(--bg-surface)",
                  fontSize: "var(--text-xs)",
                }}
              >
                <option value="AUTO">✨ [Tự động] Giọng mặc định thiết bị</option>
                {enVoices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang}) {v.localService ? "• Thiết bị" : "• Online"}
                  </option>
                ))}
              </select>
            </div>
          </details>

          <div className="settings-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, marginBottom: "6px" }}>
                Tốc độ phát âm mặc định
              </label>
              <select
                value={form.audioSpeed || 1}
                onChange={(e) => handleChange("audioSpeed", Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-default)",
                  backgroundColor: "var(--bg-surface)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                }}
              >
                <option value={0.75}>0.75x — Chậm & Rõ ràng</option>
                <option value={1}>1.0x — Tốc độ chuẩn tự nhiên</option>
                <option value={1.25}>1.25x — Nhanh (Luyện phản xạ)</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", paddingTop: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "var(--text-sm)" }}>
                <input
                  type="checkbox"
                  checked={form.autoPlayAudio ?? false}
                  onChange={(e) => handleChange("autoPlayAudio", e.target.checked)}
                />
                <span>Tự động phát âm thanh khi lật thẻ flashcard</span>
              </label>
            </div>
          </div>

          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", lineHeight: "1.5" }}>
            💡 Danh sách giọng đọc phụ thuộc vào hệ điều hành (macOS, Windows, iOS, Android). Nếu bạn đổi thiết bị mà giọng đã chọn không khả dụng, hệ thống sẽ tự động dùng giọng chuẩn tốt nhất trên thiết bị đó.
          </p>
        </Card>

        {/* 4. Appearance & Theme */}
        <Card className="flex-col gap-4">
          <div className="flex-row items-center gap-2">
            <Sun size={20} color="var(--accent-en-primary)" />
            <h2 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>Giao diện hiển thị</h2>
          </div>

          <div className="settings-theme-options flex-row gap-3">
            {[
              { id: "light", label: "Chế độ Sáng", icon: Sun },
              { id: "dark", label: "Chế độ Tối", icon: Moon },
              { id: "system", label: "Theo hệ thống", icon: Laptop },
            ].map((opt) => {
              const Icon = opt.icon;
              const isSelected = (form.themePreference || theme) === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleChange("themePreference", opt.id)}
                  style={{
                    flex: 1,
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    border: `2px solid ${isSelected ? "var(--accent-en-primary)" : "var(--border-default)"}`,
                    backgroundColor: isSelected ? "var(--accent-en-subtle)" : "var(--bg-surface)",
                    color: isSelected ? "var(--accent-en-text)" : "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontWeight: 700,
                    fontSize: "var(--text-sm)",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  <Icon size={16} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* 5. Cloud Sync & Local Storage */}
        {isStaticRuntime() && (
          <Card className="flex-col gap-5">
            <div className="flex-row items-center justify-between" style={{ flexWrap: "wrap", gap: "8px" }}>
              <div className="flex-row items-center gap-2">
                <Cloud size={20} color="var(--accent-en-primary)" />
                <div>
                  <h2 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>Đồng bộ đám mây (Cloud Sync)</h2>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                    Đồng bộ vốn từ vựng, tiến độ học tập và bài đọc đa thiết bị qua Supabase (Local-First)
                  </p>
                </div>
              </div>

              {!cloudAvailable ? (
                <Badge variant="default" size="sm">Chưa cấu hình Supabase</Badge>
              ) : syncStatus === "SYNCING" ? (
                <Badge variant="en" size="sm">
                  <Loader2 size={12} className="animate-spin" style={{ marginRight: "4px" }} />
                  Đang đồng bộ...
                </Badge>
              ) : syncStatus === "IDLE" ? (
                <Badge variant="en" size="sm">
                  <Check size={12} style={{ marginRight: "4px" }} />
                  Đã đồng bộ
                </Badge>
              ) : syncStatus === "PENDING_CHANGES" ? (
                <Badge variant="default" size="sm">
                  <RefreshCw size={12} style={{ marginRight: "4px" }} />
                  {pendingCount > 0 ? `${pendingCount} thay đổi chưa tải lên` : "Có thay đổi chờ đồng bộ"}
                </Badge>
              ) : syncStatus === "OFFLINE" ? (
                <Badge variant="default" size="sm">Đang ngoại tuyến</Badge>
              ) : syncStatus === "ERROR" ? (
                <Badge variant="error" size="sm">
                  <AlertCircle size={12} style={{ marginRight: "4px" }} />
                  Lỗi đồng bộ
                </Badge>
              ) : syncStatus === "ACCOUNT_MISMATCH" ? (
                <Badge variant="error" size="sm">
                  <AlertTriangle size={12} style={{ marginRight: "4px" }} />
                  Khác tài khoản
                </Badge>
              ) : (
                <Badge variant="default" size="sm">Chưa đăng nhập</Badge>
              )}
            </div>

            {/* Cloud Sync State Body */}
            {!cloudAvailable ? (
              <div style={{ padding: "14px 16px", borderRadius: "var(--radius-md)", backgroundColor: "var(--bg-muted)", border: "1px dashed var(--border-strong)" }}>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                  Đồng bộ đám mây chưa được kích hoạt cho bản dựng này (cần cung cấp <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_ANON_KEY</code>).
                  Toàn bộ dữ liệu của bạn đang được lưu an toàn 100% trong trình duyệt (IndexedDB).
                </p>
              </div>
            ) : !cloudUser ? (
              /* Signed Out State -> Email Magic Link Sign In */
              <div style={{ padding: "16px", borderRadius: "var(--radius-md)", backgroundColor: "var(--bg-muted)", border: "1px solid var(--border-default)" }} className="flex-col gap-3">
                <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--text-primary)" }}>Đăng nhập để đồng bộ dữ liệu đa thiết bị</strong>
                  <p style={{ marginTop: "2px" }}>
                    Nhập email của bạn để nhận liên kết đăng nhập nhanh (Magic Link). Bạn vẫn có thể sử dụng toàn bộ tính năng mà không cần đăng nhập.
                  </p>
                </div>

                {magicLinkSent ? (
                  <div style={{ padding: "12px", backgroundColor: "var(--accent-en-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--accent-en-border)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Check size={16} color="var(--accent-en-primary)" />
                    <span style={{ fontSize: "var(--text-sm)", color: "var(--accent-en-text)", fontWeight: 600 }}>
                      Đã gửi email đăng nhập tới <strong>{emailInput}</strong>. Hãy mở email để xác nhận!
                    </span>
                  </div>
                ) : (
                  <div
                    className="flex-row gap-2"
                    style={{ flexWrap: "wrap" }}
                  >
                    <input
                      id="cloud-sync-email-input"
                      type="email"
                      placeholder="vidu@gmail.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void handleSendMagicLink();
                        }
                      }}
                      style={{
                        flex: 1,
                        minWidth: "220px",
                        padding: "8px 12px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-default)",
                        backgroundColor: "var(--bg-surface)",
                        color: "var(--text-primary)",
                        fontSize: "var(--text-sm)",
                      }}
                    />
                    <Button
                      id="cloud-sync-send-magic-link-btn"
                      type="button"
                      variant="primary"
                      size="sm"
                      isLoading={isSendingMagicLink}
                      leftIcon={<LogIn size={15} />}
                      onClick={() => void handleSendMagicLink()}
                    >
                      Gửi liên kết đăng nhập
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              /* Signed In State */
              <div style={{ padding: "16px", borderRadius: "var(--radius-md)", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-strong)" }} className="flex-col gap-3">
                <div className="flex-row justify-between items-center" style={{ flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>Tài khoản đám mây:</span>
                    <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-primary)" }}>{cloudUser.email}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>Đồng bộ lần cuối:</span>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--text-primary)", fontWeight: 600 }}>
                      {syncMeta?.lastSyncAt ? new Date(syncMeta.lastSyncAt).toLocaleString("vi-VN") : "Chưa có"}
                    </p>
                  </div>
                </div>

                {syncMeta?.lastSyncError && (
                  <div style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--accent-zh-subtle)", border: "1px solid var(--accent-zh-border)", fontSize: "var(--text-xs)", color: "var(--accent-zh-text)" }}>
                    ⚠️ {syncMeta.lastSyncError}
                  </div>
                )}

                {syncStatus === "ACCOUNT_MISMATCH" && (
                  <div style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--accent-zh-subtle)", border: "1px solid var(--accent-zh-border)", fontSize: "var(--text-xs)", color: "var(--accent-zh-text)" }}>
                    Để tránh trộn dữ liệu giữa hai tài khoản, ứng dụng đã chặn đồng bộ. Hãy dùng hồ sơ trình duyệt mới, hoặc xuất/làm sạch dữ liệu cục bộ một cách chủ động trước khi dùng tài khoản này.
                  </div>
                )}

                {syncConflicts.length > 0 && (
                  <div style={{ padding: "10px 12px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--accent-zh-subtle)", border: "1px solid var(--accent-zh-border)" }} className="flex-col gap-2">
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--accent-zh-text)", margin: 0 }}>
                      <strong>{syncConflicts.length} xung đột đồng bộ.</strong> Bản đám mây đã được áp dụng theo thứ tự máy chủ; bản cục bộ vẫn được lưu ở đây để bạn quyết định.
                    </p>
                    {syncConflicts.slice(0, 3).map((conflict) => (
                      <div key={conflict.id} className="flex-row items-center justify-between gap-2" style={{ flexWrap: "wrap" }}>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-primary)" }}>
                          {conflict.store}: {conflict.recordId}
                        </span>
                        <div className="flex-row gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            isLoading={resolvingConflictId === conflict.id}
                            onClick={() => void handleResolveSyncConflict(conflict, "remote")}
                          >
                            Giữ đám mây
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            isLoading={resolvingConflictId === conflict.id}
                            onClick={() => void handleResolveSyncConflict(conflict, "local")}
                          >
                            Giữ cục bộ
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex-row gap-2" style={{ marginTop: "4px", flexWrap: "wrap" }}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleManualSync}
                    isLoading={isSyncingManual || syncStatus === "SYNCING"}
                    leftIcon={<RefreshCw size={14} />}
                  >
                    Đồng bộ ngay
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOutCloud}
                    leftIcon={<LogOut size={14} />}
                  >
                    Đăng xuất
                  </Button>
                </div>
              </div>
            )}

            {/* Legacy Data Scan & Repair Section */}
            <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: "14px" }} className="flex-col gap-3">
              <div className="flex-row items-center justify-between" style={{ flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 700 }}>Kiểm tra & Khôi phục dữ liệu từ vựng cũ</h3>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                    Quét tìm từ vựng tiếng Anh cũ thiếu phiên âm IPA chuẩn hoặc từ loại để cập nhật an toàn
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  isLoading={isScanningLegacy}
                  leftIcon={<Sparkles size={15} />}
                  onClick={handleScanLegacyVocabulary}
                >
                  Kiểm tra dữ liệu cũ
                </Button>
              </div>

              {legacyScanResult && (
                <div style={{ padding: "14px", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)", boxShadow: "var(--shadow-sm)" }}>
                  <p style={{ fontWeight: 700, marginBottom: "4px", fontSize: "var(--text-sm)" }}>
                    Kết quả quét: {legacyScanResult.total} từ vựng đã kiểm tra
                  </p>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                    {legacyScanResult.needsRepairCount > 0 ? (
                      <>
                        Phát hiện <strong>{legacyScanResult.needsRepairCount}</strong> từ cần cập nhật (trong đó <strong>{legacyScanResult.missingIpaCount}</strong> từ thiếu/sai IPA, <strong>{legacyScanResult.missingPosCount}</strong> từ thiếu từ loại).
                      </>
                    ) : (
                      "Toàn bộ từ vựng đều đạt chuẩn hiện đại (IPA và từ loại đầy đủ)!"
                    )}
                  </p>
                  {legacyScanResult.needsRepairCount > 0 && (
                    <div className="flex-row gap-2" style={{ marginTop: "12px", flexWrap: "wrap" }}>
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        isLoading={isRepairingLegacy}
                        onClick={handleRepairLegacyVocabulary}
                      >
                        ✨ Cập nhật qua AI (theo đợt an toàn)
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setLegacyScanResult(null)}>Đóng</Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Local Backup / Restore Section */}
            <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: "14px" }} className="flex-col gap-3">
              <div className="flex-row items-center justify-between" style={{ flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 700 }}>Sao lưu & Dữ liệu cục bộ (IndexedDB)</h3>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                    Xuất hoặc nhập file sao lưu JSON an toàn trên máy
                  </p>
                </div>
                <Badge variant="default" size="sm">Local Storage</Badge>
              </div>

              <input ref={fileInputRef} type="file" accept="application/json,.json" hidden onChange={handleBackupFile} />
              <div className="flex-row gap-3" style={{ flexWrap: "wrap" }}>
                <Button type="button" variant="secondary" size="sm" leftIcon={<Download size={15} />} onClick={handleExport}>
                  Xuất file JSON
                </Button>
                <Button type="button" variant="secondary" size="sm" leftIcon={<Upload size={15} />} onClick={() => fileInputRef.current?.click()}>
                  Nhập file JSON
                </Button>
                <Button type="button" variant="danger" size="sm" leftIcon={<Trash2 size={15} />} onClick={handleDeleteLocalData}>
                  Xóa dữ liệu cục bộ
                </Button>
              </div>
            </div>

            {pendingBackup && (
              <div style={{ padding: "14px", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)", boxShadow: "var(--shadow-sm)" }}>
                <p style={{ fontWeight: 700, marginBottom: "8px", fontSize: "var(--text-sm)" }}>
                  Xem trước bản sao lưu (schema v{pendingBackup.preview.schemaVersion})
                </p>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                  📦 {pendingBackup.preview.counts.vocabulary} từ vựng · {pendingBackup.preview.counts.readings} bài đọc · {pendingBackup.preview.counts.quizHistory} lượt kiểm tra
                </p>
                <div className="flex-row gap-2" style={{ marginTop: "12px", flexWrap: "wrap" }}>
                  <Button type="button" size="sm" variant="primary" onClick={() => handleImport("merge")}>Gộp với dữ liệu hiện tại</Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => handleImport("replace")}>Thay thế dữ liệu hiện tại</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setPendingBackup(null)}>Hủy</Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Save Button */}
        <div className="flex-row justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            leftIcon={<Save size={18} />}
          >
            Lưu tất cả cài đặt
          </Button>
        </div>
      </form>
    </div>
  );
};
