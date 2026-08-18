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
          padding: "var(--space-6) var(--space-6)",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "var(--radius-md)",
            backgroundColor: isEn ? "var(--accent-en-primary)" : "var(--accent-zh-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <Sparkles size={20} />
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.125rem", letterSpacing: "-0.02em" }}>
            TÚ TRINH
          </div>
          <div style={{ fontSize: "0.6875rem", letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>
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
