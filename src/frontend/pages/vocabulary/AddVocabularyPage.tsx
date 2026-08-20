import React, { useCallback, useRef, useState } from "react";
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
  Bookmark,
  Tags,
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
import {
  parseStructuredQuickVocabularyInput,
  isLikelyIpa,
  normalizeLocalTerm,
  type ParsedQuickVocabularyDraft,
} from "../../static/localDomain";
import { getVocabularyTopics, normalizeVocabularyTopics } from "../../../shared/vocabularyIntelligence";
import { QuickAddPreviewRows } from "./QuickAddPreviewRows";
import { QuickAddTopicPicker } from "./QuickAddTopicPicker";

type TabMode = "quick" | "detailed";
type TopicPickerTarget = { mode: "batch" } | { mode: "item"; itemId: string };

export interface EditablePreviewItem {
  id: string;
  existingId?: string;
  needsRepair?: boolean;
  hasUpdate?: boolean;
  repairAccepted: boolean;
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
  topics: string[];
  suggestedTopics: string[];
  level: string;
  toeicLevel: string;
  tone: string;
  traditional: string;
  selected: boolean;
  expandedDetails: boolean;
  senses: VocabularySenseSuggestion[];
  lexicalStatus?: "VALID" | "UNCERTAIN" | "INVALID";
  lexicalReason?: string;
  enrichmentState: "loading" | "ready" | "partial" | "invalid" | "failed" | "exists";
  enrichmentError?: string;
  sourceDraft?: ParsedQuickVocabularyDraft;
}

export const updatePreviewItemField = <K extends keyof EditablePreviewItem>(
  items: EditablePreviewItem[],
  id: string,
  field: K,
  value: EditablePreviewItem[K],
): EditablePreviewItem[] => items.map((item) => (
  item.id === id ? { ...item, [field]: value } : item
));

export function mergeQuickSynonyms(userSynonyms: string[] = [], aiSynonyms: string[] = []): string[] {
  const seen = new Set<string>();
  return [...userSynonyms, ...aiSynonyms].flatMap((value) => {
    const display = value.normalize("NFKC").trim().replace(/\s+/gu, " ");
    const key = display.toLocaleLowerCase("en-US");
    if (!display || seen.has(key)) return [];
    seen.add(key);
    return [display];
  });
}

export function mergeQuickTopics(existing: string[] = [], additions: string[] = []): string[] {
  return normalizeVocabularyTopics([...existing, ...additions]);
}

export function getSuggestedQuickTopics(suggestion: Pick<BulkVocabularyPreview["items"][number]["suggestion"], "suggestedTopics" | "topic">): string[] {
  // `topic` is a legacy single-topic AI response. Treat it as a suggestion too:
  // no AI-proposed label may become an assigned topic without a user action.
  return mergeQuickTopics(suggestion.suggestedTopics ?? [], suggestion.topic ? [suggestion.topic] : []);
}

const toEditablePreview = (
  item: BulkVocabularyPreview["items"][number],
  idx: number,
  language: Language = "en",
  draft?: ParsedQuickVocabularyDraft,
): EditablePreviewItem => {
  const isChinese = language === "zh" || Boolean(item.suggestion.pinyin);
  const rawIpa = item.suggestion.ipa;
  const rawPron = item.suggestion.pronunciation;
  const validIpa = isLikelyIpa(rawIpa) ? rawIpa : isLikelyIpa(rawPron) ? rawPron : "";
  const pronunciation = isChinese
    ? (item.suggestion.pinyin || item.suggestion.pronunciation || item.suggestion.ipa || "")
    : (validIpa || "");
  const ipa = isChinese ? undefined : (validIpa || undefined);
  const pinyin = item.suggestion.pinyin || (isChinese && pronunciation ? pronunciation : undefined);

  const isDuplicate = item.duplicate;
  const isNeedsRepair = Boolean(item.suggestion.needsRepair);
  const hasUpdate = Boolean(item.suggestion.hasUpdate);
  const existingId = item.suggestion.existingId;

  return {
    id: `${item.normalizedTerm}-${idx}`,
    existingId,
    needsRepair: isNeedsRepair,
    hasUpdate,
    repairAccepted: false,
    term: draft?.term ?? item.term,
    normalizedTerm: item.normalizedTerm,
    duplicate: item.duplicate,
    meaningVi: draft?.meaningVi ?? item.suggestion.meaningVi ?? "",
    partOfSpeech: draft?.partOfSpeech ?? item.suggestion.partOfSpeech ?? "",
    pronunciation,
    ipa,
    pinyin,
    synonyms: mergeQuickSynonyms(draft?.synonyms, item.suggestion.synonyms).join(", "),
    example: item.suggestion.example || "",
    exampleTranslation: item.suggestion.exampleTranslation || "",
    topic: "",
    topics: [],
    suggestedTopics: getSuggestedQuickTopics(item.suggestion),
    level: item.suggestion.cefr || (item.suggestion.hskLevel ? `HSK${item.suggestion.hskLevel}` : ""),
    toeicLevel: item.suggestion.toeicLevel || "",
    tone: item.suggestion.toneData?.[0] !== undefined ? String(item.suggestion.toneData[0]) : "",
    traditional: item.suggestion.traditional || "",
    selected: item.status !== "INVALID",
    expandedDetails: false,
    senses: item.suggestion.senses || [],
    lexicalStatus: item.suggestion.lexicalStatus,
    lexicalReason: item.suggestion.lexicalReason,
    enrichmentState: item.duplicate ? "exists" : item.error ? "failed" : item.status === "INVALID" ? "invalid" : item.status === "READY" ? "ready" : "partial",
    enrichmentError: item.error?.message,
    sourceDraft: draft,
  };
};

const loadingPreview = (draft: ParsedQuickVocabularyDraft, index: number, language: Language): EditablePreviewItem => ({
  id: `loading-${index}`,
  term: draft.term,
  normalizedTerm: normalizeLocalTerm(draft.term, language),
  duplicate: false,
  meaningVi: draft.meaningVi ?? "",
  partOfSpeech: draft.partOfSpeech ?? "",
  pronunciation: "",
  synonyms: (draft.synonyms ?? []).join(", "),
  example: "",
  exampleTranslation: "",
  topic: "",
  topics: [],
  suggestedTopics: [],
  level: "",
  toeicLevel: "",
  tone: "",
  traditional: "",
  selected: true,
  expandedDetails: false,
  senses: [],
  repairAccepted: false,
  enrichmentState: "loading",
  sourceDraft: draft,
});

const mergeRetryPreview = (replacement: EditablePreviewItem, current: EditablePreviewItem): EditablePreviewItem => ({
  ...replacement,
  id: current.id,
  selected: current.selected,
  expandedDetails: current.expandedDetails,
  term: current.term,
  meaningVi: current.meaningVi.trim() ? current.meaningVi : replacement.meaningVi,
  partOfSpeech: current.partOfSpeech.trim() ? current.partOfSpeech : replacement.partOfSpeech,
  synonyms: mergeQuickSynonyms(current.synonyms.split(","), replacement.synonyms.split(",")).join(", "),
  example: current.example.trim() ? current.example : replacement.example,
  exampleTranslation: current.exampleTranslation.trim() ? current.exampleTranslation : replacement.exampleTranslation,
  topic: current.topic,
  topics: current.topics,
  suggestedTopics: replacement.suggestedTopics.filter((suggestion) => !current.topics.some((topic) => (
    topic.localeCompare(suggestion, undefined, { sensitivity: "accent" }) === 0
  ))),
  sourceDraft: current.sourceDraft,
});

const needsEnrichmentRetry = (item: EditablePreviewItem): boolean =>
  !item.duplicate &&
  (
    item.enrichmentState === "failed" ||
    !item.meaningVi.trim()
  );

export const AddVocabularyPage: React.FC = () => {
  const { language: currentAppLang } = useLanguage();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabMode>("quick");
  const [formLang, setFormLang] = useState<Language>(currentAppLang);

  // Quick Add State
  const [quickInput, setQuickInput] = useState("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isRetryingEnrichment, setIsRetryingEnrichment] = useState(false);
  const [enrichmentConfigured, setEnrichmentConfigured] = useState<boolean>(true);
  const [previewItems, setPreviewItems] = useState<EditablePreviewItem[]>([]);
  const previewItemsRef = useRef(previewItems);
  previewItemsRef.current = previewItems;
  const analyzeGenerationRef = useRef(0);
  const [hasParsed, setHasParsed] = useState(false);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [bulkSaveResult, setBulkSaveResult] = useState<BulkVocabularyCreateResult | null>(null);
  const [topicPickerTarget, setTopicPickerTarget] = useState<TopicPickerTarget | null>(null);
  const [topicPickerSelection, setTopicPickerSelection] = useState<string[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const loadedTopicLanguagesRef = useRef(new Set<Language>());

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
  const invalidateQuickAnalysis = useCallback(() => {
    analyzeGenerationRef.current += 1;
    setPreviewItems([]);
    setHasParsed(false);
    setBulkSaveResult(null);
    setIsPreviewLoading(false);
    setIsRetryingEnrichment(false);
    setTopicPickerTarget(null);
  }, []);

  const handleQuickInputChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextInput = event.target.value;
    if (nextInput === quickInput) return;
    setQuickInput(nextInput);
    invalidateQuickAnalysis();
  }, [invalidateQuickAnalysis, quickInput]);

  const handleFormLanguageChange = useCallback((nextLanguage: Language) => {
    if (nextLanguage === formLang) return;
    setFormLang(nextLanguage);
    invalidateQuickAnalysis();
  }, [formLang, invalidateQuickAnalysis]);

  const handleAnalyzeQuickInput = async () => {
    const requestGeneration = analyzeGenerationRef.current + 1;
    analyzeGenerationRef.current = requestGeneration;
    const inputSnapshot = quickInput;
    const languageSnapshot = formLang;
    const isLatestRequest = () => analyzeGenerationRef.current === requestGeneration;

    if (!inputSnapshot.trim()) {
      error("Vui lòng nhập ít nhất một từ vựng.");
      return;
    }

    setIsPreviewLoading(true);
    setBulkSaveResult(null);
    let drafts: ParsedQuickVocabularyDraft[];
    try {
      drafts = parseStructuredQuickVocabularyInput(inputSnapshot, languageSnapshot);
      if (!isLatestRequest()) return;
      setPreviewItems(drafts.map((draft, idx) => loadingPreview(draft, idx, languageSnapshot)));
      setHasParsed(true);
    } catch (caught) {
      if (!isLatestRequest()) return;
      error(getFriendlyErrorMessage(caught));
      setIsPreviewLoading(false);
      return;
    }
    try {
      const res = await vocabularyApi.bulkPreview(languageSnapshot, drafts.map((draft) => draft.term).join("\n"));
      if (!isLatestRequest()) return;
      setEnrichmentConfigured(res.enrichment.configured);
      const responseByTerm = new Map(res.items.map((item) => [normalizeLocalTerm(item.term, languageSnapshot), item]));
      const items = drafts.map((draft, idx) => {
        const responseItem = responseByTerm.get(normalizeLocalTerm(draft.term, languageSnapshot));
        if (!responseItem) {
          return {
            ...loadingPreview(draft, idx, languageSnapshot),
            enrichmentState: "failed" as const,
            enrichmentError: "Không nhận được dữ liệu bổ sung cho từ này.",
          };
        }
        return toEditablePreview(responseItem, idx, languageSnapshot, draft);
      });

      setPreviewItems(items);
      setHasParsed(true);
      if (items.length > 0) {
        success(`Đã nhận diện thành công ${items.length} từ!`);
      }
    } catch (err: any) {
      if (!isLatestRequest()) return;
      setPreviewItems((items) => items.map((item) => ({ ...item, enrichmentState: "failed", enrichmentError: getFriendlyErrorMessage(err) })));
      error(getFriendlyErrorMessage(err));
    } finally {
      if (isLatestRequest()) setIsPreviewLoading(false);
    }
  };

  const handleRetryEnrichment = useCallback(async (terms?: string[]) => {
    const requestGeneration = analyzeGenerationRef.current;
    const languageSnapshot = formLang;
    const isCurrentAnalysis = () => analyzeGenerationRef.current === requestGeneration;
    const targets = terms ?? previewItemsRef.current.filter(needsEnrichmentRetry).map((item) => item.term);
    if (!targets.length) return;
    const normalizedTargets = new Set(targets.map((term) => normalizeLocalTerm(term, languageSnapshot)));
    setIsRetryingEnrichment(true);
    setPreviewItems((items) => items.map((item) => normalizedTargets.has(item.normalizedTerm) ? { ...item, enrichmentState: "loading", enrichmentError: undefined } : item));
    try {
      const res = await vocabularyApi.bulkPreview(languageSnapshot, targets.join("\n"), true);
      if (!isCurrentAnalysis()) return;
      const replacements = new Map(res.items.map((item, idx) => [normalizeLocalTerm(item.term, languageSnapshot), toEditablePreview(item, idx, languageSnapshot)]));
      setPreviewItems((items) => items.map((item) => {
        const replacement = replacements.get(item.normalizedTerm);
        return replacement ? mergeRetryPreview(replacement, item) : item;
      }));
    } catch (caught) {
      if (!isCurrentAnalysis()) return;
      setPreviewItems((items) => items.map((item) => normalizedTargets.has(item.normalizedTerm) ? { ...item, enrichmentState: "failed", enrichmentError: getFriendlyErrorMessage(caught) } : item));
      error(getFriendlyErrorMessage(caught));
    } finally {
      if (isCurrentAnalysis()) setIsRetryingEnrichment(false);
    }
  }, [error, formLang]);

  const handleChooseSense = useCallback((id: string, senseIndex: number) => {
    setPreviewItems((items) => items.map((item) => {
      if (item.id !== id) return item;
      const sense = item.senses[senseIndex];
      if (!sense) return item;
      const newPronunciation = formLang === "zh"
        ? (sense.pinyin || sense.pronunciation || sense.ipa || item.pronunciation)
        : (sense.ipa || sense.pronunciation || item.pronunciation);
      return {
        ...item,
        meaningVi: item.sourceDraft?.meaningVi ?? sense.meaningVi ?? item.meaningVi,
        partOfSpeech: item.sourceDraft?.partOfSpeech ?? sense.partOfSpeech ?? item.partOfSpeech,
        pronunciation: newPronunciation,
        ipa: sense.ipa || (formLang === "en" ? newPronunciation : item.ipa),
        pinyin: sense.pinyin || (formLang === "zh" ? newPronunciation : item.pinyin),
        synonyms: mergeQuickSynonyms(item.sourceDraft?.synonyms, sense.synonyms ?? item.synonyms.split(",")).join(", "),
        example: sense.example !== undefined ? sense.example : item.example,
        exampleTranslation: sense.exampleTranslation !== undefined ? sense.exampleTranslation : item.exampleTranslation,
      };
    }));
  }, [formLang]);

  const handleRemoveChip = (indexToRemove: number) => {
    setPreviewItems((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleClearAllChips = () => {
    setPreviewItems([]);
    setHasParsed(false);
    setBulkSaveResult(null);
  };

  const handleToggleSelectAll = () => {
    setPreviewItems((prev) => {
      const allSelected = prev.every((item) => item.selected);
      return prev.map((item) => ({ ...item, selected: !allSelected }));
    });
  };

  const handleToggleSelectItem = useCallback((id: string) => {
    setPreviewItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i))
    );
  }, []);

  const handleUpdateItemField = useCallback(<K extends keyof EditablePreviewItem>(
    id: string,
    field: K,
    value: EditablePreviewItem[K],
  ) => {
    setPreviewItems((prev) => updatePreviewItemField(prev, id, field, value));
  }, []);

  const handleToggleExpandDetails = useCallback((id: string) => {
    setPreviewItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, expandedDetails: !i.expandedDetails } : i))
    );
  }, []);

  const handleAcceptRepair = useCallback((id: string) => {
    setPreviewItems((prev) => prev.map((item) => item.id === id ? { ...item, repairAccepted: true } : item));
  }, []);

  const handleRemovePreviewItem = useCallback((id: string) => {
    setPreviewItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const loadAvailableTopics = useCallback(async () => {
    if (loadedTopicLanguagesRef.current.has(formLang)) return;
    loadedTopicLanguagesRef.current.add(formLang);
    setIsLoadingTopics(true);
    try {
      const vocabulary = await vocabularyApi.list({ language: formLang, limit: 100 });
      const savedTopics = vocabulary.flatMap((item) => getVocabularyTopics(item));
      setAvailableTopics((current) => mergeQuickTopics(current, savedTopics));
    } catch (caught) {
      loadedTopicLanguagesRef.current.delete(formLang);
      info(`Không thể tải danh sách chủ đề đã lưu: ${getFriendlyErrorMessage(caught)}`);
    } finally {
      setIsLoadingTopics(false);
    }
  }, [formLang, info]);

  const handleOpenBatchTopics = useCallback(() => {
    setAvailableTopics((current) => mergeQuickTopics(current, previewItemsRef.current.flatMap((item) => item.topics)));
    setTopicPickerSelection([]);
    setTopicPickerTarget({ mode: "batch" });
    void loadAvailableTopics();
  }, [loadAvailableTopics]);

  const handleOpenItemTopics = useCallback((itemId: string) => {
    const item = previewItemsRef.current.find((candidate) => candidate.id === itemId);
    if (!item) return;
    setAvailableTopics((current) => mergeQuickTopics(current, previewItemsRef.current.flatMap((candidate) => candidate.topics)));
    setTopicPickerSelection(item.topics);
    setTopicPickerTarget({ mode: "item", itemId });
    void loadAvailableTopics();
  }, [loadAvailableTopics]);

  const handleToggleTopic = useCallback((topicToToggle: string) => {
    setTopicPickerSelection((current) => {
      const exists = current.some((topicValue) => topicValue.localeCompare(topicToToggle, undefined, { sensitivity: "accent" }) === 0);
      return exists
        ? current.filter((topicValue) => topicValue.localeCompare(topicToToggle, undefined, { sensitivity: "accent" }) !== 0)
        : mergeQuickTopics(current, [topicToToggle]);
    });
  }, []);

  const handleCreateTopic = useCallback((rawTopic: string) => {
    const normalized = normalizeVocabularyTopics([rawTopic])[0];
    if (!normalized) return;
    const existing = availableTopics.find((topicValue) => topicValue.localeCompare(normalized, undefined, { sensitivity: "accent" }) === 0);
    const display = existing ?? normalized;
    setAvailableTopics((current) => mergeQuickTopics(current, [display]));
    setTopicPickerSelection((selected) => mergeQuickTopics(selected, [display]));
  }, [availableTopics]);

  const handleApplyTopics = useCallback(() => {
    if (!topicPickerTarget) return;
    setPreviewItems((current) => current.map((item) => {
      if (topicPickerTarget.mode === "batch" && !item.selected) return item;
      if (topicPickerTarget.mode === "item" && item.id !== topicPickerTarget.itemId) return item;
      const topics = topicPickerTarget.mode === "batch"
        ? mergeQuickTopics(item.topics, topicPickerSelection)
        : normalizeVocabularyTopics(topicPickerSelection);
      return {
        ...item,
        topics,
        topic: topics[0] ?? (topicPickerTarget.mode === "item" ? "" : item.topic),
        suggestedTopics: item.suggestedTopics.filter((suggestion) => !topics.some((topic) => (
          topic.localeCompare(suggestion, undefined, { sensitivity: "accent" }) === 0
        ))),
      };
    }));
    setTopicPickerTarget(null);
  }, [topicPickerSelection, topicPickerTarget]);

  const handleRemoveTopic = useCallback((itemId: string, topicToRemove: string) => {
    setPreviewItems((current) => current.map((item) => {
      if (item.id !== itemId) return item;
      const topics = item.topics.filter((topicValue) => topicValue.localeCompare(topicToRemove, undefined, { sensitivity: "accent" }) !== 0);
      return { ...item, topics, topic: topics[0] ?? "" };
    }));
  }, []);

  const handleAcceptSuggestedTopic = useCallback((itemId: string, suggestedTopic: string) => {
    setPreviewItems((current) => current.map((item) => {
      if (item.id !== itemId) return item;
      const topics = mergeQuickTopics(item.topics, [suggestedTopic]);
      return {
        ...item,
        topics,
        topic: topics[0] ?? "",
        suggestedTopics: item.suggestedTopics.filter((topic) => (
          topic.localeCompare(suggestedTopic, undefined, { sensitivity: "accent" }) !== 0
        )),
      };
    }));
  }, []);

  const handleDismissSuggestedTopic = useCallback((itemId: string, suggestedTopic: string) => {
    setPreviewItems((current) => current.map((item) => (
      item.id === itemId
        ? {
          ...item,
          suggestedTopics: item.suggestedTopics.filter((topic) => (
            topic.localeCompare(suggestedTopic, undefined, { sensitivity: "accent" }) !== 0
          )),
        }
        : item
    )));
  }, []);

  const handleCloseTopicPicker = useCallback(() => setTopicPickerTarget(null), []);

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
        const topics = normalizeVocabularyTopics([...i.topics, i.topic]);
        const itemPayload: BulkVocabularyInputItem = {
          term: i.term.trim(),
          meaningVi: i.meaningVi.trim(),
          partOfSpeech: i.partOfSpeech.trim() || undefined,
          pronunciation: i.pronunciation.trim() || undefined,
          example: i.example.trim() || undefined,
          exampleTranslation: i.exampleTranslation.trim() || undefined,
          topic: topics[0] ?? (i.topic.trim() || undefined),
          topics,
        };
        if (i.repairAccepted && i.needsRepair && i.hasUpdate && i.existingId) {
          itemPayload.existingId = i.existingId;
          itemPayload.repairExisting = true;
        }

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
  const topicPickerTargetLabel = topicPickerTarget?.mode === "item"
    ? `“${previewItems.find((item) => item.id === topicPickerTarget.itemId)?.term ?? "từ này"}”`
    : `${selectedCount} từ đã chọn`;

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
                  onClick={() => handleFormLanguageChange("en")}
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
                  onClick={() => handleFormLanguageChange("zh")}
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
                onChange={handleQuickInputChange}
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
                Hỗ trợ danh sách đơn giản và dữ liệu có cấu trúc như <em>"additionally (adv)"</em>, <em>"barely: vừa đủ."</em>. Cụm từ vẫn được giữ nguyên vẹn.
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
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedCount === 0}
                    onClick={handleOpenBatchTopics}
                    leftIcon={<Tags size={14} />}
                  >
                    Thêm vào chủ đề
                  </Button>
                  {previewItems.some(needsEnrichmentRetry) && (
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={isRetryingEnrichment}
                      disabled={isRetryingEnrichment || isPreviewLoading || isBulkSaving}
                      onClick={() => handleRetryEnrichment()}
                      leftIcon={<Sparkles size={14} />}
                    >
                      {isRetryingEnrichment ? "Đang thử lại..." : "Thử lại các từ lỗi"}
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
                      <span style={{ fontSize: "var(--text-xs)", opacity: 0.7 }} title={item.needsRepair ? "Từ đã tồn tại nhưng có dữ liệu cũ cần cập nhật" : "Từ đã tồn tại trong kho"}>
                        {item.needsRepair ? "(đã có · dữ liệu cũ)" : "(đã có)"}
                      </span>
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
              <QuickAddPreviewRows
                items={previewItems}
                isZh={isZh}
                onToggleSelect={handleToggleSelectItem}
                onUpdateField={handleUpdateItemField}
                onToggleDetails={handleToggleExpandDetails}
                onRemove={handleRemovePreviewItem}
                onRetry={handleRetryEnrichment}
                onAcceptRepair={handleAcceptRepair}
                onChooseSense={handleChooseSense}
                onOpenTopics={handleOpenItemTopics}
                onRemoveTopic={handleRemoveTopic}
                onAcceptSuggestedTopic={handleAcceptSuggestedTopic}
                onDismissSuggestedTopic={handleDismissSuggestedTopic}
              />

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
                  disabled={selectedCount === 0 || isPreviewLoading}
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
                  onClick={() => handleFormLanguageChange("en")}
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
                  onClick={() => handleFormLanguageChange("zh")}
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

      <QuickAddTopicPicker
        isOpen={topicPickerTarget !== null}
        availableTopics={availableTopics}
        selectedTopics={topicPickerSelection}
        targetLabel={topicPickerTargetLabel}
        isLoading={isLoadingTopics}
        onToggle={handleToggleTopic}
        onCreate={handleCreateTopic}
        onApply={handleApplyTopics}
        onClose={handleCloseTopicPicker}
      />
    </div>
  );
};
