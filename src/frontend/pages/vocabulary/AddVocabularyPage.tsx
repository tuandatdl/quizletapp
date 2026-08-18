import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Plus,
  ArrowLeft,
  Check,
  Sparkles,
  Zap,
  ListPlus,
  X,
  Trash2,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Bookmark,
} from "lucide-react";
import { vocabularyApi } from "../../api/vocabulary.api";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { getFriendlyErrorMessage } from "../../api/client";
import type {
  BulkVocabularyCreateResult,
  BulkVocabularyInputItem,
  BulkVocabularyPreview,
  Language,
  VocabularySenseSuggestion,
} from "../../types/api";
import { parseLocalQuickInput } from "../../static/localDomain";

type TabMode = "quick" | "detailed";

interface EditablePreviewItem {
  id: string;
  term: string;
  normalizedTerm: string;
  duplicate: boolean;
  meaningVi: string;
  partOfSpeech: string;
  pronunciation: string;
  ipa?: string;
  pinyin?: string;
  synonyms: string;
  example: string;
  exampleTranslation: string;
  topic: string;
  level: string;
  toeicLevel: string;
  tone: string;
  traditional: string;
  selected: boolean;
  expandedDetails: boolean;
  senses: VocabularySenseSuggestion[];
  enrichmentState: "loading" | "ready" | "partial" | "failed" | "exists";
  enrichmentError?: string;
}

const toEditablePreview = (item: BulkVocabularyPreview["items"][number], idx: number): EditablePreviewItem => ({
  id: `${item.normalizedTerm}-${idx}`,
  term: item.term,
  normalizedTerm: item.normalizedTerm,
  duplicate: item.duplicate,
  meaningVi: item.suggestion.meaningVi || "",
  partOfSpeech: item.suggestion.partOfSpeech || "",
  pronunciation: item.suggestion.pronunciation || item.suggestion.pinyin || item.suggestion.ipa || "",
  ipa: item.suggestion.ipa || undefined,
  pinyin: item.suggestion.pinyin || undefined,
  synonyms: (item.suggestion.synonyms || []).join(", "),
  example: item.suggestion.example || "",
  exampleTranslation: item.suggestion.exampleTranslation || "",
  topic: item.suggestion.topic || "",
  level: item.suggestion.cefr || (item.suggestion.hskLevel ? `HSK${item.suggestion.hskLevel}` : ""),
  toeicLevel: item.suggestion.toeicLevel || "",
  tone: item.suggestion.toneData?.[0] !== undefined ? String(item.suggestion.toneData[0]) : "",
  traditional: item.suggestion.traditional || "",
  selected: true,
  expandedDetails: false,
  senses: item.suggestion.senses || [],
  enrichmentState: item.duplicate ? "exists" : item.error ? "failed" : item.status === "READY" ? "ready" : "partial",
  enrichmentError: item.error?.message,
});

export const AddVocabularyPage: React.FC = () => {
  const { language: currentAppLang } = useLanguage();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabMode>("quick");
  const [formLang, setFormLang] = useState<Language>(currentAppLang);

  // Quick Add State
  const [quickInput, setQuickInput] = useState("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [enrichmentConfigured, setEnrichmentConfigured] = useState<boolean>(true);
  const [previewItems, setPreviewItems] = useState<EditablePreviewItem[]>([]);
  const [hasParsed, setHasParsed] = useState(false);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [bulkSaveResult, setBulkSaveResult] = useState<BulkVocabularyCreateResult | null>(null);

  // Detailed Add State (Preserved Form)
  const [term, setTerm] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [meaningVi, setMeaningVi] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("");
  const [example, setExample] = useState("");
  const [exampleTranslation, setExampleTranslation] = useState("");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("");
  const [note, setNote] = useState("");
  const [traditional, setTraditional] = useState("");
  const [synonyms, setSynonyms] = useState("");
  const [toeicLevel, setToeicLevel] = useState("");
  const [tone, setTone] = useState<string>("");
  const [isDetailedSubmitting, setIsDetailedSubmitting] = useState(false);

  const isZh = formLang === "zh";

  // ================= QUICK ADD HANDLERS =================
  const handleAnalyzeQuickInput = async () => {
    if (!quickInput.trim()) {
      error("Vui lòng nhập ít nhất một từ vựng.");
      return;
    }

    setIsPreviewLoading(true);
    setBulkSaveResult(null);
    try {
      const terms = parseLocalQuickInput(quickInput, formLang);
      setPreviewItems(terms.map((term, idx) => ({
        id: `loading-${idx}`, term, normalizedTerm: term.normalize("NFKC").trim().toLocaleLowerCase(), duplicate: false,
        meaningVi: "", partOfSpeech: "", pronunciation: "", synonyms: "", example: "", exampleTranslation: "", topic: "", level: "", toeicLevel: "", tone: "", traditional: "",
        selected: true, expandedDetails: false, senses: [], enrichmentState: "loading",
      })));
      setHasParsed(true);
    } catch (caught) {
      error(getFriendlyErrorMessage(caught));
      setIsPreviewLoading(false);
      return;
    }
    try {
      const res = await vocabularyApi.bulkPreview(formLang, quickInput);
      setEnrichmentConfigured(res.enrichment.configured);
      const items = res.items.map(toEditablePreview);

      setPreviewItems(items);
      setHasParsed(true);
      if (items.length > 0) {
        success(`Đã nhận diện thành công ${items.length} từ!`);
      }
    } catch (err: any) {
      setPreviewItems((items) => items.map((item) => ({ ...item, enrichmentState: "failed", enrichmentError: getFriendlyErrorMessage(err) })));
      error(getFriendlyErrorMessage(err));
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleRetryEnrichment = async (terms?: string[]) => {
    const targets = terms ?? previewItems.filter((item) => item.enrichmentState === "failed" || !item.meaningVi.trim()).map((item) => item.term);
    if (!targets.length) return;
    const normalizedTargets = new Set(targets.map((term) => term.normalize("NFKC").trim().toLocaleLowerCase()));
    setPreviewItems((items) => items.map((item) => normalizedTargets.has(item.normalizedTerm) ? { ...item, enrichmentState: "loading", enrichmentError: undefined } : item));
    try {
      const res = await vocabularyApi.bulkPreview(formLang, targets.join("\n"), true);
      const replacements = new Map(res.items.map((item, idx) => [item.normalizedTerm, toEditablePreview(item, idx)]));
      setPreviewItems((items) => items.map((item) => {
        const replacement = replacements.get(item.normalizedTerm);
        return replacement ? { ...replacement, id: item.id, selected: item.selected, expandedDetails: item.expandedDetails } : item;
      }));
    } catch (caught) {
      setPreviewItems((items) => items.map((item) => normalizedTargets.has(item.normalizedTerm) ? { ...item, enrichmentState: "failed", enrichmentError: getFriendlyErrorMessage(caught) } : item));
      error(getFriendlyErrorMessage(caught));
    }
  };

  const handleChooseSense = (id: string, senseIndex: number) => {
    setPreviewItems((items) => items.map((item) => {
      if (item.id !== id) return item;
      const sense = item.senses[senseIndex];
      return sense ? { ...item, meaningVi: sense.meaningVi || item.meaningVi, partOfSpeech: sense.partOfSpeech || item.partOfSpeech, synonyms: (sense.synonyms || []).join(", ") } : item;
    }));
  };

  const handleRemoveChip = (indexToRemove: number) => {
    setPreviewItems((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleClearAllChips = () => {
    setPreviewItems([]);
    setHasParsed(false);
    setBulkSaveResult(null);
  };

  const handleToggleSelectAll = () => {
    const allSelected = previewItems.every((i) => i.selected);
    setPreviewItems((prev) => prev.map((i) => ({ ...i, selected: !allSelected })));
  };

  const handleToggleSelectItem = (id: string) => {
    setPreviewItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i))
    );
  };

  const handleUpdateItemField = (id: string, field: keyof EditablePreviewItem, value: any) => {
    setPreviewItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const handleToggleExpandDetails = (id: string) => {
    setPreviewItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, expandedDetails: !i.expandedDetails } : i))
    );
  };

  const handleBulkSave = async () => {
    const selectedItems = previewItems.filter((i) => i.selected);
    if (selectedItems.length === 0) {
      error("Vui lòng chọn ít nhất một từ để lưu.");
      return;
    }

    const missingMeaning = selectedItems.filter((i) => !i.meaningVi.trim());
    if (missingMeaning.length > 0) {
      error(`Có ${missingMeaning.length} từ chưa nhập nghĩa tiếng Việt. Vui lòng bổ sung trước khi lưu.`);
      return;
    }

    setIsBulkSaving(true);
    try {
      const payload: BulkVocabularyInputItem[] = selectedItems.map((i) => {
        const itemPayload: BulkVocabularyInputItem = {
          term: i.term.trim(),
          meaningVi: i.meaningVi.trim(),
          partOfSpeech: i.partOfSpeech.trim() || undefined,
          pronunciation: i.pronunciation.trim() || undefined,
          example: i.example.trim() || undefined,
          exampleTranslation: i.exampleTranslation.trim() || undefined,
          topic: i.topic.trim() || undefined,
        };

        if (formLang === "zh") {
          if (i.pronunciation.trim()) itemPayload.pinyin = i.pronunciation.trim();
          if (i.traditional.trim()) itemPayload.traditional = i.traditional.trim();
          if (/^HSK[1-6]$/.test(i.level)) itemPayload.hskLevel = Number(i.level.slice(3));
          if (i.tone && i.tone !== "neutral") {
            itemPayload.toneData = [Number(i.tone) as any];
          }
        } else {
          if (i.pronunciation.trim()) itemPayload.ipa = i.pronunciation.trim();
          if (i.level) itemPayload.cefr = i.level;
          if (i.toeicLevel) itemPayload.toeicLevel = i.toeicLevel;
          if (i.synonyms.trim()) {
            itemPayload.synonyms = i.synonyms
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
          }
        }

        return itemPayload;
      });

      const res = await vocabularyApi.bulkCreate(formLang, payload);
      setBulkSaveResult(res);

      if (res.created.length > 0) {
        success(`Đã lưu thành công ${res.created.length} từ vào kho!`);
      }
    } catch (err: any) {
      error(getFriendlyErrorMessage(err));
    } finally {
      setIsBulkSaving(false);
    }
  };

  const handleContinueAddMore = () => {
    if (!bulkSaveResult) return;
    // Keep failed items if any, remove successfully created / existing items
    const failedTerms = new Set(bulkSaveResult.failed.map((f) => f.term).filter(Boolean));
    if (failedTerms.size > 0) {
      setPreviewItems((prev) => prev.filter((item) => failedTerms.has(item.term)));
    } else {
      setPreviewItems([]);
      setQuickInput("");
      setHasParsed(false);
    }
    setBulkSaveResult(null);
  };

  // ================= DETAILED ADD SUBMISSION =================
  const handleDetailedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim() || !meaningVi.trim()) {
      error("Vui lòng nhập từ vựng và nghĩa tiếng Việt.");
      return;
    }

    setIsDetailedSubmitting(true);
    try {
      const metadata: Record<string, any> = {};
      if (isZh) {
        metadata.simplified = term.trim();
        if (traditional.trim()) metadata.traditional = traditional.trim();
        if (pronunciation.trim()) metadata.pinyin = pronunciation.trim();
        if (/^HSK[1-6]$/.test(level)) metadata.hskLevel = Number(level.slice(3));
        if (tone) metadata.tone = tone === "neutral" ? "neutral" : Number(tone);
      } else {
        if (pronunciation.trim()) metadata.ipa = pronunciation.trim();
        if (level) metadata.cefr = level;
        if (toeicLevel) metadata.toeicLevel = toeicLevel;
        if (synonyms.trim()) {
          metadata.synonyms = synonyms.split(",").map((s) => s.trim()).filter(Boolean);
        }
      }

      const res = await vocabularyApi.create({
        language: formLang,
        term: term.trim(),
        pronunciation: pronunciation.trim() || null,
        meaningVi: meaningVi.trim(),
        partOfSpeech: partOfSpeech.trim() || null,
        example: example.trim() || null,
        exampleTranslation: exampleTranslation.trim() || null,
        topic: topic.trim() || null,
        level: level.trim() || null,
        note: note.trim() || null,
        source: "MANUAL",
        metadata,
      });

      if (res.duplicate) {
        info(`Từ "${res.item.term}" đã có trong kho từ của bạn.`);
      } else {
        success(`Đã thêm từ "${res.item.term}" thành công!`);
      }

      navigate("/vocabulary");
    } catch (err: any) {
      error(getFriendlyErrorMessage(err));
    } finally {
      setIsDetailedSubmitting(false);
    }
  };

  const selectedCount = previewItems.filter((i) => i.selected).length;

  return (
    <div className="page-container flex-col gap-6 animate-fade-in" style={{ maxWidth: "860px" }}>
      {/* Top Header & Navigation */}
      <div className="flex-row items-center justify-between" style={{ flexWrap: "wrap", gap: "12px" }}>
        <div className="flex-row items-center gap-3">
          <Link to="/vocabulary">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />}>
              Kho từ vựng
            </Button>
          </Link>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>Thêm Từ Vựng Mới</h1>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: "inline-flex",
            backgroundColor: "var(--bg-muted)",
            padding: "4px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-default)",
          }}
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "quick"}
            onClick={() => setActiveTab("quick")}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              backgroundColor: activeTab === "quick" ? "var(--bg-surface)" : "transparent",
              color: activeTab === "quick" ? "var(--accent-en-primary)" : "var(--text-secondary)",
              boxShadow: activeTab === "quick" ? "var(--shadow-xs)" : "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Zap size={15} />
            <span>Thêm nhanh</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "detailed"}
            onClick={() => setActiveTab("detailed")}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              backgroundColor: activeTab === "detailed" ? "var(--bg-surface)" : "transparent",
              color: activeTab === "detailed" ? "var(--accent-en-primary)" : "var(--text-secondary)",
              boxShadow: activeTab === "detailed" ? "var(--shadow-xs)" : "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <ListPlus size={15} />
            <span>Thêm chi tiết</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: QUICK ADD VOCABULARY ================= */}
      {activeTab === "quick" && (
        <div className="flex-col gap-6">
          <Card className="flex-col gap-6">
            <div>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 800, marginBottom: "4px" }}>
                Thêm từ nhanh
              </h2>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                Nhập nhiều từ cùng lúc. Hệ thống sẽ giúp bạn chuẩn bị thông tin trước khi lưu.
              </p>
            </div>

            {/* Language Selector */}
            <div>
              <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "8px" }}>
                Ngôn ngữ học
              </label>
              <div className="flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setFormLang("en")}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: "var(--radius-md)",
                    border: `2px solid ${formLang === "en" ? "var(--accent-en-primary)" : "var(--border-default)"}`,
                    backgroundColor: formLang === "en" ? "var(--accent-en-subtle)" : "var(--bg-surface)",
                    color: formLang === "en" ? "var(--accent-en-text)" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: "var(--text-sm)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <span>🇬🇧</span>
                  <span>Tiếng Anh (English)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormLang("zh")}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: "var(--radius-md)",
                    border: `2px solid ${formLang === "zh" ? "var(--accent-zh-primary)" : "var(--border-default)"}`,
                    backgroundColor: formLang === "zh" ? "var(--accent-zh-subtle)" : "var(--bg-surface)",
                    color: formLang === "zh" ? "var(--accent-zh-text)" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: "var(--text-sm)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <span>🇨🇳</span>
                  <span>Tiếng Trung (中文)</span>
                </button>
              </div>
            </div>

            {/* Input Textarea */}
            <div>
              <label
                htmlFor="quick-vocab-input"
                style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "6px" }}
              >
                Danh sách từ vựng
              </label>
              <textarea
                id="quick-vocab-input"
                rows={4}
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder={isZh ? "朋友, 学习, 汉语, 习惯" : "go, car, live, total\ngive up\nlook forward to"}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1.5px solid var(--border-strong)",
                  backgroundColor: "var(--bg-surface)",
                  fontSize: "var(--text-base)",
                  fontFamily: isZh ? "var(--font-chinese)" : "inherit",
                }}
              />
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: "4px" }}>
                Phân cách bằng dấu phẩy, dấu chấm phẩy hoặc xuống dòng. Cụm từ như <em>"give up"</em>, <em>"look forward to"</em> sẽ được giữ nguyên vẹn.
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex-row justify-end">
              <Button
                variant={isZh ? "zh" : "primary"}
                size="lg"
                isLoading={isPreviewLoading}
                onClick={handleAnalyzeQuickInput}
                leftIcon={<Sparkles size={18} />}
              >
                {isPreviewLoading ? `Đang tự động bổ sung ${previewItems.length || ""} từ...` : "Phân tích & tự động bổ sung"}
              </Button>
            </div>
          </Card>

          {/* ================= TERM CHIPS & PREVIEW TABLE ================= */}
          {hasParsed && previewItems.length > 0 && !bulkSaveResult && (
            <Card elevated className="flex-col gap-6 animate-fade-in">
              {/* Chips Area Header */}
              <div className="flex-row justify-between items-center" style={{ flexWrap: "wrap", gap: "10px" }}>
                <div className="flex-row items-center gap-2">
                  <span style={{ fontSize: "var(--text-base)", fontWeight: 800 }}>
                    {previewItems.length} từ được nhận diện
                  </span>
                  <Badge variant={isZh ? "zh" : "en"} size="sm">
                    {formLang === "zh" ? "Tiếng Trung" : "Tiếng Anh"}
                  </Badge>
                </div>

                <div className="flex-row items-center gap-2">
                  {previewItems.some((item) => item.enrichmentState === "failed" || !item.meaningVi.trim()) && (
                    <Button variant="outline" size="sm" onClick={() => handleRetryEnrichment()} leftIcon={<Sparkles size={14} />}>
                      Thử lại các từ lỗi
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleToggleSelectAll}>
                    {previewItems.every((i) => i.selected) ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleClearAllChips} leftIcon={<Trash2 size={14} />}>
                    Xóa tất cả
                  </Button>
                </div>
              </div>

              {/* Compact Chips Preview */}
              <div className="flex-row gap-2" style={{ flexWrap: "wrap" }}>
                {previewItems.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 10px",
                      borderRadius: "var(--radius-full)",
                      backgroundColor: item.selected
                        ? isZh
                          ? "var(--accent-zh-subtle)"
                          : "var(--accent-en-subtle)"
                        : "var(--bg-muted)",
                      color: item.selected
                        ? isZh
                          ? "var(--accent-zh-text)"
                          : "var(--accent-en-text)"
                        : "var(--text-secondary)",
                      border: `1px solid ${
                        item.selected
                          ? isZh
                            ? "var(--accent-zh-border)"
                            : "var(--accent-en-border)"
                          : "var(--border-default)"
                      }`,
                      fontSize: "var(--text-sm)",
                      fontWeight: 600,
                    }}
                  >
                    <span className={isZh ? "hanzi" : ""}>{item.term}</span>
                    {item.duplicate && (
                      <span style={{ fontSize: "var(--text-xs)", opacity: 0.7 }} title="Từ đã tồn tại trong kho">(đã có)</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveChip(idx)}
                      style={{ color: "inherit", padding: "1px", display: "flex" }}
                      aria-label={`Xóa từ ${item.term}`}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Enrichment Notice Banner if unconfigured */}
              {!enrichmentConfigured && (
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: "var(--color-info-bg)",
                    border: "1px solid var(--color-info-border)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <HelpCircle size={18} color="var(--color-info)" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--color-info-text)", lineHeight: "1.5" }}>
                    <strong>Đã nhận {previewItems.length} từ.</strong> Tính năng tự động bổ sung nghĩa và từ loại hiện chưa được cấu hình trên máy chủ. Bạn có thể nhập nhanh nghĩa tiếng Việt và chọn từ loại trực tiếp trong bảng dưới đây trước khi lưu.
                  </div>
                </div>
              )}

              {/* ================= EDITABLE ROWS TABLE ================= */}
              <div className="flex-col gap-3">
                {previewItems.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius-lg)",
                      padding: "12px 16px",
                      backgroundColor: item.selected ? "var(--bg-surface)" : "var(--bg-muted)",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    {/* Main Row Editor (Desktop: flex row, Mobile: stacked) */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "auto 1.2fr 1fr 1.5fr auto auto",
                        alignItems: "center",
                        gap: "10px",
                      }}
                      className="quick-vocab-row"
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => handleToggleSelectItem(item.id)}
                        aria-label={`Chọn từ ${item.term}`}
                        style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)" }}
                      />

                      {/* Term Input */}
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 700 }}>TỪ VỰNG</label>
                        <input
                          type="text"
                          value={item.term}
                          onChange={(e) => handleUpdateItemField(item.id, "term", e.target.value)}
                          className={isZh ? "hanzi" : ""}
                          style={{
                            width: "100%",
                            padding: "6px 8px",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border-default)",
                            backgroundColor: "var(--bg-surface)",
                            fontWeight: 700,
                            fontSize: isZh ? "1.1rem" : "var(--text-sm)",
                          }}
                        />
                        <div style={{ marginTop: "4px", fontSize: "0.7rem", color: item.enrichmentState === "failed" ? "var(--color-error)" : "var(--text-tertiary)" }}>
                          {item.enrichmentState === "loading" && <><Loader2 size={11} className="animate-spin" style={{ display: "inline", marginRight: "4px" }} />Đang dịch...</>}
                          {item.enrichmentState === "ready" && "✓ Tự động tạo"}
                          {item.enrichmentState === "partial" && "✓ Đã dịch; metadata chưa tải được"}
                          {item.enrichmentState === "failed" && (
                            <button type="button" onClick={() => handleRetryEnrichment([item.term])} style={{ color: "inherit", textDecoration: "underline" }}>Thử lại</button>
                          )}
                          {item.enrichmentState === "exists" && "Đã có trong kho"}
                        </div>
                      </div>

                      {/* Part of Speech */}
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 700 }}>TỪ LOẠI</label>
                        <select
                          value={item.partOfSpeech}
                          onChange={(e) => handleUpdateItemField(item.id, "partOfSpeech", e.target.value)}
                          style={{
                            width: "100%",
                            padding: "6px 8px",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border-default)",
                            backgroundColor: "var(--bg-surface)",
                            fontSize: "var(--text-xs)",
                          }}
                        >
                          <option value="">-- Chọn --</option>
                          <option value="noun">Danh từ (noun)</option>
                          <option value="verb">Động từ (verb)</option>
                          <option value="adjective">Tính từ (adj)</option>
                          <option value="adverb">Phó từ (adv)</option>
                          <option value="phrase">Cụm từ (phrase)</option>
                        </select>
                      </div>

                      {/* Vietnamese Meaning (Required) */}
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", color: item.meaningVi.trim() ? "var(--text-tertiary)" : "var(--color-error)", fontWeight: 700 }}>
                          NGHĨA TIẾNG VIỆT *
                        </label>
                        <input
                          type="text"
                          required
                          value={item.meaningVi}
                          onChange={(e) => handleUpdateItemField(item.id, "meaningVi", e.target.value)}
                          placeholder="Nhập nghĩa tiếng Việt..."
                          style={{
                            width: "100%",
                            padding: "6px 8px",
                            borderRadius: "var(--radius-md)",
                            border: `1.5px solid ${item.meaningVi.trim() ? "var(--border-strong)" : "var(--color-error)"}`,
                            backgroundColor: "var(--bg-surface)",
                            fontSize: "var(--text-sm)",
                          }}
                        />
                        {item.senses.length > 1 && (
                          <select
                            aria-label={`Chọn nghĩa cho ${item.term}`}
                            defaultValue="0"
                            onChange={(event) => handleChooseSense(item.id, Number(event.target.value))}
                            style={{ width: "100%", marginTop: "4px", padding: "4px 6px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-default)", fontSize: "0.7rem" }}
                          >
                            {item.senses.map((sense, senseIndex) => <option key={`${item.id}-sense-${senseIndex}`} value={senseIndex}>{sense.partOfSpeech ? `${sense.partOfSpeech}: ` : ""}{sense.meaningVi}</option>)}
                          </select>
                        )}
                      </div>

                      {/* Expand Details Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleExpandDetails(item.id)}
                        style={{
                          fontSize: "var(--text-xs)",
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "6px 8px",
                        }}
                      >
                        <span>Chi tiết</span>
                        {item.expandedDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveChip(idx)}
                        style={{ color: "var(--text-tertiary)", padding: "6px" }}
                        aria-label={`Xóa ${item.term}`}
                        title="Xóa khỏi danh sách"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Expandable Advanced Metadata */}
                    {item.expandedDetails && (
                      <div
                        className="animate-fade-in"
                        style={{
                          marginTop: "12px",
                          paddingTop: "12px",
                          borderTop: "1px dashed var(--border-default)",
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                          gap: "10px",
                        }}
                      >
                        <div>
                          <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 700 }}>
                            {isZh ? "PINYIN" : "IPA"}
                          </label>
                          <input
                            type="text"
                            value={item.pronunciation}
                            onChange={(e) => handleUpdateItemField(item.id, "pronunciation", e.target.value)}
                            placeholder={isZh ? "péngyou" : "/ˈpeɪʃəns/"}
                            style={{ width: "100%", padding: "6px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", fontSize: "var(--text-xs)" }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 700 }}>
                            {isZh ? "CẤP ĐỘ HSK" : "TRÌNH ĐỘ (CEFR)"}
                          </label>
                          <input
                            type="text"
                            value={item.level}
                            onChange={(e) => handleUpdateItemField(item.id, "level", e.target.value)}
                            placeholder={isZh ? "HSK1" : "B1, B2"}
                            style={{ width: "100%", padding: "6px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", fontSize: "var(--text-xs)" }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 700 }}>CÂU VÍ DỤ</label>
                          <input
                            type="text"
                            value={item.example}
                            onChange={(e) => handleUpdateItemField(item.id, "example", e.target.value)}
                            placeholder="Ví dụ minh họa..."
                            style={{ width: "100%", padding: "6px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", fontSize: "var(--text-xs)" }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 700 }}>DỊCH CÂU VÍ DỤ</label>
                          <input
                            type="text"
                            value={item.exampleTranslation}
                            onChange={(e) => handleUpdateItemField(item.id, "exampleTranslation", e.target.value)}
                            placeholder="Dịch nghĩa câu ví dụ..."
                            style={{ width: "100%", padding: "6px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", fontSize: "var(--text-xs)" }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Sticky Bottom Save Action Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderRadius: "var(--radius-lg)",
                  backgroundColor: "var(--bg-muted)",
                  border: "1px solid var(--border-default)",
                  marginTop: "8px",
                }}
              >
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 700 }}>
                  Đã chọn <strong>{selectedCount}</strong> / {previewItems.length} từ
                </div>

                <Button
                  variant={isZh ? "zh" : "primary"}
                  size="lg"
                  isLoading={isBulkSaving}
                  disabled={selectedCount === 0}
                  onClick={handleBulkSave}
                  leftIcon={<Bookmark size={18} />}
                >
                  {isBulkSaving ? "Đang lưu..." : `Lưu ${selectedCount} từ vào kho`}
                </Button>
              </div>
            </Card>
          )}

          {/* ================= AFTER BULK SAVE SUMMARY ================= */}
          {bulkSaveResult && (
            <Card elevated className="flex-col gap-6 animate-pop-in">
              <div className="flex-row items-center gap-3">
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: "var(--color-success-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircle2 size={28} color="var(--color-success)" />
                </div>
                <div>
                  <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 800 }}>Hoàn tất lưu từ vựng!</h2>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                    Đã xử lý xong danh sách từ vựng của bạn
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
                <div style={{ padding: "14px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-success-bg)", border: "1px solid var(--color-success-border)" }}>
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-success-text)" }}>ĐÃ THÊM MỚI</div>
                  <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--color-success-text)" }}>
                    {bulkSaveResult.created.length} từ
                  </div>
                </div>

                <div style={{ padding: "14px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--bg-muted)", border: "1px solid var(--border-default)" }}>
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-secondary)" }}>ĐÃ CÓ SẴN (TRÙNG)</div>
                  <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>
                    {bulkSaveResult.existing.length} từ
                  </div>
                </div>

                {bulkSaveResult.failed.length > 0 && (
                  <div style={{ padding: "14px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-error-bg)", border: "1px solid var(--color-error-border)" }}>
                    <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-error-text)" }}>CẦN KIỂM TRA LẠI</div>
                    <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--color-error-text)" }}>
                      {bulkSaveResult.failed.length} từ
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex-row justify-end gap-3" style={{ borderTop: "1px solid var(--border-default)", paddingTop: "var(--space-4)" }}>
                <Button variant="secondary" onClick={handleContinueAddMore} leftIcon={<Plus size={16} />}>
                  Thêm tiếp
                </Button>
                <Link to="/vocabulary">
                  <Button variant="primary" leftIcon={<Bookmark size={16} />}>
                    Xem kho từ vựng
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ================= TAB 2: DETAILED ADD (FULL PRESERVED FORM) ================= */}
      {activeTab === "detailed" && (
        <Card>
          <form onSubmit={handleDetailedSubmit} className="flex-col gap-6">
            <div>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 800, marginBottom: "4px" }}>
                Thêm từ vựng chi tiết
              </h2>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                Nhập đầy đủ thông tin ngữ pháp, ví dụ minh họa và cấp độ chứng chỉ
              </p>
            </div>

            {/* Language Selector */}
            <div>
              <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "8px" }}>
                Ngôn ngữ học
              </label>
              <div className="flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setFormLang("en")}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: "var(--radius-md)",
                    border: `2px solid ${formLang === "en" ? "var(--accent-en-primary)" : "var(--border-default)"}`,
                    backgroundColor: formLang === "en" ? "var(--accent-en-subtle)" : "var(--bg-surface)",
                    color: formLang === "en" ? "var(--accent-en-text)" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: "var(--text-sm)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <span>🇬🇧</span>
                  <span>Tiếng Anh (English)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormLang("zh")}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: "var(--radius-md)",
                    border: `2px solid ${formLang === "zh" ? "var(--accent-zh-primary)" : "var(--border-default)"}`,
                    backgroundColor: formLang === "zh" ? "var(--accent-zh-subtle)" : "var(--bg-surface)",
                    color: formLang === "zh" ? "var(--accent-zh-text)" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: "var(--text-sm)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <span>🇨🇳</span>
                  <span>Tiếng Trung (中文)</span>
                </button>
              </div>
            </div>

            {/* Primary Term and Meaning */}
            <div className="responsive-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label htmlFor="detailed-vocab-term" style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  {isZh ? "Từ vựng (Chữ Hán) *" : "Từ vựng (Term) *"}
                </label>
                <input
                  id="detailed-vocab-term"
                  type="text"
                  required
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder={isZh ? "Ví dụ: 朋友" : "Ví dụ: patience"}
                  className={isZh ? "hanzi" : ""}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1.5px solid var(--border-strong)",
                    backgroundColor: "var(--bg-surface)",
                    fontSize: isZh ? "1.25rem" : "var(--text-base)",
                    fontWeight: 600,
                  }}
                />
              </div>

              <div>
                <label htmlFor="detailed-vocab-meaning" style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Giải nghĩa tiếng Việt *
                </label>
                <input
                  id="detailed-vocab-meaning"
                  type="text"
                  required
                  value={meaningVi}
                  onChange={(e) => setMeaningVi(e.target.value)}
                  placeholder={isZh ? "Ví dụ: bạn bè" : "Ví dụ: sự kiên nhẫn"}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1.5px solid var(--border-strong)",
                    backgroundColor: "var(--bg-surface)",
                    fontSize: "var(--text-base)",
                    fontWeight: 600,
                  }}
                />
              </div>
            </div>

            {/* Pronunciation & Part of Speech & Level */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
              <div>
                <label htmlFor="detailed-vocab-pron" style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  {isZh ? "Phiên âm Pinyin" : "Phiên âm IPA"}
                </label>
                <input
                  id="detailed-vocab-pron"
                  type="text"
                  value={pronunciation}
                  onChange={(e) => setPronunciation(e.target.value)}
                  placeholder={isZh ? "péngyou" : "/ˈpeɪʃəns/"}
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

              <div>
                <label htmlFor="detailed-vocab-pos" style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Từ loại (Part of Speech)
                </label>
                <select
                  id="detailed-vocab-pos"
                  value={partOfSpeech}
                  onChange={(e) => setPartOfSpeech(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-default)",
                    backgroundColor: "var(--bg-surface)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  <option value="">-- Chọn từ loại --</option>
                  <option value="noun">Danh từ (noun)</option>
                  <option value="verb">Động từ (verb)</option>
                  <option value="adjective">Tính từ (adjective)</option>
                  <option value="adverb">Phó từ (adverb)</option>
                  <option value="phrase">Cụm từ (phrase)</option>
                  <option value="idiom">Thành ngữ (idiom)</option>
                </select>
              </div>

              <div>
                <label htmlFor="detailed-vocab-level" style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  {isZh ? "Cấp độ HSK" : "Trình độ (CEFR)"}
                </label>
                <select
                  id="detailed-vocab-level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-default)",
                    backgroundColor: "var(--bg-surface)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  <option value="">-- Chọn cấp độ --</option>
                  {isZh ? (
                    <>
                      <option value="HSK1">HSK 1</option>
                      <option value="HSK2">HSK 2</option>
                      <option value="HSK3">HSK 3</option>
                      <option value="HSK4">HSK 4</option>
                      <option value="HSK5">HSK 5</option>
                      <option value="HSK6">HSK 6</option>
                    </>
                  ) : (
                    <>
                      <option value="A1">A1 — Căn bản</option>
                      <option value="A2">A2 — Sơ cấp</option>
                      <option value="B1">B1 — Trung cấp</option>
                      <option value="B2">B2 — Trung cao cấp</option>
                      <option value="C1">C1 — Cao cấp</option>
                      <option value="C2">C2 — Thành thạo</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {!isZh && (
              <div>
                <label htmlFor="detailed-vocab-toeic" style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Dải điểm TOEIC (Metadata)
                </label>
                <select
                  id="detailed-vocab-toeic"
                  value={toeicLevel}
                  onChange={(e) => setToeicLevel(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", backgroundColor: "var(--bg-surface)", fontSize: "var(--text-sm)" }}
                >
                  <option value="">-- Không gắn dải điểm --</option>
                  <option value="10-250">10–250</option>
                  <option value="255-400">255–400</option>
                  <option value="405-600">405–600</option>
                  <option value="605-780">605–780</option>
                  <option value="785-900">785–900</option>
                  <option value="905-990">905–990</option>
                </select>
              </div>
            )}

            {/* Topic & Metadata */}
            <div className="responsive-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label htmlFor="detailed-vocab-topic" style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Chủ đề (Topic)
                </label>
                <input
                  id="detailed-vocab-topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ví dụ: Daily Life, Business, Food..."
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

              {isZh ? (
                <div>
                  <label htmlFor="detailed-vocab-tone" style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Thanh điệu (Tone)
                  </label>
                  <select
                    id="detailed-vocab-tone"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-default)",
                      backgroundColor: "var(--bg-surface)",
                      fontSize: "var(--text-sm)",
                    }}
                  >
                    <option value="">-- Chọn thanh điệu --</option>
                    <option value="1">Thanh 1 (Âm Bình: ā)</option>
                    <option value="2">Thanh 2 (Dương Bình: á)</option>
                    <option value="3">Thanh 3 (Thượng Thanh: ǎ)</option>
                    <option value="4">Thanh 4 (Khứ Thanh: à)</option>
                    <option value="neutral">Thanh nhẹ (Khinh Thanh: a)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label htmlFor="detailed-vocab-synonyms" style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Từ đồng nghĩa (Cách nhau bởi dấu phẩy)
                  </label>
                  <input
                    id="detailed-vocab-synonyms"
                    type="text"
                    value={synonyms}
                    onChange={(e) => setSynonyms(e.target.value)}
                    placeholder="endurance, tolerance, forbearance"
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
              )}
            </div>

            {/* Example and Translation */}
            <div>
              <label htmlFor="detailed-vocab-example" style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Câu ví dụ minh họa
              </label>
              <textarea
                id="detailed-vocab-example"
                rows={2}
                value={example}
                onChange={(e) => setExample(e.target.value)}
                placeholder={isZh ? "Ví dụ: 他是我的好朋友。" : "Ví dụ: Learning a language takes time and patience."}
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

            <div>
              <label htmlFor="detailed-vocab-example-trans" style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Bản dịch tiếng Việt của câu ví dụ
              </label>
              <input
                id="detailed-vocab-example-trans"
                type="text"
                value={exampleTranslation}
                onChange={(e) => setExampleTranslation(e.target.value)}
                placeholder="Dịch nghĩa câu ví dụ trên..."
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

            {/* Submit Actions */}
            <div className="flex-row justify-end gap-3" style={{ borderTop: "1px solid var(--border-default)", paddingTop: "var(--space-4)" }}>
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant={isZh ? "zh" : "primary"}
                size="lg"
                isLoading={isDetailedSubmitting}
                leftIcon={<Plus size={18} />}
              >
                Lưu vào kho từ vựng
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
