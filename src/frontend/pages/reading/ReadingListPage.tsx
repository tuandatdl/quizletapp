import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus, BookOpen, Clock, ArrowRight, Trash2 } from "lucide-react";
import { readingApi } from "../../api/reading.api";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { IconButton } from "../../components/ui/IconButton";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { LanguageSelector } from "../../components/ui/LanguageSelector";
import type { Language, ReadingPassageSummary } from "../../types/api";

export const ReadingListPage: React.FC = () => {
  const { language } = useLanguage();
  const { success, error } = useToast();

  const [readings, setReadings] = useState<ReadingPassageSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState<string>(language);
  const [itemToDelete, setItemToDelete] = useState<ReadingPassageSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReadings = async () => {
    setIsLoading(true);
    try {
      const data = await readingApi.list(selectedLang === "ALL" ? undefined : (selectedLang as Language));
      setReadings(data);
    } catch {
      error("Không thể tải danh sách bài đọc.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSelectedLang(language);
  }, [language]);

  useEffect(() => {
    fetchReadings();
  }, [selectedLang]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await readingApi.delete(itemToDelete.id);
      setReadings((prev) => prev.filter((r) => r.id !== itemToDelete.id));
      success("Đã xóa bài đọc.");
      setItemToDelete(null);
    } catch {
      error("Lỗi khi xóa bài đọc.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page-container flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex-row justify-between items-center" style={{ flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>Đọc Tương Tác</h1>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
            Luyện đọc song ngữ với tính năng bôi đen dịch, tra từ tức thì và phát âm từng câu
          </p>
        </div>

        <div className="flex-row items-center gap-3">
          <LanguageSelector
            value={selectedLang as any}
            onChange={(next) => setSelectedLang(next as any)}
            showAllOption
            ariaLabel="Lọc theo ngôn ngữ"
          />

          <Link to="/reading/new">
            <Button variant="primary" size="md" leftIcon={<Plus size={16} />}>
              Thêm bài đọc
            </Button>
          </Link>
        </div>
      </div>

      {/* Reading Passage Cards */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : readings.length === 0 ? (
        <EmptyState
          icon={<FileText size={48} color="var(--text-tertiary)" />}
          title="Bạn chưa có bài đọc nào"
          description="Hãy tạo bài đọc mới để bắt đầu trải nghiệm đọc tương tác, bôi đen dịch và luyện phát âm."
          actionText="+ Thêm bài đọc đầu tiên"
          onAction={() => (window.location.href = "/reading/new")}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {readings.map((r) => {
            const isZh = r.language === "zh";

            return (
              <Card key={r.id} hoverable className="flex-col justify-between" style={{ minHeight: "200px" }}>
                <div>
                  <div className="flex-row justify-between items-center" style={{ marginBottom: "var(--space-3)" }}>
                    <Badge variant={isZh ? "zh" : "en"}>
                      {isZh ? "🇨🇳 Tiếng Trung" : "🇬🇧 Tiếng Anh"}
                    </Badge>

                    {r.level && <Badge variant="default">{r.level}</Badge>}
                  </div>

                  <h3
                    className={isZh ? "hanzi" : ""}
                    style={{
                      fontSize: "var(--text-lg)",
                      fontWeight: 700,
                      marginBottom: "var(--space-2)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {r.title}
                  </h3>

                  <div className="flex-row items-center gap-3" style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                    <span>{r.wordCount} từ</span>
                    <span>•</span>
                    <span>{r.topic || "Tổng hợp"}</span>
                  </div>

                  {r.translationVi && (
                    <p
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--text-secondary)",
                        marginTop: "8px",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {r.translationVi}
                    </p>
                  )}
                </div>

                <div
                  className="flex-row justify-between items-center"
                  style={{
                    borderTop: "1px solid var(--border-subtle)",
                    paddingTop: "var(--space-3)",
                    marginTop: "var(--space-4)",
                  }}
                >
                  <IconButton
                    label="Xóa bài đọc"
                    size="sm"
                    variant="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemToDelete(r);
                    }}
                  >
                    <Trash2 size={15} />
                  </IconButton>

                  <Link to={`/reading/${r.id}`}>
                    <Button variant={isZh ? "zh" : "primary"} size="sm" rightIcon={<ArrowRight size={14} />}>
                      Đọc bài này
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        title="Xác nhận xóa bài đọc"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setItemToDelete(null)}>
              Hủy
            </Button>
            <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>
              Xóa bài đọc
            </Button>
          </>
        }
      >
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
          Bạn có chắc chắn muốn xóa bài đọc <strong>"{itemToDelete?.title}"</strong> không? Mọi câu và dữ liệu phân tích sẽ bị xóa.
        </p>
      </Modal>
    </div>
  );
};
