import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Flame,
  Clock,
  Layers,
  FileText,
  Headphones,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { progressApi } from "../../api/progress.api";
import { readingApi } from "../../api/reading.api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { CardSkeleton } from "../../components/ui/Skeleton";
import type { Dashboard, ReadingPassageSummary, TodayPlan } from "../../types/api";

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [todayPlan, setTodayPlan] = useState<TodayPlan | null>(null);
  const [recentReadings, setRecentReadings] = useState<ReadingPassageSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isEn = language === "en";

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      progressApi.getDashboard().catch(() => null),
      progressApi.getTodayPlan().catch(() => null),
      readingApi.list(language).catch(() => []),
    ]).then(([dash, plan, readings]) => {
      if (!isMounted) return;
      if (dash) setDashboard(dash);
      if (plan) setTodayPlan(plan);
      if (readings) setRecentReadings(readings);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [language]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = "Chào buổi sáng";
    if (hour >= 12 && hour < 18) timeGreeting = "Chào buổi chiều";
    else if (hour >= 18) timeGreeting = "Chào buổi tối";
    return `${timeGreeting}, ${user?.name || "bạn"}`;
  };

  const currentLangProgress = isEn ? dashboard?.languages.en : dashboard?.languages.zh;
  const currentPlan = isEn ? todayPlan?.english : todayPlan?.chinese;
  const streak = dashboard?.global.streak ?? 0;
  const dueReviews = currentLangProgress?.dueToday ?? 0;

  if (isLoading) {
    return (
      <div className="page-container flex-col gap-6">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="skeleton" style={{ width: "240px", height: "36px", marginBottom: "8px" }} />
            <div className="skeleton" style={{ width: "320px", height: "18px" }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container flex-col gap-8 animate-fade-in">
      {/* 1. Hero Greeting & Daily Status */}
      <div className="flex-row justify-between items-center" style={{ flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div className="flex-row items-center gap-2" style={{ marginBottom: "4px" }}>
            <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800 }}>{getGreeting()}</h1>
            <span style={{ fontSize: "1.5rem" }}>✨</span>
          </div>
          <p style={{ fontSize: "var(--text-base)", color: "var(--text-secondary)" }}>
            Không gian học tập cá nhân • {isEn ? "🇬🇧 Tiếng Anh (Chính)" : "🇨🇳 Tiếng Trung (HSK & Pinyin)"}
          </p>
        </div>

        {/* Quick Streak & Goals Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "10px 18px",
            backgroundColor: "var(--bg-surface)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex-row items-center gap-2">
            <Flame size={20} color="#F59E0B" fill={streak > 0 ? "#F59E0B" : "none"} />
            <div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontWeight: 600 }}>CHUỖI HỌC</div>
              <div style={{ fontSize: "var(--text-base)", fontWeight: 800 }}>{streak} ngày</div>
            </div>
          </div>

          <div style={{ width: "1px", height: "28px", backgroundColor: "var(--border-default)" }} />

          <div className="flex-row items-center gap-2">
            <TrendingUp size={20} color={isEn ? "var(--accent-en-primary)" : "var(--accent-zh-primary)"} />
            <div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontWeight: 600 }}>MỤC TIÊU HÔM NAY</div>
              <div style={{ fontSize: "var(--text-base)", fontWeight: 800 }}>
                {dashboard?.global.todayCompleted ?? 0} / {dashboard?.global.todayGoal ?? 20}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEn && dashboard?.cefr && (
        <Card>
          <div className="flex-row justify-between items-center" style={{ marginBottom: "var(--space-4)", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>Thống kê CEFR</h2>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>Tổng số, đã học và đã thuộc theo trình độ.</p>
            </div>
            <Badge variant="mastered">{dashboard.cefr.totalMastered} đã thuộc</Badge>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "10px" }}>
            {(["A1", "A2", "B1", "B2", "C1", "C2", "unclassified"] as const).map((level) => {
              const stats = dashboard.cefr!.cefr[level];
              return (
                <div key={level} style={{ padding: "10px", borderRadius: "var(--radius-md)", backgroundColor: "var(--bg-muted)" }}>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontWeight: 700 }}>{level === "unclassified" ? "Chưa phân loại" : level}</div>
                  <div style={{ fontSize: "var(--text-lg)", fontWeight: 800 }}>{stats.total}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>{stats.learned} đã học · {stats.mastered} đã thuộc</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 2. Urgent / High Priority: Due Today Action Card */}
      {dueReviews > 0 && (
        <div
          className="animate-pop-in"
          style={{
            background: isEn
              ? "linear-gradient(135deg, var(--accent-en-subtle) 0%, var(--bg-surface) 100%)"
              : "linear-gradient(135deg, var(--accent-zh-subtle) 0%, var(--bg-surface) 100%)",
            borderRadius: "var(--radius-xl)",
            border: `1.5px solid ${isEn ? "var(--accent-en-border)" : "var(--accent-zh-border)"}`,
            padding: "var(--space-6) var(--space-8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex-row items-center gap-4">
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-lg)",
                backgroundColor: isEn ? "var(--accent-en-primary)" : "var(--accent-zh-primary)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "2px" }}>
                Có {dueReviews} thẻ từ vựng đến hạn ôn tập hôm nay
              </h3>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                Ôn tập đúng thời điểm giúp củng cố trí nhớ dài hạn (Spaced Repetition System).
              </p>
            </div>
          </div>

          <Link to="/flashcards">
            <Button
              variant={isEn ? "primary" : "zh"}
              size="md"
              rightIcon={<ArrowRight size={16} />}
            >
              Ôn tập ngay ({dueReviews})
            </Button>
          </Link>
        </div>
      )}

      {/* 3. Today's Plan Grid */}
      <div>
        <div className="flex-row justify-between items-center" style={{ marginBottom: "var(--space-4)" }}>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>Kế hoạch hôm nay</h2>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
            {todayPlan?.date} • {isEn ? "Tiếng Anh" : "Tiếng Trung"}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {/* Card 1: New Words */}
          <Card hoverable className="flex-col justify-between">
            <div>
              <div className="flex-row justify-between items-center" style={{ marginBottom: "var(--space-3)" }}>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Từ mới cần học
                </span>
                <Badge variant="new">Mới</Badge>
              </div>
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "8px" }}>
                {currentPlan?.newWords.available ?? 0}
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-tertiary)", marginLeft: "4px" }}>
                  / mục tiêu {currentPlan?.newWords.target ?? 5}
                </span>
              </div>
            </div>
            <Link to="/vocabulary" style={{ marginTop: "12px" }}>
              <Button variant="secondary" size="sm" style={{ width: "100%" }}>
                Xem danh sách từ
              </Button>
            </Link>
          </Card>

          {/* Card 2: Due Reviews */}
          <Card hoverable className="flex-col justify-between">
            <div>
              <div className="flex-row justify-between items-center" style={{ marginBottom: "var(--space-3)" }}>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Thẻ ôn tập (SRS)
                </span>
                <Badge variant="review">Ôn tập</Badge>
              </div>
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "8px" }}>
                {currentPlan?.dueReviews.available ?? 0}
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-tertiary)", marginLeft: "4px" }}>
                  / mục tiêu {currentPlan?.dueReviews.target ?? 10}
                </span>
              </div>
            </div>
            <Link to="/flashcards" style={{ marginTop: "12px" }}>
              <Button variant="secondary" size="sm" style={{ width: "100%" }}>
                Mở Flashcards
              </Button>
            </Link>
          </Card>

          {/* Card 3: Quiz Practice */}
          <Card hoverable className="flex-col justify-between">
            <div>
              <div className="flex-row justify-between items-center" style={{ marginBottom: "var(--space-3)" }}>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Kiểm tra Quiz
                </span>
                <Badge variant="en">Trắc nghiệm</Badge>
              </div>
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "8px" }}>
                Mục tiêu {currentPlan?.quiz.target ?? 5} câu
              </div>
            </div>
            <Link to="/quiz" style={{ marginTop: "12px" }}>
              <Button variant="secondary" size="sm" style={{ width: "100%" }}>
                Làm bài kiểm tra
              </Button>
            </Link>
          </Card>

          {/* Card 4: Shadowing Target */}
          <Card hoverable className="flex-col justify-between">
            <div>
              <div className="flex-row justify-between items-center" style={{ marginBottom: "var(--space-3)" }}>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Luyện Shadowing
                </span>
                <Badge variant="zh">Luyện nói</Badge>
              </div>
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "8px" }}>
                {currentLangProgress?.shadowingMinutes ?? 0}
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-tertiary)", marginLeft: "4px" }}>
                  / {currentPlan?.shadowing.targetMinutes ?? 5} phút
                </span>
              </div>
            </div>
            <Link to="/shadowing" style={{ marginTop: "12px" }}>
              <Button variant="secondary" size="sm" style={{ width: "100%" }}>
                Bắt đầu Shadowing
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* 4. Continue Learning & Core Shortcuts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {/* Recent Reading Passage */}
        <Card className="flex-col justify-between">
          <div>
            <div className="flex-row justify-between items-center" style={{ marginBottom: "var(--space-4)" }}>
              <div className="flex-row items-center gap-2">
                <FileText size={20} color={isEn ? "var(--accent-en-primary)" : "var(--accent-zh-primary)"} />
                <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>Đoạn đọc gần nhất</h3>
              </div>
              <Link to="/reading" style={{ fontSize: "var(--text-xs)", color: "var(--accent-en-primary)", fontWeight: 600 }}>
                Xem tất cả ({recentReadings.length})
              </Link>
            </div>

            {recentReadings.length > 0 ? (
              <div className="flex-col gap-3">
                {recentReadings.slice(0, 2).map((item) => (
                  <Link
                    key={item.id}
                    to={`/reading/${item.id}`}
                    style={{
                      display: "block",
                      padding: "12px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--bg-muted)",
                      border: "1px solid var(--border-default)",
                      transition: "transform var(--transition-fast)",
                    }}
                  >
                    <div className="flex-row justify-between items-center" style={{ marginBottom: "4px" }}>
                      <span style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>{item.title}</span>
                      <Badge variant={item.language === "en" ? "en" : "zh"}>
                        {item.level || (item.language === "en" ? "A2" : "HSK1")}
                      </Badge>
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                      {item.wordCount} từ • {item.topic || "Tổng hợp"}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ padding: "16px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>
                Chưa có đoạn đọc nào.
              </div>
            )}
          </div>

          <Link to="/reading/new" style={{ marginTop: "16px" }}>
            <Button variant="outline" size="sm" style={{ width: "100%" }}>
              + Thêm đoạn đọc mới
            </Button>
          </Link>
        </Card>

        {/* Vocabulary Progress Overview */}
        <Card className="flex-col justify-between">
          <div>
            <div className="flex-row justify-between items-center" style={{ marginBottom: "var(--space-4)" }}>
              <div className="flex-row items-center gap-2">
                <BookOpen size={20} color={isEn ? "var(--accent-en-primary)" : "var(--accent-zh-primary)"} />
                <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>Tổng quan vốn từ ({isEn ? "EN" : "ZH"})</h3>
              </div>
              <Badge variant="mastered">
                {currentLangProgress?.mastered ?? 0} Đã thuộc
              </Badge>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "16px" }}>
              <div style={{ padding: "12px", borderRadius: "var(--radius-md)", backgroundColor: "var(--bg-muted)" }}>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Tổng số từ</div>
                <div style={{ fontSize: "var(--text-xl)", fontWeight: 800 }}>{currentLangProgress?.totalWords ?? 0}</div>
              </div>
              <div style={{ padding: "12px", borderRadius: "var(--radius-md)", backgroundColor: "var(--bg-muted)" }}>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Đang học</div>
                <div style={{ fontSize: "var(--text-xl)", fontWeight: 800 }}>{currentLangProgress?.learning ?? 0}</div>
              </div>
            </div>

            <div className="flex-col gap-2">
              <div className="flex-row justify-between items-center" style={{ fontSize: "var(--text-xs)" }}>
                <span>Độ chính xác Quiz</span>
                <span style={{ fontWeight: 700 }}>{currentLangProgress?.quizAccuracy ?? 0}%</span>
              </div>
              <ProgressBar
                value={currentLangProgress?.quizAccuracy ?? 0}
                color={isEn ? "var(--accent-en-primary)" : "var(--accent-zh-primary)"}
              />
            </div>
          </div>

          <Link to="/progress" style={{ marginTop: "16px" }}>
            <Button variant="outline" size="sm" style={{ width: "100%" }}>
              Xem báo cáo chi tiết
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};
