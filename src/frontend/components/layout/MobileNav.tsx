import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, BookOpen, Layers, FileText, Menu, X, HelpCircle, Gamepad2, Headphones, Mic, BarChart2, PlusCircle, Settings } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export const MobileNav: React.FC = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousBodyOverflow = document.body.style.overflow;
    const focusAtOpen = document.activeElement;
    document.body.style.overflow = "hidden";
    const focusFrame = requestAnimationFrame(() => {
      if (document.activeElement === focusAtOpen || document.activeElement === document.body) closeButtonRef.current?.focus();
    });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setDrawerOpen(false); return; }
      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0]!; const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      menuButtonRef.current?.focus();
    };
  }, [drawerOpen]);

  const isEn = language === "en";

  const primaryItems = [
    { to: "/", label: "Trang chủ", icon: Home },
    { to: "/vocabulary", label: "Từ vựng", icon: BookOpen },
    { to: "/flashcards", label: "Flashcard", icon: Layers },
    { to: "/reading", label: "Đọc", icon: FileText },
  ];

  const allItems = [
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
    <>
      {/* Bottom Navigation Bar */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "var(--mobile-nav-height)",
          backgroundColor: "var(--bg-surface)",
          borderTop: "1px solid var(--border-default)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          zIndex: 40,
          padding: "0 var(--space-2)",
        }}
        className="mobile-only-nav"
      >
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                padding: "6px 12px",
                color: isActive
                  ? isEn
                    ? "var(--accent-en-primary)"
                    : "var(--accent-zh-primary)"
                  : "var(--text-tertiary)",
                fontSize: "0.6875rem",
                fontWeight: isActive ? 600 : 500,
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Mở menu điều hướng"
          aria-expanded={drawerOpen}
          aria-controls="mobile-navigation-drawer"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            padding: "6px 12px",
            color: "var(--text-tertiary)",
            fontSize: "0.6875rem",
            fontWeight: 500,
          }}
        >
          <Menu size={20} />
          <span>Khác</span>
        </button>
      </nav>

      {/* Mobile Drawer Modal */}
      {drawerOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            backgroundColor: "var(--bg-overlay)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setDrawerOpen(false)}
        >
          <div
            id="mobile-navigation-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng"
            className="animate-pop-in"
            style={{
              width: "80%",
              maxWidth: "320px",
              height: "100%",
              backgroundColor: "var(--bg-surface)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "var(--shadow-xl)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-default)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    backgroundColor: isEn ? "var(--accent-en-primary)" : "var(--accent-zh-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="14"
                    height="14"
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
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: "1rem",
                      letterSpacing: "0.06em",
                      lineHeight: 1.1,
                      color: "var(--text-primary)",
                    }}
                  >
                    LEXIS
                  </div>
                  <div
                    style={{
                      fontSize: "0.5625rem",
                      letterSpacing: "0.1em",
                      fontWeight: 700,
                      color: "var(--text-tertiary)",
                      textTransform: "uppercase",
                      lineHeight: 1,
                    }}
                  >
                    LANGUAGE WORKSPACE
                  </div>
                </div>
              </div>
              <button ref={closeButtonRef} type="button" aria-label="Đóng menu điều hướng" onClick={() => setDrawerOpen(false)} style={{ color: "var(--text-tertiary)", padding: "4px" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
              {allItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 14px",
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
                      marginBottom: "4px",
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
