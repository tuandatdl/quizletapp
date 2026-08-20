import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Star,
  Trash2,
  Edit2,
  Grid,
  List,
  Filter,
  Check,
  RotateCcw,
} from "lucide-react";
import { collectionApi, vocabularyApi } from "../../api/vocabulary.api";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { IconButton } from "../../components/ui/IconButton";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { AudioButton } from "../../components/ui/AudioButton";
import { LanguageSelector } from "../../components/ui/LanguageSelector";
import { EmptyState } from "../../components/ui/EmptyState";
import { CardSkeleton } from "../../components/ui/Skeleton";
import type { Language, VocabularyCollection, VocabularyItem } from "../../types/api";
import { APP_ROUTES } from "../../runtime/routes";
import { isLikelyIpa } from "../../static/localDomain";
import { getVocabularyCefr, getVocabularyTopics } from "../../../shared/vocabularyIntelligence";

export const VocabularyListPage: React.FC = () => {
  const navigate = useNavigate();
  const { language: currentAppLanguage } = useLanguage();
  const { success, error } = useToast();

  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentAppLanguage);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedTopic, setSelectedTopic] = useState<string>("ALL");
  const [selectedCefr, setSelectedCefr] = useState<string>("ALL");
  const [selectedCollection, setSelectedCollection] = useState<string>("ALL");
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [collections, setCollections] = useState<VocabularyCollection[]>([]);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [collectionDrafts, setCollectionDrafts] = useState<Record<string, string>>({});
  const [isSavingCollection, setIsSavingCollection] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<VocabularyCollection | null>(null);

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState<VocabularyItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit modal state
  const [itemToEdit, setItemToEdit] = useState<VocabularyItem | null>(null);
  const [editForm, setEditForm] = useState({
    meaningVi: "",
    pronunciation: "",
    partOfSpeech: "",
    example: "",
    exampleTranslation: "",
    topic: "",
    topics: "",
    collectionIds: [] as string[],
    level: "",
    note: "",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await vocabularyApi.list({
        language: selectedLanguage === "ALL" ? undefined : (selectedLanguage as Language),
        limit: 100,
      });
      setItems(data);
    } catch (err: any) {
      error("Không thể tải danh sách từ vựng.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const data = await collectionApi.list();
      setCollections(data);
      setCollectionDrafts(Object.fromEntries(data.map((collection) => [collection.id, collection.name])));
    } catch {
      setCollections([]);
    }
  };

  useEffect(() => {
    setSelectedLanguage(currentAppLanguage);
  }, [currentAppLanguage]);

  useEffect(() => {
    fetchItems();
  }, [selectedLanguage]);

  useEffect(() => {
    fetchCollections();
  }, []);

  // Unique topics from current items
  const topics = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      getVocabularyTopics(item).forEach((topic) => set.add(topic));
    });
    return Array.from(set);
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (onlyFavorites && !item.favorite) return false;
      if (selectedStatus !== "ALL" && item.progress.status !== selectedStatus) return false;
      if (selectedTopic !== "ALL" && !getVocabularyTopics(item).some((topic) => topic.localeCompare(selectedTopic, undefined, { sensitivity: "accent" }) === 0)) return false;
      if (selectedCefr !== "ALL" && getVocabularyCefr(item) !== selectedCefr) return false;
      if (selectedCollection !== "ALL" && !item.collectionIds?.includes(selectedCollection)) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTerm = item.term.toLowerCase().includes(query);
        const matchMeaning = item.meaningVi.toLowerCase().includes(query);
        const matchPron = item.pronunciation?.toLowerCase().includes(query);
        if (!matchTerm && !matchMeaning && !matchPron) return false;
      }
      return true;
    });
  }, [items, onlyFavorites, selectedStatus, selectedTopic, selectedCefr, selectedCollection, searchTerm]);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCollectionName.trim();
    if (!name) return;
    setIsSavingCollection(true);
    try {
      await collectionApi.create(name);
      setNewCollectionName("");
      await fetchCollections();
      success("Đã tạo bộ sưu tập.");
    } catch {
      error("Không thể tạo bộ sưu tập.");
    } finally {
      setIsSavingCollection(false);
    }
  };

  const handleRenameCollection = async (collection: VocabularyCollection) => {
    const name = collectionDrafts[collection.id]?.trim();
    if (!name || name === collection.name) return;
    setIsSavingCollection(true);
    try {
      await collectionApi.rename(collection.id, name);
      await fetchCollections();
      success("Đã đổi tên bộ sưu tập.");
    } catch {
      error("Không thể đổi tên bộ sưu tập.");
    } finally {
      setIsSavingCollection(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!collectionToDelete) return;
    setIsSavingCollection(true);
    try {
      await collectionApi.delete(collectionToDelete.id);
      if (selectedCollection === collectionToDelete.id) setSelectedCollection("ALL");
      setCollectionToDelete(null);
      await Promise.all([fetchCollections(), fetchItems()]);
      success("Đã xóa bộ sưu tập.");
    } catch {
      error("Không thể xóa bộ sưu tập.");
    } finally {
      setIsSavingCollection(false);
    }
  };

  const handleToggleFavorite = async (item: VocabularyItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await vocabularyApi.favorite(item.id, !item.favorite);
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      success(updated.favorite ? "Đã thêm vào mục yêu thích" : "Đã bỏ khỏi mục yêu thích");
    } catch {
      error("Lỗi khi cập nhật yêu thích.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await vocabularyApi.delete(itemToDelete.id);
      setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      success("Đã xóa từ vựng.");
      setItemToDelete(null);
    } catch {
      error("Lỗi khi xóa từ vựng.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEdit = (item: VocabularyItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToEdit(item);
    setEditForm({
      meaningVi: item.meaningVi || "",
      pronunciation: item.pronunciation || "",
      partOfSpeech: item.partOfSpeech || "",
      example: item.example || "",
      exampleTranslation: item.exampleTranslation || "",
      topic: item.topic || "",
      topics: getVocabularyTopics(item).join(", "),
      collectionIds: item.collectionIds ?? [],
      level: item.level || "",
      note: item.note || "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToEdit) return;
    setIsSavingEdit(true);
    try {
      const topics = editForm.topics.split(",").map((topic) => topic.trim()).filter(Boolean);
      const updated = await vocabularyApi.update(itemToEdit.id, {
        ...editForm,
        topic: topics[0] ?? null,
        topics,
      });
      setItems((prev) => prev.map((i) => (i.id === itemToEdit.id ? updated : i)));
      success("Đã cập nhật từ vựng.");
      setItemToEdit(null);
    } catch {
      error("Lỗi khi lưu chỉnh sửa.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="page-container flex-col gap-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex-row justify-between items-center" style={{ flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>Kho Từ Vựng</h1>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
            Quản lý và ôn tập vốn từ vựng song ngữ cá nhân
          </p>
        </div>

        <div className="flex-row items-center gap-2">
          <Link to="/add">
            <Button variant="primary" size="md" leftIcon={<Plus size={16} />}>
              Thêm từ mới
            </Button>
          </Link>
        </div>
      </div>

      <Card padding="sm" className="flex-col gap-3">
        <div>
          <h2 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>Bộ sưu tập</h2>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
            Tạo nhóm học riêng và gán một từ vào nhiều bộ sưu tập.
          </p>
        </div>
        <form onSubmit={handleCreateCollection} className="flex-row gap-2" style={{ flexWrap: "wrap" }}>
          <input
            aria-label="Tên bộ sưu tập mới"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            maxLength={60}
            placeholder="Tên bộ sưu tập mới"
            style={{ flex: "1 1 220px", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", backgroundColor: "var(--bg-surface)" }}
          />
          <Button type="submit" size="sm" isLoading={isSavingCollection}>Tạo bộ sưu tập</Button>
        </form>
        {collections.length > 0 && (
          <div className="flex-col gap-2">
            {collections.map((collection) => (
              <div key={collection.id} className="flex-row items-center gap-2" style={{ flexWrap: "wrap" }}>
                <input
                  aria-label={`Tên bộ sưu tập ${collection.name}`}
                  value={collectionDrafts[collection.id] ?? collection.name}
                  onChange={(e) => setCollectionDrafts((current) => ({ ...current, [collection.id]: e.target.value }))}
                  maxLength={60}
                  style={{ flex: "1 1 180px", padding: "7px 10px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", backgroundColor: "var(--bg-surface)" }}
                />
                <Button type="button" variant="secondary" size="sm" onClick={() => setSelectedCollection(selectedCollection === collection.id ? "ALL" : collection.id)}>
                  {selectedCollection === collection.id ? "Bỏ lọc" : "Lọc"} ({items.filter((item) => item.collectionIds?.includes(collection.id)).length})
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => handleRenameCollection(collection)}>Đổi tên</Button>
                <Button type="button" variant="danger" size="sm" onClick={() => setCollectionToDelete(collection)}>Xóa</Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Filter & Search Toolbar */}
      <Card padding="sm" className="flex-col gap-3">
        <div className="flex-row items-center justify-between" style={{ flexWrap: "wrap", gap: "12px" }}>
          {/* Search Box */}
          <div style={{ position: "relative", flex: "1 1 240px", maxWidth: "420px" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-tertiary)",
              }}
            />
            <input
              type="text"
              placeholder="Tìm kiếm từ, nghĩa hoặc phát âm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-default)",
                backgroundColor: "var(--bg-surface)",
                fontSize: "var(--text-sm)",
              }}
            />
          </div>

          {/* Quick Filter Controls */}
          <div className="flex-row items-center gap-2" style={{ flexWrap: "wrap" }}>
            {/* Language filter */}
            <LanguageSelector
              value={selectedLanguage as any}
              onChange={(next) => setSelectedLanguage(next as any)}
              showAllOption
              ariaLabel="Lọc theo ngôn ngữ"
            />

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-default)",
                backgroundColor: "var(--bg-surface)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
              }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="NEW">Mới (NEW)</option>
              <option value="LEARNING">Đang học (LEARNING)</option>
              <option value="REVIEW">Ôn tập (REVIEW)</option>
              <option value="MASTERED">Đã thuộc (MASTERED)</option>
            </select>

            {collections.length > 0 && (
              <select
                aria-label="Lọc theo bộ sưu tập"
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", backgroundColor: "var(--bg-surface)", fontSize: "var(--text-xs)", fontWeight: 600 }}
              >
                <option value="ALL">Tất cả bộ sưu tập</option>
                {collections.map((collection) => <option key={collection.id} value={collection.id}>{collection.name}</option>)}
              </select>
            )}

            <select
              value={selectedCefr}
              onChange={(e) => setSelectedCefr(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", backgroundColor: "var(--bg-surface)", fontSize: "var(--text-xs)", fontWeight: 600 }}
              aria-label="Lọc theo trình độ CEFR"
            >
              <option value="ALL">Tất cả CEFR</option>
              {(["A1", "A2", "B1", "B2", "C1", "C2"] as const).map((level) => <option key={level} value={level}>{level}</option>)}
            </select>

            {/* Topic filter */}
            {topics.length > 0 && (
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-default)",
                  backgroundColor: "var(--bg-surface)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                }}
              >
                <option value="ALL">Tất cả chủ đề</option>
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}

            {/* Favorites Toggle */}
            <button
              type="button"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-default)",
                backgroundColor: onlyFavorites ? "var(--color-warning-bg)" : "var(--bg-surface)",
                color: onlyFavorites ? "var(--color-warning-text)" : "var(--text-secondary)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
              }}
            >
              <Star size={14} fill={onlyFavorites ? "#F59E0B" : "none"} color={onlyFavorites ? "#F59E0B" : "currentColor"} />
              <span>Yêu thích</span>
            </button>

            {/* View Mode Toggle */}
            <div
              style={{
                display: "flex",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-default)",
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                style={{
                  padding: "8px 10px",
                  backgroundColor: viewMode === "grid" ? "var(--bg-muted)" : "var(--bg-surface)",
                  color: viewMode === "grid" ? "var(--text-primary)" : "var(--text-tertiary)",
                }}
                title="Dạng lưới"
              >
                <Grid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                style={{
                  padding: "8px 10px",
                  backgroundColor: viewMode === "list" ? "var(--bg-muted)" : "var(--bg-surface)",
                  color: viewMode === "list" ? "var(--text-primary)" : "var(--text-tertiary)",
                }}
                title="Dạng danh sách"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Vocabulary Items Grid / List */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="Không tìm thấy từ vựng nào"
          description={
            searchTerm || onlyFavorites || selectedStatus !== "ALL"
              ? "Hãy thử bỏ bớt bộ lọc tìm kiếm để xem tất cả từ vựng."
              : "Bạn chưa có từ vựng nào trong kho. Hãy thêm từ mới hoặc trích xuất từ bài đọc."
          }
          actionText="+ Thêm từ vựng mới"
          onAction={() => navigate(APP_ROUTES.addVocabulary)}
        />
      ) : viewMode === "grid" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {filteredItems.map((item) => {
            const isZh = item.language === "zh";
            const pronunciationDisplay = isZh
              ? (item.metadata?.pinyin || item.pronunciation)
              : (item.metadata?.ipa || (isLikelyIpa(item.pronunciation) ? item.pronunciation : null));

            return (
              <Card
                key={item.id}
                hoverable
                className="flex-col justify-between"
                style={{
                  borderLeft: `4px solid ${
                    isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)"
                  }`,
                }}
              >
                <div>
                  {/* Top Bar: Language & Status & Favorite */}
                  <div className="flex-row justify-between items-center" style={{ marginBottom: "var(--space-2)" }}>
                    <div className="flex-row items-center gap-1">
                      <Badge variant={isZh ? "zh" : "en"} size="sm">
                        {isZh ? "🇨🇳 ZH" : "🇬🇧 EN"}
                      </Badge>
                      <Badge status={item.progress.status} size="sm">
                        {item.progress.status}
                      </Badge>
                      {item.level && (
                        <Badge variant="default" size="sm">
                          {item.level}
                        </Badge>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(item, e)}
                      style={{
                        padding: "4px",
                        color: item.favorite ? "#F59E0B" : "var(--text-tertiary)",
                      }}
                      title={item.favorite ? "Bỏ yêu thích" : "Yêu thích"}
                    >
                      <Star size={16} fill={item.favorite ? "#F59E0B" : "none"} />
                    </button>
                  </div>

                  {/* Main Word / Hanzi & Pronunciation */}
                  <div style={{ margin: "var(--space-2) 0" }}>
                    <div className="flex-row items-center gap-2">
                      <span
                        className={isZh ? "hanzi" : ""}
                        style={{
                          fontSize: isZh ? "1.75rem" : "1.25rem",
                          fontWeight: 700,
                          color: "var(--text-primary)",
                        }}
                      >
                        {item.term}
                      </span>
                      <AudioButton
                        text={item.term}
                        audioUrl={item.audioUrl}
                        language={item.language}
                        size="sm"
                      />
                    </div>

                    {/* Pronunciation / Pinyin / IPA */}
                    {pronunciationDisplay && (
                      <div
                        className={isZh ? "pinyin" : ""}
                        style={{
                          fontSize: "var(--text-sm)",
                          color: "var(--text-tertiary)",
                          marginTop: "2px",
                          fontFamily: isZh ? "var(--font-body)" : "var(--font-mono)",
                        }}
                      >
                        {pronunciationDisplay}
                      </div>
                    )}
                  </div>

                  {/* Vietnamese Meaning */}
                  <div
                    style={{
                      fontSize: "var(--text-base)",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "var(--space-2)",
                    }}
                  >
                    {item.meaningVi}
                  </div>

                  {/* Example */}
                  {item.example && (
                    <div
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--text-secondary)",
                        backgroundColor: "var(--bg-muted)",
                        padding: "var(--space-2) var(--space-3)",
                        borderRadius: "var(--radius-sm)",
                        fontStyle: "italic",
                      }}
                    >
                      "{item.example}"
                    </div>
                  )}
                </div>

                {/* Footer: Tags / Senses & Actions */}
                <div
                  className="flex-row justify-between items-center"
                  style={{
                    borderTop: "1px solid var(--border-subtle)",
                    paddingTop: "var(--space-2)",
                    marginTop: "var(--space-3)",
                  }}
                >
                  <div className="flex-row items-center gap-1">
                    {item.partOfSpeech && (
                      <span
                        style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--text-tertiary)",
                          fontWeight: 500,
                        }}
                      >
                        {item.partOfSpeech}
                      </span>
                    )}
                    {getVocabularyTopics(item).map((topic) => (
                      <Badge key={topic} variant="default" size="sm">{topic}</Badge>
                    ))}
                  </div>

                  <div className="flex-row items-center gap-1">
                    <IconButton
                      label="Sửa từ vựng"
                      size="sm"
                      onClick={(e) => handleOpenEdit(item, e)}
                    >
                      <Edit2 size={14} />
                    </IconButton>
                    <IconButton
                      label="Xóa từ vựng"
                      size="sm"
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToDelete(item);
                      }}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* List View (Table Layout) */
        <Card padding="none">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "var(--text-sm)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-default)", backgroundColor: "var(--bg-muted)" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-secondary)" }}>TỪ VỰNG</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-secondary)" }}>PHIÊN ÂM / PINYIN</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-secondary)" }}>NGHĨA TIẾNG VIỆT</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-secondary)" }}>TRẠNG THÁI</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-secondary)", textAlign: "right" }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const isItemZh = item.language === "zh";
                  const itemPronDisplay = isItemZh
                    ? (item.metadata?.pinyin || item.pronunciation)
                    : (item.metadata?.ipa || (isLikelyIpa(item.pronunciation) ? item.pronunciation : null));
                  return (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      transition: "background-color var(--transition-fast)",
                    }}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: 700 }}>
                      <div className="flex-row items-center gap-2">
                        <AudioButton text={item.term} audioUrl={item.audioUrl} language={item.language} size="sm" />
                        <span className={item.language === "zh" ? "hanzi" : ""}>{item.term}</span>
                        {item.favorite && <Star size={12} fill="#F59E0B" color="#F59E0B" />}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-tertiary)", fontFamily: isItemZh ? "var(--font-body)" : "var(--font-mono)" }}>
                      {itemPronDisplay || "—"}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 500 }}>{item.meaningVi}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge status={item.progress.status} size="sm">
                        {item.progress.status}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div className="flex-row justify-end items-center gap-1">
                        <IconButton label="Sửa" size="sm" onClick={(e) => handleOpenEdit(item, e)}>
                          <Edit2 size={14} />
                        </IconButton>
                        <IconButton label="Xóa" size="sm" variant="danger" onClick={() => setItemToDelete(item)}>
                          <Trash2 size={14} />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        title="Xác nhận xóa từ vựng"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setItemToDelete(null)}>
              Hủy bỏ
            </Button>
            <Button variant="danger" isLoading={isDeleting} onClick={handleConfirmDelete}>
              Xóa vĩnh viễn
            </Button>
          </>
        }
      >
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
          Bạn có chắc chắn muốn xóa từ{" "}
          <strong style={{ color: "var(--text-primary)" }}>{itemToDelete?.term}</strong> khỏi kho từ vựng không? Hành động này không thể hoàn tác.
        </p>
      </Modal>

      <Modal
        isOpen={Boolean(collectionToDelete)}
        onClose={() => setCollectionToDelete(null)}
        title="Xóa bộ sưu tập"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCollectionToDelete(null)}>Hủy</Button>
            <Button variant="danger" isLoading={isSavingCollection} onClick={handleDeleteCollection}>Xóa</Button>
          </>
        }
      >
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
          Xóa <strong>{collectionToDelete?.name}</strong>? Từ vựng sẽ được giữ lại và chỉ bỏ liên kết bộ sưu tập.
        </p>
      </Modal>

      {/* Edit Vocabulary Modal */}
      <Modal
        isOpen={Boolean(itemToEdit)}
        onClose={() => setItemToEdit(null)}
        title={`Chỉnh sửa: ${itemToEdit?.term}`}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setItemToEdit(null)}>
              Hủy
            </Button>
            <Button variant="primary" isLoading={isSavingEdit} onClick={handleSaveEdit}>
              Lưu thay đổi
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="flex-col gap-4">
          <div>
            <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, marginBottom: "4px" }}>
              Nghĩa tiếng Việt *
            </label>
            <input
              type="text"
              required
              value={editForm.meaningVi}
              onChange={(e) => setEditForm({ ...editForm, meaningVi: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-strong)",
                backgroundColor: "var(--bg-surface)",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, marginBottom: "4px" }}>
              Chủ đề (phân tách bằng dấu phẩy)
            </label>
            <input
              type="text"
              value={editForm.topics}
              onChange={(e) => setEditForm({ ...editForm, topics: e.target.value })}
              placeholder="Giao tiếp, Công việc"
              style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-strong)", backgroundColor: "var(--bg-surface)" }}
            />
          </div>

          {collections.length > 0 && (
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend style={{ fontSize: "var(--text-xs)", fontWeight: 700, marginBottom: "8px" }}>Bộ sưu tập</legend>
              <div className="flex-row gap-3" style={{ flexWrap: "wrap" }}>
                {collections.map((collection) => (
                  <label key={collection.id} className="flex-row items-center gap-1" style={{ fontSize: "var(--text-sm)" }}>
                    <input
                      type="checkbox"
                      checked={editForm.collectionIds.includes(collection.id)}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        collectionIds: e.target.checked
                          ? [...editForm.collectionIds, collection.id]
                          : editForm.collectionIds.filter((id) => id !== collection.id),
                      })}
                    />
                    {collection.name}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div className="responsive-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, marginBottom: "4px" }}>
                Phát âm / Pinyin
              </label>
              <input
                type="text"
                value={editForm.pronunciation}
                onChange={(e) => setEditForm({ ...editForm, pronunciation: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-strong)",
                  backgroundColor: "var(--bg-surface)",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, marginBottom: "4px" }}>
                Từ loại (Part of Speech)
              </label>
              <input
                type="text"
                value={editForm.partOfSpeech}
                onChange={(e) => setEditForm({ ...editForm, partOfSpeech: e.target.value })}
                placeholder="noun, verb, adj..."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-strong)",
                  backgroundColor: "var(--bg-surface)",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, marginBottom: "4px" }}>
              Câu ví dụ
            </label>
            <textarea
              rows={2}
              value={editForm.example}
              onChange={(e) => setEditForm({ ...editForm, example: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-strong)",
                backgroundColor: "var(--bg-surface)",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, marginBottom: "4px" }}>
              Dịch câu ví dụ
            </label>
            <input
              type="text"
              value={editForm.exampleTranslation}
              onChange={(e) => setEditForm({ ...editForm, exampleTranslation: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-strong)",
                backgroundColor: "var(--bg-surface)",
              }}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
