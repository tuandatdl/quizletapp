import React, { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";

export interface QuickAddTopicPickerProps {
  isOpen: boolean;
  availableTopics: string[];
  selectedTopics: string[];
  targetLabel: string;
  isLoading?: boolean;
  onToggle: (topic: string) => void;
  onCreate: (topic: string) => void;
  onApply: () => void;
  onClose: () => void;
}

export const QuickAddTopicPicker = React.memo(function QuickAddTopicPicker({
  isOpen,
  availableTopics,
  selectedTopics,
  targetLabel,
  isLoading = false,
  onToggle,
  onCreate,
  onApply,
  onClose,
}: QuickAddTopicPickerProps): React.ReactElement {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (isOpen) setQuery("");
  }, [isOpen]);

  const normalizedQuery = query.normalize("NFKC").trim().replace(/\s+/gu, " ");
  const filteredTopics = availableTopics.filter((topic) => (
    topic.toLocaleLowerCase().includes(normalizedQuery.toLocaleLowerCase())
  ));
  const exactTopicExists = availableTopics.some((topic) => (
    topic.localeCompare(normalizedQuery, undefined, { sensitivity: "accent" }) === 0
  ));
  const selectedKeys = new Set(selectedTopics.map((topic) => topic.toLocaleLowerCase()));

  const createTopic = () => {
    if (!normalizedQuery) return;
    onCreate(normalizedQuery);
    setQuery("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm vào chủ đề"
      size="sm"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button variant="primary" onClick={onApply}>Áp dụng chủ đề</Button>
        </>
      )}
    >
      <div className="flex-col gap-4">
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
          Gán chủ đề cho {targetLabel}. Có thể chọn nhiều chủ đề.
        </p>
        <div style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: "11px", top: "11px", color: "var(--text-tertiary)" }} />
          <input
            autoFocus
            aria-label="Tìm hoặc tạo chủ đề"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return;
              if (event.key === "Enter" && normalizedQuery && !exactTopicExists) {
                event.preventDefault();
                createTopic();
              }
            }}
            placeholder="Tìm chủ đề..."
            style={{ width: "100%", padding: "9px 11px 9px 34px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", background: "var(--bg-surface)" }}
          />
        </div>

        <div role="group" aria-label="Danh sách chủ đề" className="flex-col gap-2" style={{ maxHeight: "240px", overflowY: "auto" }}>
          {isLoading && <span style={{ color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>Đang tải chủ đề...</span>}
          {!isLoading && filteredTopics.length === 0 && !normalizedQuery && (
            <span style={{ color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>Chưa có chủ đề nào.</span>
          )}
          {filteredTopics.map((topic) => (
            <label key={topic.toLocaleLowerCase()} style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "var(--radius-md)", background: "var(--bg-muted)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={selectedKeys.has(topic.toLocaleLowerCase())}
                onChange={() => onToggle(topic)}
                aria-label={`Chọn chủ đề ${topic}`}
              />
              <span>{topic}</span>
            </label>
          ))}
        </div>

        {normalizedQuery && !exactTopicExists && (
          <Button variant="outline" onClick={createTopic} leftIcon={<Plus size={15} />}>
            Tạo chủ đề mới “{normalizedQuery}”
          </Button>
        )}
      </div>
    </Modal>
  );
});
