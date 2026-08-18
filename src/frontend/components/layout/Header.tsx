import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame, Moon, Sun, Laptop, LogOut, User as UserIcon, Clock, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { progressApi } from "../../api/progress.api";
import { IconButton } from "../ui/IconButton";
import { LanguageSelector } from "../ui/LanguageSelector";
import { useToast } from "../../context/ToastContext";
import { isStaticRuntime } from "../../runtime/runtime";

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, updateSettings } = useLanguage();
  const { theme, setTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const { error } = useToast();

  const changeLanguage = async (nextLanguage: "en" | "zh") => {
    try { await setLanguage(nextLanguage); }
    catch { error("Không thể lưu ngôn ngữ học. Vui lòng thử lại."); }
  };

  const changeTheme = async (nextTheme: "light" | "dark" | "system") => {
    setTheme(nextTheme);
    setShowThemeMenu(false);
    try { await updateSettings({ themePreference: nextTheme }); }
    catch { error("Giao diện đã đổi trên thiết bị này nhưng chưa lưu được lên máy chủ."); }
  };

  const [streak, setStreak] = useState<number>(0);
  const [dueCount, setDueCount] = useState<number>(0);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showThemeMenu, setShowThemeMenu] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;
    progressApi
      .getStreak()
      .then((res) => setStreak(res.streak))
      .catch(() => {});

    progressApi
      .getTodayPlan()
      .then((plan) => {
        const due = language === "zh" ? plan.chinese.dueReviews.available : plan.english.dueReviews.available;
        setDueCount(due);
      })
      .catch(() => {});
  }, [user, language]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header
      className="app-header"
      style={{
        height: "var(--header-height)",
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-default)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 var(--space-6)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left: Language Selector */}
      <div className="language-switcher flex-row items-center gap-2">
        <LanguageSelector
          value={language}
          onChange={(next) => {
            if (next === "en" || next === "zh") {
              return changeLanguage(next);
            }
          }}
          ariaLabel="Chọn ngôn ngữ học"
        />
      </div>

      {/* Right: Streak, Due Cards, Theme, Profile */}
      <div className="header-actions flex-row items-center gap-3">
        {/* Streak Indicator */}
        <div
          className="header-streak"
          title="Chuỗi ngày học liên tiếp (Tính theo UTC)"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "6px 12px",
            borderRadius: "var(--radius-full)",
            backgroundColor: streak > 0 ? "var(--color-warning-bg)" : "var(--bg-muted)",
            color: streak > 0 ? "var(--color-warning-text)" : "var(--text-tertiary)",
            fontSize: "var(--text-sm)",
            fontWeight: 700,
            border: `1px solid ${streak > 0 ? "var(--color-warning-border)" : "var(--border-default)"}`,
          }}
        >
          <Flame size={16} color={streak > 0 ? "#F59E0B" : "var(--text-tertiary)"} fill={streak > 0 ? "#F59E0B" : "none"} />
          <span>{streak}</span>
          <span className="header-streak-label" style={{ fontSize: "var(--text-xs)", fontWeight: 500 }}>ngày</span>
        </div>

        {/* Due Cards Quick Link */}
        {dueCount > 0 && (
          <Link
            className="header-due"
            to="/flashcards"
            title="Thẻ từ vựng cần ôn tập hôm nay"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--status-review-bg)",
              color: "var(--status-review-text)",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              border: "1px solid var(--border-default)",
            }}
          >
            <Clock size={14} />
            <span>{dueCount} cần ôn</span>
          </Link>
        )}

        {/* Theme Selector Popover */}
        <div style={{ position: "relative" }}>
          <IconButton
            label="Chế độ hiển thị"
            variant="ghost"
            onClick={() => setShowThemeMenu(!showThemeMenu)}
          >
            {theme === "dark" ? <Moon size={18} /> : theme === "light" ? <Sun size={18} /> : <Laptop size={18} />}
          </IconButton>

          {showThemeMenu && (
            <div
              className="animate-pop-in"
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "8px",
                width: "140px",
                backgroundColor: "var(--bg-surface)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
                border: "1px solid var(--border-default)",
                padding: "4px",
                zIndex: 100,
              }}
            >
              {[
                { key: "light", label: "Sáng", icon: Sun },
                { key: "dark", label: "Tối", icon: Moon },
                { key: "system", label: "Hệ thống", icon: Laptop },
              ].map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.key}
                    onClick={() => void changeTheme(opt.key as "light" | "dark" | "system")}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 10px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "var(--text-sm)",
                      color: theme === opt.key ? "var(--accent-en-primary)" : "var(--text-primary)",
                      fontWeight: theme === opt.key ? 600 : 400,
                      backgroundColor: theme === opt.key ? "var(--bg-muted)" : "transparent",
                    }}
                  >
                    <Icon size={16} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* User Profile / Menu */}
        {user ? (
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 8px",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--border-default)",
                backgroundColor: "var(--bg-surface)",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--accent-en-subtle)",
                  color: "var(--accent-en-text)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "var(--text-xs)",
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="header-user-name" style={{ fontSize: "var(--text-sm)", fontWeight: 600, maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.name}
              </span>
              <ChevronDown size={14} color="var(--text-tertiary)" />
            </button>

            {showUserMenu && (
              <div
                className="animate-pop-in"
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "8px",
                  width: "200px",
                  backgroundColor: "var(--bg-surface)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-lg)",
                  border: "1px solid var(--border-default)",
                  padding: "6px",
                  zIndex: 100,
                }}
              >
                <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border-subtle)", marginBottom: "4px" }}>
                  <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{user.name}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {isStaticRuntime() ? "Dữ liệu được lưu trên thiết bị này" : user.email}
                  </div>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "var(--text-sm)",
                    color: "var(--text-primary)",
                  }}
                >
                  <UserIcon size={16} />
                  <span>Cài đặt cá nhân</span>
                </Link>

                {!isStaticRuntime() && <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "var(--text-sm)",
                    color: "var(--color-error)",
                  }}
                >
                  <LogOut size={16} />
                  <span>Đăng xuất</span>
                </button>}
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--accent-en-primary)",
              color: "#FFFFFF",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
            }}
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </header>
  );
};
