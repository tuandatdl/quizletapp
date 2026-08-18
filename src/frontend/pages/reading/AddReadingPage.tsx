import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Sparkles, FileText } from "lucide-react";
import { readingApi } from "../../api/reading.api";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { getFriendlyErrorMessage } from "../../api/client";
import type { Language } from "../../types/api";

export const AddReadingPage: React.FC = () => {
  const { language: currentAppLang } = useLanguage();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [formLang, setFormLang] = useState<Language>(currentAppLang);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [translationVi, setTranslationVi] = useState("");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(true);

  const isZh = formLang === "zh";

  // Live word and character counts
  const charCount = content.length;
  const wordCount = content.trim()
    ? isZh
      ? (content.match(/[\p{Script=Han}A-Za-z0-9]+/gu) || []).length
      : content.trim().split(/\s+/).length
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      error("Vui lòng nhập tiêu đề và nội dung bài đọc.");
      return;
    }

    setIsSubmitting(true);
    try {
      const passage = await readingApi.create({
        language: formLang,
        title: title.trim(),
        content: content.trim(),
        translationVi: translationVi.trim() || null,
        topic: topic.trim() || null,
        level: level.trim() || null,
      });

      success("Tạo bài đọc mới thành công!");
      if (autoTranslate && !translationVi.trim()) {
        try {
          await readingApi.translatePassage(passage.id);
          success("Đã tự động dịch bài đọc sang tiếng Việt.");
        } catch {
          info("Bài đọc đã được lưu. Bản dịch chưa tải được và có thể thử lại sau.");
        }
      }
      navigate(`/reading/${passage.id}`);
    } catch (err: any) {
      error(getFriendlyErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container flex-col gap-6 animate-fade-in" style={{ maxWidth: "840px" }}>
      <div className="flex-row items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} leftIcon={<ArrowLeft size={16} />}>
          Quay lại
        </Button>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>Thêm Bài Đọc Mới</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex-col gap-6">
          {/* Language Selection */}
          <div>
            <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "8px" }}>
              Ngôn ngữ bài đọc
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
                <span className="lang-zh">Tiếng Trung (中文)</span>
              </button>
            </div>
          </div>

          {/* Title and Metadata */}
          <div>
            <label htmlFor="reading-title" style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "6px" }}>
              Tiêu đề bài đọc *
            </label>
            <input
              id="reading-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isZh ? "Ví dụ: 我的周末 (Cuối tuần của tôi)" : "Ví dụ: A Morning Walk in Kyoto"}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--border-strong)",
                backgroundColor: "var(--bg-surface)",
                fontSize: "var(--text-base)",
                fontWeight: 600,
              }}
            />
          </div>

          <div className="responsive-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label htmlFor="reading-topic" style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Chủ đề (Topic)
              </label>
              <input
                id="reading-topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ví dụ: Du lịch, Đời sống, Công nghệ..."
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
              <label htmlFor="reading-level" style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Trình độ / Độ khó
              </label>
              <select
                id="reading-level"
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
                <option value="">-- Chọn trình độ --</option>
                {isZh ? (
                  <>
                    <option value="HSK1">HSK 1 (Sơ cấp)</option>
                    <option value="HSK2">HSK 2</option>
                    <option value="HSK3">HSK 3 (Trung cấp)</option>
                    <option value="HSK4">HSK 4</option>
                    <option value="HSK5">HSK 5 (Cao cấp)</option>
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

          {/* Main Content Area */}
          <div>
            <div className="flex-row justify-between items-center" style={{ marginBottom: "6px" }}>
              <label htmlFor="reading-content" style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>
                Nội dung đoạn văn *
              </label>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                {wordCount} từ • {charCount} ký tự
              </span>
            </div>

            <textarea
              id="reading-content"
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                isZh
                  ? "Dán hoặc viết đoạn văn tiếng Trung vào đây. Hệ thống sẽ tự động phân tách câu và từ để hỗ trợ tương tác..."
                  : "Dán hoặc viết đoạn văn tiếng Anh vào đây. Hệ thống sẽ tự động tách từng câu để bạn luyện nghe, phát âm và dịch..."
              }
              className={isZh ? "hanzi" : ""}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--border-strong)",
                backgroundColor: "var(--bg-surface)",
                fontSize: isZh ? "1.125rem" : "var(--text-base)",
                lineHeight: "var(--leading-relaxed)",
                fontFamily: isZh ? "var(--font-chinese)" : "var(--font-body)",
              }}
            />
            <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", fontSize: "var(--text-sm)", cursor: "pointer" }}>
              <input type="checkbox" checked={autoTranslate} onChange={(event) => setAutoTranslate(event.target.checked)} />
              <span>Tự động dịch sang tiếng Việt sau khi lưu</span>
            </label>
          </div>

          {/* Optional Vietnamese Translation */}
          <div>
            <label htmlFor="reading-translation" style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "6px" }}>
              Bản dịch tiếng Việt (Tùy chọn)
            </label>
            <textarea
              id="reading-translation"
              rows={4}
              value={translationVi}
              onChange={(e) => setTranslationVi(e.target.value)}
              placeholder="Nhập bản dịch tiếng Việt nếu có sẵn (hoặc có thể dùng tính năng dịch tự động sau khi lưu)..."
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-default)",
                backgroundColor: "var(--bg-surface)",
                fontSize: "var(--text-sm)",
                lineHeight: "var(--leading-normal)",
              }}
            />
          </div>

          {/* Submit */}
          <div className="flex-row justify-end gap-3" style={{ borderTop: "1px solid var(--border-default)", paddingTop: "var(--space-4)" }}>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant={isZh ? "zh" : "primary"}
              size="lg"
              isLoading={isSubmitting}
              leftIcon={<Plus size={18} />}
            >
              Lưu và bắt đầu đọc
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
