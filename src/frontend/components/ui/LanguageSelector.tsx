import React, { useEffect, useRef, useState, useId } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown, Check, X, Globe } from "lucide-react";
import { Button } from "./Button";

export type LanguageOptionValue = "en" | "zh" | "ALL";

export interface LanguageOption {
  value: LanguageOptionValue;
  label: string;
  flag?: string;
  sublabel?: string;
}

export interface LanguageSelectorProps {
  value: LanguageOptionValue;
  onChange: (value: LanguageOptionValue) => void | Promise<void>;
  options?: LanguageOption[];
  showAllOption?: boolean;
  variant?: "header" | "filter" | "compact";
  className?: string;
  ariaLabel?: string;
}

const DEFAULT_LEARNING_OPTIONS: LanguageOption[] = [
  { value: "en", label: "Tiếng Anh", flag: "🇬🇧", sublabel: "English" },
  { value: "zh", label: "Tiếng Trung", flag: "🇨🇳", sublabel: "中文" },
];

const DEFAULT_FILTER_OPTIONS: LanguageOption[] = [
  { value: "ALL", label: "Tất cả ngôn ngữ", flag: "🌐" },
  { value: "en", label: "Tiếng Anh", flag: "🇬🇧", sublabel: "English" },
  { value: "zh", label: "Tiếng Trung", flag: "🇨🇳", sublabel: "中文" },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  options: customOptions,
  showAllOption = false,
  variant = "header",
  className = "",
  ariaLabel = "Chọn ngôn ngữ",
}) => {
  const options =
    customOptions ||
    (showAllOption ? DEFAULT_FILTER_OPTIONS : DEFAULT_LEARNING_OPTIONS);

  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const listboxId = useId();

  const selectedOption =
    options.find((opt) => opt.value === value) || options[0]!;

  // Responsive mobile check
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Handle outside click on desktop
  useEffect(() => {
    if (!isOpen || isMobile) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, isMobile]);

  // Handle body scroll lock & Escape key
  useEffect(() => {
    if (!isOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const focusAtOpen = document.activeElement;
    let focusFrame: number | undefined;
    if (isMobile) {
      document.body.style.overflow = "hidden";
      focusFrame = requestAnimationFrame(() => {
        if (document.activeElement === focusAtOpen || document.activeElement === document.body) closeButtonRef.current?.focus();
      });
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      if (focusFrame !== undefined) cancelAnimationFrame(focusFrame);
      if (isMobile) {
        document.body.style.overflow = previousBodyOverflow;
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isMobile]);

  const handleSelect = async (optValue: LanguageOptionValue) => {
    setIsOpen(false);
    triggerRef.current?.focus();
    await onChange(optValue);
  };

  const isZh = value === "zh";

  return (
    <div
      ref={containerRef}
      className={`language-selector-root ${className}`}
      style={{ position: "relative", display: "inline-block" }}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup={isMobile ? "dialog" : "listbox"}
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={`${ariaLabel}: ${selectedOption.label}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          minHeight: "44px",
          padding: "8px 14px",
          borderRadius: "var(--radius-lg)",
          border: `1.5px solid ${
            isOpen
              ? isZh
                ? "var(--accent-zh-primary)"
                : "var(--accent-en-primary)"
              : "var(--border-default)"
          }`,
          backgroundColor: isOpen
            ? isZh
              ? "var(--accent-zh-subtle)"
              : "var(--accent-en-subtle)"
            : "var(--bg-surface)",
          color: "var(--text-primary)",
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all var(--transition-fast)",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {selectedOption.flag ? (
            <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>
              {selectedOption.flag}
            </span>
          ) : (
            <Globe size={16} color="var(--text-tertiary)" />
          )}
          <span
            style={{
              fontWeight: 700,
              color: isZh
                ? "var(--accent-zh-text)"
                : value === "en"
                ? "var(--accent-en-text)"
                : "var(--text-primary)",
            }}
          >
            {selectedOption.label}
          </span>
        </span>

        <ChevronDown
          size={16}
          color="var(--text-tertiary)"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform var(--transition-fast)",
            marginLeft: "2px",
            flexShrink: 0,
          }}
        />
      </button>

      {/* ================= DESKTOP ANCHORED POPOVER (>= 768px) ================= */}
      {isOpen && !isMobile && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className="animate-pop-in"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: "6px",
            minWidth: "220px",
            backgroundColor: "var(--bg-surface)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-xl)",
            border: "1px solid var(--border-default)",
            padding: "6px",
            zIndex: 150,
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                type="button"
                onClick={() => handleSelect(opt.value)}
                style={{
                  width: "100%",
                  minHeight: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--text-sm)",
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected
                    ? opt.value === "zh"
                      ? "var(--accent-zh-text)"
                      : "var(--accent-en-primary)"
                    : "var(--text-primary)",
                  backgroundColor: isSelected
                    ? opt.value === "zh"
                      ? "var(--accent-zh-subtle)"
                      : "var(--accent-en-subtle)"
                    : "transparent",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "background-color var(--transition-fast)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "1.2rem", lineHeight: 1, minWidth: "24px", textAlign: "center" }}>
                    {opt.flag || "🌐"}
                  </span>
                  <div>
                    <div>{opt.label}</div>
                    {opt.sublabel && (
                      <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                        {opt.sublabel}
                      </div>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <Check
                    size={16}
                    color={opt.value === "zh" ? "var(--accent-zh-primary)" : "var(--accent-en-primary)"}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ================= MOBILE BOTTOM SHEET (< 768px) ================= */}
      {isOpen && isMobile && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1100,
            backgroundColor: "var(--bg-overlay)",
            backdropFilter: "blur(4px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
          onClick={() => setIsOpen(false)}
        >
          {/* Bottom Sheet Container */}
          <div
            className="animate-pop-in"
            style={{
              width: "100%",
              maxWidth: "500px",
              margin: "0 auto",
              backgroundColor: "var(--bg-surface)",
              borderTopLeftRadius: "var(--radius-2xl)",
              borderTopRightRadius: "var(--radius-2xl)",
              boxShadow: "var(--shadow-xl)",
              border: "1px solid var(--border-default)",
              borderBottom: "none",
              padding: "20px 20px max(24px, env(safe-area-inset-bottom, 24px))",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "12px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <h3 style={{ fontSize: "var(--text-base)", fontWeight: 800 }}>
                {ariaLabel}
              </h3>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Đóng bảng chọn ngôn ngữ"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--bg-muted)",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Options List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "4px 0" }}>
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    style={{
                      width: "100%",
                      minHeight: "48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "var(--radius-lg)",
                      fontSize: "var(--text-base)",
                      fontWeight: isSelected ? 800 : 500,
                      color: isSelected
                        ? opt.value === "zh"
                          ? "var(--accent-zh-text)"
                          : "var(--accent-en-primary)"
                        : "var(--text-primary)",
                      backgroundColor: isSelected
                        ? opt.value === "zh"
                          ? "var(--accent-zh-subtle)"
                          : "var(--accent-en-subtle)"
                        : "var(--bg-muted)",
                      border: `1.5px solid ${
                        isSelected
                          ? opt.value === "zh"
                            ? "var(--accent-zh-border)"
                            : "var(--accent-en-border)"
                          : "transparent"
                      }`,
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "1.4rem", lineHeight: 1, minWidth: "28px", textAlign: "center" }}>
                        {opt.flag || "🌐"}
                      </span>
                      <div>
                        <div>{opt.label}</div>
                        {opt.sublabel && (
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontWeight: 400 }}>
                            {opt.sublabel}
                          </div>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "var(--radius-full)",
                          backgroundColor:
                            opt.value === "zh"
                              ? "var(--accent-zh-primary)"
                              : "var(--accent-en-primary)",
                          color: "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Check size={15} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Cancel Button */}
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setIsOpen(false)}
              style={{
                width: "100%",
                minHeight: "48px",
                marginTop: "6px",
                fontWeight: 700,
              }}
            >
              Hủy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
