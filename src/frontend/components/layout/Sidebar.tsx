import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  Layers,
  FileText,
  HelpCircle,
  Gamepad2,
  Headphones,
  Mic,
  BarChart2,
  PlusCircle,
  Settings,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export const Sidebar: React.FC = () => {
  const { language } = useLanguage();
  const location = useLocation();

  const isEn = language === "en";

  const navItems = [
    { to: "/", label: "Trang chủ", icon: Home },
    { to: "/vocabulary", label: "Từ vựng", icon: BookOpen },
    { to: "/flashcards", label: "Flashcards", icon: Layers },
    { to: "/reading", label: "Đọc tương tác", icon: FileText },
    { to: "/shadowing", label: "Shadowing", icon: Headphones },
    { to: "/pronunciation", label: "Luyện phát âm", icon: Mic },
    { to: "/quiz", label: "Kiểm tra (Quiz)", icon: HelpCircle },
    { to: "/games", label: "Trò chơi", icon: Gamepad2 },
    { to: "/progress", label: "Tiến độ học", icon: BarChart2 },
    { to: "/add", label: "Thêm từ mới", icon: PlusCircle },
    { to: "/settings", label: "Cài đặt", icon: Settings },
  ];

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        backgroundColor: "var(--bg-surface)",
        borderRight: "1px solid var(--border-default)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        zIndex: 50,
        flexShrink: 0,
      }}
      className="desktop-sidebar"
    >
      {/* Brand Header */}
      <div
        style={{
          padding: "var(--space-5) var(--space-6)",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            backgroundColor: isEn ? "var(--accent-en-primary)" : "var(--accent-zh-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            boxShadow: isEn
              ? "0 2px 8px -2px rgba(79, 70, 229, 0.3)"
              : "0 2px 8px -2px rgba(225, 29, 72, 0.3)",
            flexShrink: 0,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path
              d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
              fill="currentColor"
              fillOpacity="0.2"
            />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "1.1875rem",
              letterSpacing: "0.06em",
              lineHeight: 1.1,
              color: "var(--text-primary)",
              whiteSpace: "nowrap",
            }}
          >
            LEXIS
          </div>
          <div
            style={{
              fontSize: "0.625rem",
              letterSpacing: "0.12em",
              fontWeight: 700,
              color: "var(--text-tertiary)",
              textTransform: "uppercase",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            LANGUAGE WORKSPACE
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav
        style={{
          flex: 1,
          padding: "var(--space-4) var(--space-3)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));

          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--text-sm)",
                fontWeight: isActive ? 600 : 500,
                color: isActive
                  ? isEn
                    ? "var(--accent-en-text)"
                    : "var(--accent-zh-text)"
                  : "var(--text-secondary)",
                backgroundColor: isActive
                  ? isEn
                    ? "var(--accent-en-subtle)"
                    : "var(--accent-zh-subtle)"
                  : "transparent",
                transition: "all var(--transition-fast)",
              }}
            >
              <Icon
                size={18}
                color={
                  isActive
                    ? isEn
                      ? "var(--accent-en-primary)"
                      : "var(--accent-zh-primary)"
                    : "var(--text-tertiary)"
                }
              />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div
        style={{
          padding: "var(--space-4) var(--space-6)",
          borderTop: "1px solid var(--border-subtle)",
          fontSize: "var(--text-xs)",
          color: "var(--text-tertiary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>v0.1.0 • Song ngữ</span>
        <span
          style={{
            padding: "2px 6px",
            borderRadius: "var(--radius-xs)",
            backgroundColor: "var(--bg-muted)",
            fontWeight: 600,
          }}
        >
          {isEn ? "🇬🇧 EN Main" : "🇨🇳 ZH Mode"}
        </span>
      </div>
    </aside>
  );
};
