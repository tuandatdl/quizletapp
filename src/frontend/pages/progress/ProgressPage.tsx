import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart2,
  Flame,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Mic,
  Headphones,
  FileText,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { progressApi } from "../../api/progress.api";
import { useLanguage } from "../../context/LanguageContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { CardSkeleton } from "../../components/ui/Skeleton";
import type { Dashboard, Language } from "../../types/api";

export const ProgressPage: React.FC = () => {
  const { language: currentLang } = useLanguage();
  const [selectedTab, setSelectedTab] = useState<Language>(currentLang);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { setSelectedTab(currentLang); }, [currentLang]);

  useEffect(() => {
    setIsLoading(true);
    progressApi
      .getDashboard()
      .then((data) => {
        setDashboard(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const isEn = selectedTab === "en";
  const isZh = selectedTab === "zh";
  const langData = isEn ? dashboard?.languages.en : dashboard?.languages.zh;
  const globalData = dashboard?.global;

  const totalStudyMinutes = Math.round((globalData?.totalStudyTimeSeconds || 0) / 60);

  if (isLoading || !dashboard || !langData) {
    return (
      <div className="page-container flex-col gap-6">
        <CardSkeleton />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div className="flex-row justify-between items-center" style={{ flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>Tiến Độ & Phân Tích Học Tập</h1>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
            Theo dõi sự tiến bộ hàng ngày, độ thuần thục từ vựng và các kỹ năng ngôn ngữ
          </p>
        </div>

        {/* Language Tabs */}
        <div
          style={{
            display: "inline-flex",
            backgroundColor: "var(--bg-muted)",
            padding: "4px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-default)",
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedTab("en")}
            style={{
              padding: "8px 18px",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              backgroundColor: isEn ? "var(--bg-surface)" : "transparent",
              color: isEn ? "var(--accent-en-primary)" : "var(--text-secondary)",
              boxShadow: isEn ? "var(--shadow-xs)" : "none",
              transition: "all var(--transition-fast)",
            }}
          >
            🇬🇧 Tiếng Anh (Main)
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab("zh")}
            style={{
              padding: "8px 18px",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              backgroundColor: !isEn ? "var(--bg-surface)" : "transparent",
              color: !isEn ? "var(--accent-zh-primary)" : "var(--text-secondary)",
              boxShadow: !isEn ? "var(--shadow-xs)" : "none",
              transition: "all var(--transition-fast)",
            }}
          >
            🇨🇳 Tiếng Trung (HSK)
          </button>
        </div>
      </div>

      {/* Global Activity Highlights */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        {/* Streak */}
        <Card hoverable className="flex-col justify-between">
          <div className="flex-row items-center gap-3">
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-lg)",
                backgroundColor: "var(--color-warning-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Flame size={24} color="#F59E0B" fill="#F59E0B" />
            </div>
            <div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontWeight: 700 }}>CHUỖI NGÀY HỌC</div>
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>{globalData?.streak ?? 0} ngày liên tiếp</div>
            </div>
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: "12px" }}>
            Học ít nhất 1 bài đọc, quiz hoặc phát âm mỗi ngày để duy trì chuỗi (Tính theo UTC).
          </div>
        </Card>

        {/* Today's Goal Progress */}
        <Card hoverable className="flex-col justify-between">
          <div className="flex-row items-center gap-3">
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-lg)",
                backgroundColor: isEn ? "var(--accent-en-subtle)" : "var(--accent-zh-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Award size={24} color={isEn ? "var(--accent-en-primary)" : "var(--accent-zh-primary)"} />
            </div>
            <div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontWeight: 700 }}>MỤC TIÊU HÔM NAY</div>
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>
                {globalData?.todayCompleted ?? 0} / {globalData?.todayGoal ?? 20}
              </div>
            </div>
          </div>
          <div style={{ marginTop: "12px" }}>
            <ProgressBar
              value={globalData?.todayCompleted ?? 0}
              max={globalData?.todayGoal ?? 20}
              color={isEn ? "var(--accent-en-primary)" : "var(--accent-zh-primary)"}
            />
          </div>
        </Card>

        {/* Total Time Studied */}
        <Card hoverable className="flex-col justify-between">
          <div className="flex-row items-center gap-3">
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-lg)",
                backgroundColor: "var(--color-success-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={24} color="var(--color-success)" />
            </div>
            <div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontWeight: 700 }}>TỔNG THỜI GIAN HỌC</div>
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>
                {totalStudyMinutes} phút
              </div>
            </div>
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: "12px" }}>
            Tích lũy từ việc đọc tương tác, flashcard, quiz và shadowing.
          </div>
        </Card>
      </div>

      {/* Vocabulary Mastery Breakdown */}
      <Card elevated className="flex-col gap-6">
        <div className="flex-row justify-between items-center">
          <div className="flex-row items-center gap-2">
            <BookOpen size={20} color={isEn ? "var(--accent-en-primary)" : "var(--accent-zh-primary)"} />
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>
              Phân Bố Vốn Từ ({isEn ? "Tiếng Anh" : "Tiếng Trung"})
            </h2>
          </div>
          <Badge variant={isEn ? "en" : "zh"}>
            Tổng cộng: {langData.totalWords} từ
          </Badge>
        </div>

        {/* 4 Status Blocks */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px" }}>
          {/* Mastered */}
          <div
            style={{
              padding: "16px",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--status-mastered-bg)",
              border: "1px solid var(--color-success-border)",
            }}
          >
            <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--status-mastered-text)", marginBottom: "4px" }}>
              ĐÃ THUỘC (MASTERED)
            </div>
            <div style={{ fontSize: "var(--text-3xl)", fontWeight: 800, color: "var(--status-mastered-text)" }}>
              {langData.mastered}
            </div>
          </div>

          {/* Learning */}
          <div
            style={{
              padding: "16px",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--status-learning-bg)",
              border: "1px solid var(--color-warning-border)",
            }}
          >
            <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--status-learning-text)", marginBottom: "4px" }}>
              ĐANG HỌC & ÔN TẬP
            </div>
            <div style={{ fontSize: "var(--text-3xl)", fontWeight: 800, color: "var(--status-learning-text)" }}>
              {langData.learning}
            </div>
          </div>

          {/* New */}
          <div
            style={{
              padding: "16px",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--status-new-bg)",
              border: "1px solid var(--accent-en-border)",
            }}
          >
            <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--status-new-text)", marginBottom: "4px" }}>
              TỪ MỚI (NEW)
            </div>
            <div style={{ fontSize: "var(--text-3xl)", fontWeight: 800, color: "var(--status-new-text)" }}>
              {langData.new}
            </div>
          </div>

          {/* Due Today */}
          <div
            style={{
              padding: "16px",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--status-review-bg)",
              border: "1px solid var(--border-default)",
            }}
          >
            <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--status-review-text)", marginBottom: "4px" }}>
              ĐẾN HẠN HÔM NAY
            </div>
            <div style={{ fontSize: "var(--text-3xl)", fontWeight: 800, color: "var(--status-review-text)" }}>
              {langData.dueToday}
            </div>
          </div>
        </div>
      </Card>

      {/* Skills Performance Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        {/* Quiz Accuracy */}
        <Card className="flex-col justify-between">
          <div>
            <div className="flex-row items-center gap-2" style={{ marginBottom: "var(--space-3)" }}>
              <HelpCircle size={18} color="var(--accent-en-primary)" />
              <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>Độ chính xác Quiz</h3>
            </div>
            <div style={{ fontSize: "var(--text-3xl)", fontWeight: 800, marginBottom: "8px" }}>
              {langData.quizAccuracy}%
            </div>
            <ProgressBar value={langData.quizAccuracy} color="var(--accent-en-primary)" />
          </div>
          <Link to="/quiz" style={{ marginTop: "16px" }}>
            <Button variant="secondary" size="sm" style={{ width: "100%" }}>
              Luyện Quiz ngay
            </Button>
          </Link>
        </Card>

        {/* Pronunciation & Tone Accuracy */}
        <Card className="flex-col justify-between">
          <div>
            <div className="flex-row items-center gap-2" style={{ marginBottom: "var(--space-3)" }}>
              <Mic size={18} color={isEn ? "var(--accent-en-primary)" : "var(--accent-zh-primary)"} />
              <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>
                {isZh ? "Điểm phát âm & Thanh điệu" : "Điểm phát âm trung bình"}
              </h3>
            </div>
            <div style={{ fontSize: "var(--text-3xl)", fontWeight: 800, marginBottom: "8px" }}>
              {langData.pronunciationAverage}%
            </div>
            <ProgressBar
              value={langData.pronunciationAverage}
              color={isEn ? "var(--color-success)" : "var(--accent-zh-primary)"}
            />

            {isZh && langData.toneAccuracy !== undefined && (
              <div style={{ marginTop: "12px", fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                Chuẩn xác thanh điệu (HSK): <strong>{langData.toneAccuracy}%</strong>
              </div>
            )}
          </div>
          <Link to="/pronunciation" style={{ marginTop: "16px" }}>
            <Button variant="secondary" size="sm" style={{ width: "100%" }}>
              Luyện phát âm
            </Button>
          </Link>
        </Card>

        {/* Reading & Shadowing */}
        <Card className="flex-col justify-between">
          <div>
            <div className="flex-row items-center gap-2" style={{ marginBottom: "var(--space-3)" }}>
              <Headphones size={18} color="var(--accent-en-primary)" />
              <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>Đọc & Shadowing</h3>
            </div>
            <div className="responsive-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", margin: "12px 0" }}>
              <div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Bài đọc đã tạo</div>
                <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>{langData.readingCompleted}</div>
              </div>
              <div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Shadowing</div>
                <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>{langData.shadowingMinutes}p</div>
              </div>
            </div>
          </div>
          <Link to="/reading" style={{ marginTop: "16px" }}>
            <Button variant="secondary" size="sm" style={{ width: "100%" }}>
              Mở kho bài đọc
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};
