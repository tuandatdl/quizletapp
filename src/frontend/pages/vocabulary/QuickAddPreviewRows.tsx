import React from "react";
import { ChevronDown, ChevronUp, Loader2, Plus, Sparkles, X } from "lucide-react";
import type { EditablePreviewItem } from "./AddVocabularyPage";

export interface QuickAddPreviewRowProps {
  item: EditablePreviewItem;
  isZh: boolean;
  onToggleSelect: (id: string) => void;
  onUpdateField: <K extends keyof EditablePreviewItem>(id: string, field: K, value: EditablePreviewItem[K]) => void;
  onToggleDetails: (id: string) => void;
  onRemove: (id: string) => void;
  onRetry: (terms: string[]) => void;
  onAcceptRepair: (id: string) => void;
  onChooseSense: (id: string, senseIndex: number) => void;
  onOpenTopics: (id: string) => void;
  onRemoveTopic: (id: string, topic: string) => void;
  onAcceptSuggestedTopic: (id: string, topic: string) => void;
  onDismissSuggestedTopic: (id: string, topic: string) => void;
  onRender?: (id: string) => void;
}

export const QuickAddPreviewRow = React.memo(function QuickAddPreviewRow({
  item,
  isZh,
  onToggleSelect,
  onUpdateField,
  onToggleDetails,
  onRemove,
  onRetry,
  onAcceptRepair,
  onChooseSense,
  onOpenTopics,
  onRemoveTopic,
  onAcceptSuggestedTopic,
  onDismissSuggestedTopic,
  onRender,
}: QuickAddPreviewRowProps): React.ReactElement {
  onRender?.(item.id);
  return (
    <div
      style={{
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        padding: "12px 16px",
        backgroundColor: item.selected ? "var(--bg-surface)" : "var(--bg-muted)",
        transition: "all var(--transition-fast)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1.2fr 0.9fr 1fr 1.5fr auto auto",
          alignItems: "center",
          gap: "10px",
        }}
        className="quick-vocab-row"
      >
        <input
          type="checkbox"
          checked={item.selected}
          onChange={() => onToggleSelect(item.id)}
          aria-label={`Chọn từ ${item.term}`}
          style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)" }}
        />

        <div>
          <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 700 }}>TỪ VỰNG</label>
          <input
            type="text"
            value={item.term}
            onChange={(event) => onUpdateField(item.id, "term", event.target.value)}
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
            {item.enrichmentState === "invalid" && (
              <span style={{ color: "var(--color-warning, #d97706)", fontWeight: 600 }}>
                ⚠ Có thể đây không phải từ tiếng Anh chuẩn{item.lexicalReason ? `: ${item.lexicalReason}` : ""}. Không được chọn để lưu tự động.
              </span>
            )}
            {item.enrichmentState === "failed" && (
              <button type="button" onClick={() => onRetry([item.term])} style={{ color: "inherit", textDecoration: "underline" }}>Thử lại</button>
            )}
            {item.enrichmentState === "exists" && (
              item.hasUpdate ? (
                item.repairAccepted ? (
                  <span style={{ color: "var(--color-success, #16a34a)", fontWeight: 500 }}>✓ Đã chọn cập nhật bằng AI khi lưu</span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "var(--color-success, #16a34a)", fontWeight: 500 }}>Có bản cập nhật đề xuất</span>
                    <button type="button" onClick={() => onAcceptRepair(item.id)} style={{ background: "none", border: "none", color: "var(--accent-en-primary, #2563eb)", textDecoration: "underline", cursor: "pointer", fontSize: "0.7rem", padding: 0, display: "inline-flex", alignItems: "center", gap: "2px", fontWeight: 600 }}>
                      <Sparkles size={11} /> Cập nhật bằng AI
                    </button>
                  </span>
                )
              ) : item.needsRepair ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "var(--color-warning, #d97706)", fontWeight: 500 }}>Đã có trong kho · dữ liệu cũ</span>
                  <button type="button" onClick={() => onRetry([item.term])} style={{ background: "none", border: "none", color: "var(--accent-en-primary, #2563eb)", textDecoration: "underline", cursor: "pointer", fontSize: "0.7rem", padding: 0, display: "inline-flex", alignItems: "center", gap: "2px", fontWeight: 600 }}>
                    <Sparkles size={11} /> Cập nhật bằng AI
                  </button>
                </span>
              ) : !item.meaningVi.trim() ? (
                <span style={{ color: "var(--color-warning, #d97706)" }}>Từ này đã có trong kho nhưng thiếu thông tin</span>
              ) : (
                "Đã có trong kho"
              )
            )}
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 700 }}>TỪ LOẠI</label>
          <select
            value={item.partOfSpeech}
            onChange={(event) => onUpdateField(item.id, "partOfSpeech", event.target.value)}
            style={{ width: "100%", padding: "6px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", backgroundColor: "var(--bg-surface)", fontSize: "var(--text-xs)" }}
          >
            <option value="">-- Chọn --</option>
            <option value="noun">Danh từ (noun)</option>
            <option value="verb">Động từ (verb)</option>
            <option value="adjective">Tính từ (adj)</option>
            <option value="adverb">Phó từ (adv)</option>
            <option value="phrasal verb">Cụm ĐT (phrasal verb)</option>
            <option value="phrase">Cụm từ (phrase)</option>
            <option value="idiom">Thành ngữ (idiom)</option>
            <option value="pronoun">Đại từ (pronoun)</option>
            <option value="preposition">Giới từ (prep)</option>
            <option value="conjunction">Liên từ (conj)</option>
            <option value="determiner">Từ hạn định (det)</option>
            <option value="interjection">Thán từ (interj)</option>
            {item.partOfSpeech && !["noun", "verb", "adjective", "adverb", "phrasal verb", "phrase", "idiom", "pronoun", "preposition", "conjunction", "determiner", "interjection"].includes(item.partOfSpeech) && (
              <option value={item.partOfSpeech}>{item.partOfSpeech}</option>
            )}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 700 }}>{isZh ? "PINYIN" : "PHIÊN ÂM (IPA)"}</label>
          <input
            type="text"
            value={item.pronunciation}
            onChange={(event) => onUpdateField(item.id, "pronunciation", event.target.value)}
            placeholder={isZh ? "xuéxí" : "/ɡoʊ/"}
            style={{ width: "100%", padding: "6px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", backgroundColor: "var(--bg-surface)", fontSize: "var(--text-xs)" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.7rem", color: item.meaningVi.trim() ? "var(--text-tertiary)" : "var(--color-error)", fontWeight: 700 }}>NGHĨA TIẾNG VIỆT *</label>
          <input
            type="text"
            required
            value={item.meaningVi}
            onChange={(event) => onUpdateField(item.id, "meaningVi", event.target.value)}
            placeholder="Nhập nghĩa tiếng Việt..."
            style={{ width: "100%", padding: "6px 8px", borderRadius: "var(--radius-md)", border: `1.5px solid ${item.meaningVi.trim() ? "var(--border-strong)" : "var(--color-error)"}`, backgroundColor: "var(--bg-surface)", fontSize: "var(--text-sm)" }}
          />
          {item.senses.length > 1 && (
            <div style={{ marginTop: "4px" }}>
              <select
                aria-label={`Chọn nghĩa cho ${item.term}`}
                defaultValue="0"
                onChange={(event) => onChooseSense(item.id, Number(event.target.value))}
                style={{ width: "100%", padding: "4px 6px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-default)", fontSize: "0.7rem", backgroundColor: "var(--bg-surface)" }}
              >
                {item.senses.map((sense, senseIndex) => (
                  <option key={`${item.id}-sense-${senseIndex}`} value={senseIndex}>
                    {senseIndex + 1}. {sense.partOfSpeech ? `[${sense.partOfSpeech}] ` : ""}{sense.ipa || sense.pinyin ? `${sense.ipa || sense.pinyin} ` : ""}{sense.meaningVi}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button type="button" onClick={() => onToggleDetails(item.id)} style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px", padding: "6px 8px" }}>
          <span>Chi tiết</span>
          {item.expandedDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <button type="button" onClick={() => onRemove(item.id)} style={{ color: "var(--text-tertiary)", padding: "6px" }} aria-label={`Xóa ${item.term}`} title="Xóa khỏi danh sách">
          <X size={16} />
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
        <span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 700 }}>CHỦ ĐỀ</span>
        {item.topics.map((topic) => (
          <span
            key={topic.toLocaleLowerCase()}
            style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 7px", borderRadius: "var(--radius-full)", background: "var(--bg-muted)", border: "1px solid var(--border-default)", fontSize: "var(--text-xs)" }}
          >
            {topic}
            <button type="button" onClick={() => onRemoveTopic(item.id, topic)} aria-label={`Gỡ chủ đề ${topic} khỏi ${item.term}`} style={{ display: "flex", color: "var(--text-tertiary)" }}>
              <X size={11} />
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={() => onOpenTopics(item.id)}
          aria-label={`Thêm chủ đề cho ${item.term}`}
          style={{ display: "inline-flex", alignItems: "center", gap: "3px", padding: "3px 7px", color: "var(--accent-en-primary)", fontSize: "var(--text-xs)", fontWeight: 600 }}
        >
          <Plus size={12} /> Thêm chủ đề
        </button>
      </div>

      {item.suggestedTopics.length > 0 && (
        <div
          aria-label={`Gợi ý chủ đề cho ${item.term}`}
          style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}
        >
          <span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 700 }}>GỢI Ý CHỦ ĐỀ</span>
          {item.suggestedTopics.map((topic) => (
            <span key={topic.toLocaleLowerCase()} style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
              <button
                type="button"
                onClick={() => onAcceptSuggestedTopic(item.id, topic)}
                aria-label={`Thêm gợi ý chủ đề ${topic} cho ${item.term}`}
                title={`Thêm ${topic} vào chủ đề`}
                style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 7px", borderRadius: "var(--radius-full)", background: "var(--accent-en-subtle)", border: "1px dashed var(--accent-en-border)", color: "var(--accent-en-text)", fontSize: "var(--text-xs)", fontWeight: 600, cursor: "pointer" }}
              >
                {topic} <Plus size={11} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onDismissSuggestedTopic(item.id, topic)}
                aria-label={`Bỏ gợi ý chủ đề ${topic} cho ${item.term}`}
                title={`Bỏ gợi ý ${topic}`}
                style={{ display: "inline-flex", alignItems: "center", padding: "3px", color: "var(--text-tertiary)", cursor: "pointer" }}
              >
                <X size={11} aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}

      {item.expandedDetails && (
        <div className="animate-fade-in" style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed var(--border-default)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 700 }}>{isZh ? "PINYIN" : "IPA"}</label>
            <input type="text" value={item.pronunciation} onChange={(event) => onUpdateField(item.id, "pronunciation", event.target.value)} placeholder={isZh ? "péngyou" : "/ˈpeɪʃəns/"} style={{ width: "100%", padding: "6px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", fontSize: "var(--text-xs)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 700 }}>{isZh ? "CẤP ĐỘ HSK" : "TRÌNH ĐỘ (CEFR)"}</label>
            <input type="text" value={item.level} onChange={(event) => onUpdateField(item.id, "level", event.target.value)} placeholder={isZh ? "HSK1" : "B1, B2"} style={{ width: "100%", padding: "6px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", fontSize: "var(--text-xs)" }} />
          </div>
          {!isZh && (
            <div>
              <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 700 }}>TỪ ĐỒNG NGHĨA</label>
              <input aria-label={`Từ đồng nghĩa cho ${item.term}`} type="text" value={item.synonyms} onChange={(event) => onUpdateField(item.id, "synonyms", event.target.value)} placeholder="plentifully, richly" style={{ width: "100%", padding: "6px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", fontSize: "var(--text-xs)" }} />
            </div>
          )}
          <div>
            <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 700 }}>CÂU VÍ DỤ</label>
            <input type="text" value={item.example} onChange={(event) => onUpdateField(item.id, "example", event.target.value)} placeholder="Ví dụ minh họa..." style={{ width: "100%", padding: "6px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", fontSize: "var(--text-xs)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 700 }}>DỊCH CÂU VÍ DỤ</label>
            <input type="text" value={item.exampleTranslation} onChange={(event) => onUpdateField(item.id, "exampleTranslation", event.target.value)} placeholder="Dịch nghĩa câu ví dụ..." style={{ width: "100%", padding: "6px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", fontSize: "var(--text-xs)" }} />
          </div>
        </div>
      )}
    </div>
  );
});

interface QuickAddPreviewRowsProps extends Omit<QuickAddPreviewRowProps, "item"> {
  items: EditablePreviewItem[];
}

export const QuickAddPreviewRows = React.memo(function QuickAddPreviewRows({
  items,
  ...rowProps
}: QuickAddPreviewRowsProps): React.ReactElement {
  return (
    <div className="flex-col gap-3">
      {items.map((item) => <QuickAddPreviewRow key={item.id} item={item} {...rowProps} />)}
    </div>
  );
});
