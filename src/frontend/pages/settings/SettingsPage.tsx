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
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { getFriendlyErrorMessage } from "../../api/client";
import type { UserSettings } from "../../types/api";
import { isStaticRuntime } from "../../runtime/runtime";
import { getIndexedDbAdapter } from "../../persistence/indexedDb";
import { backupFileName, exportBackup, importBackup, previewBackup, validateBackup, type BackupPreview } from "../../persistence/backup";
import type { StaticBackup } from "../../persistence/types";

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, isLoadingSettings } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { success, error } = useToast();

  const [form, setForm] = useState<Partial<UserSettings>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<{ backup: StaticBackup; preview: BackupPreview } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setForm({ ...settings });
    }
  }, [settings]);

  const handleChange = (key: keyof UserSettings, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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

  return (
    <div className="page-container flex-col gap-8 animate-fade-in" style={{ maxWidth: "780px" }}>
      <div>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>Cài Đặt Học Tập & Không Gian</h1>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginTop: "4px" }}>
          Tùy chỉnh ngôn ngữ hiển thị, tốc độ âm thanh và mục tiêu cá nhân
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
                Mục tiêu hoàn thành mỗi ngày
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

          <div className="flex-row items-center gap-6" style={{ marginTop: "8px" }}>
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

        {/* 3. Audio & Text to Speech */}
        <Card className="flex-col gap-4">
          <div className="flex-row items-center gap-2">
            <Volume2 size={20} color="var(--accent-en-primary)" />
            <h2 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>Âm thanh & Giọng đọc</h2>
          </div>

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

        {isStaticRuntime() && (
          <Card className="flex-col gap-4">
            <div className="flex-row items-center gap-2">
              <Database size={20} color="var(--accent-en-primary)" />
              <div>
                <h2 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>Dữ liệu</h2>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>Dữ liệu được lưu trên thiết bị này và không tự đồng bộ sang thiết bị khác.</p>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="application/json,.json" hidden onChange={handleBackupFile} />
            <div className="flex-row gap-3" style={{ flexWrap: "wrap" }}>
              <Button type="button" variant="secondary" leftIcon={<Download size={16} />} onClick={handleExport}>Xuất bản sao lưu</Button>
              <Button type="button" variant="secondary" leftIcon={<Upload size={16} />} onClick={() => fileInputRef.current?.click()}>Nhập bản sao lưu</Button>
              <Button type="button" variant="danger" leftIcon={<Trash2 size={16} />} onClick={handleDeleteLocalData}>Xóa dữ liệu trên thiết bị</Button>
            </div>
            {pendingBackup && (
              <div style={{ padding: "12px", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--bg-muted)" }}>
                <p style={{ fontWeight: 700, marginBottom: "8px" }}>Xem trước bản sao lưu (schema {pendingBackup.preview.schemaVersion})</p>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                  {pendingBackup.preview.counts.vocabulary} từ vựng · {pendingBackup.preview.counts.readings} bài đọc · {pendingBackup.preview.counts.quizHistory} lượt quiz
                </p>
                <div className="flex-row gap-2" style={{ marginTop: "12px", flexWrap: "wrap" }}>
                  <Button type="button" size="sm" onClick={() => handleImport("merge")}>Gộp với dữ liệu hiện tại</Button>
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
