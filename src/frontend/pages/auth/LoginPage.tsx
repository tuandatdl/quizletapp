import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, Mail, ArrowRight, KeyRound, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCloudAccount } from "../../context/CloudAccountContext";
import { Button } from "../../components/ui/Button";
import { GoogleIcon } from "../../components/ui/GoogleIcon";
import { getFriendlyErrorMessage } from "../../api/client";
import { isStaticRuntime } from "../../runtime/runtime";

export const LoginPage: React.FC = () => {
  const isStatic = isStaticRuntime();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  // Server-mode state & handlers
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isServerLoading, setIsServerLoading] = useState(false);
  const [serverErrorMsg, setServerErrorMsg] = useState<string | null>(null);

  // Static / Cloud-mode state & handlers
  const {
    isAuthenticated,
    displayName,
    email: cloudEmail,
    avatarUrl,
    provider,
    signInWithGoogle,
    signInWithMagicLink,
    signOut,
  } = useCloudAccount();

  const [magicEmail, setMagicEmail] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [cloudErrorMsg, setCloudErrorMsg] = useState<string | null>(null);

  // Server login submit handler
  const handleServerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setServerErrorMsg("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setIsServerLoading(true);
    setServerErrorMsg(null);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setServerErrorMsg(getFriendlyErrorMessage(err));
    } finally {
      setIsServerLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("demo@tutrinhlanguage.local");
    setPassword("Demo123!");
    setServerErrorMsg(null);
  };

  // Google OAuth sign in handler
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setCloudErrorMsg(null);
    try {
      const res = await signInWithGoogle({ returnTo: from });
      if (!res.success) {
        setCloudErrorMsg(res.error || "Không thể kết nối với tài khoản Google.");
      }
    } catch (err: any) {
      setCloudErrorMsg(getFriendlyErrorMessage(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Magic Link sign in handler
  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicEmail.trim()) {
      setCloudErrorMsg("Vui lòng nhập địa chỉ email.");
      return;
    }

    setIsMagicLoading(true);
    setCloudErrorMsg(null);
    try {
      const res = await signInWithMagicLink(magicEmail.trim(), { returnTo: from });
      if (!res.success) {
        setCloudErrorMsg(res.error || "Không thể gửi liên kết đăng nhập.");
      } else {
        setMagicLinkSent(true);
      }
    } catch (err: any) {
      setCloudErrorMsg(getFriendlyErrorMessage(err));
    } finally {
      setIsMagicLoading(false);
    }
  };

  const handleGuestContinue = () => {
    navigate(from, { replace: true });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-6)",
        backgroundColor: "var(--bg-canvas)",
      }}
    >
      <div
        className="card animate-pop-in"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "var(--space-8)",
          boxShadow: "var(--shadow-xl)",
          border: "1px solid var(--border-default)",
        }}
      >
        {/* Branding Header */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--accent-en-primary)",
              color: "#FFFFFF",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 10px -2px rgba(79, 70, 229, 0.35)",
              marginBottom: "var(--space-3)",
            }}
          >
            <svg
              width="24"
              height="24"
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
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-2xl)",
              fontWeight: 800,
              letterSpacing: "0.06em",
              lineHeight: 1.1,
              color: "var(--text-primary)",
            }}
          >
            LEXIS
          </h1>
          <div
            style={{
              fontSize: "0.6875rem",
              letterSpacing: "0.12em",
              fontWeight: 700,
              color: "var(--text-tertiary)",
              textTransform: "uppercase",
              marginTop: "4px",
              marginBottom: "8px",
              lineHeight: 1,
            }}
          >
            LANGUAGE WORKSPACE
          </div>
          <h2
            style={{
              fontSize: "var(--text-lg)",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: "6px 0 2px",
            }}
          >
            Chào mừng trở lại
          </h2>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
            {isStatic
              ? "Đăng nhập để sao lưu và đồng bộ dữ liệu học tập giữa các thiết bị"
              : "Không gian học tiếng Anh & tiếng Trung cá nhân hóa"}
          </p>
        </div>

        {/* STATIC RUNTIME AUTH FLOW */}
        {isStatic ? (
          <div>
            {/* If already authenticated, show status */}
            {isAuthenticated ? (
              <div
                style={{
                  padding: "var(--space-5)",
                  backgroundColor: "var(--bg-muted)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-default)",
                  marginBottom: "var(--space-5)",
                  textAlign: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "8px" }}>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      style={{ width: "36px", height: "36px", borderRadius: "50%", border: "2px solid var(--border-strong)" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: "var(--accent-en-subtle)",
                        color: "var(--accent-en-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "var(--text-sm)",
                      }}
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>
                      {displayName}
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                      {cloudEmail} {provider === "google" ? "• Google" : ""}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: "var(--text-xs)", color: "var(--accent-en-text)", fontWeight: 600, margin: "8px 0 16px" }}>
                  ✓ Đã đăng nhập và kết nối đồng bộ đám mây
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => navigate(from, { replace: true })}
                    rightIcon={<ArrowRight size={16} />}
                  >
                    Vào không gian học
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate("/settings")}
                  >
                    Cài đặt & Đồng bộ
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void signOut()}
                  >
                    Đăng xuất tài khoản
                  </Button>
                </div>
              </div>
            ) : (
              /* Signed Out State -> Google + Magic Link */
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {cloudErrorMsg && (
                  <div
                    className="animate-fade-in"
                    style={{
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--color-error-bg)",
                      border: "1px solid var(--color-error-border)",
                      color: "var(--color-error-text)",
                      fontSize: "var(--text-sm)",
                    }}
                  >
                    {cloudErrorMsg}
                  </div>
                )}

                {/* Primary: Google Sign In */}
                <button
                  id="login-google-btn"
                  type="button"
                  onClick={() => void handleGoogleSignIn()}
                  disabled={isGoogleLoading || isMagicLoading}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-strong)",
                    backgroundColor: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    fontSize: "var(--text-base)",
                    fontWeight: 600,
                    boxShadow: "var(--shadow-sm)",
                    cursor: isGoogleLoading ? "not-allowed" : "pointer",
                    opacity: isGoogleLoading ? 0.7 : 1,
                    transition: "all var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--bg-muted)";
                    e.currentTarget.style.borderColor = "var(--border-stronger, var(--border-strong))";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--bg-surface)";
                    e.currentTarget.style.borderColor = "var(--border-strong)";
                  }}
                >
                  <GoogleIcon size={20} />
                  <span>{isGoogleLoading ? "Đang kết nối Google…" : "Tiếp tục với Google"}</span>
                </button>

                {/* Divider */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "4px 0",
                    color: "var(--text-tertiary)",
                    fontSize: "var(--text-xs)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-subtle)" }} />
                  <span style={{ padding: "0 12px" }}>hoặc email</span>
                  <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-subtle)" }} />
                </div>

                {/* Secondary: Magic Link */}
                {magicLinkSent ? (
                  <div
                    style={{
                      padding: "14px",
                      backgroundColor: "var(--accent-en-subtle)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--accent-en-border)",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "var(--accent-en-text)", fontWeight: 700, fontSize: "var(--text-sm)", marginBottom: "4px" }}>
                      <Check size={18} />
                      <span>Đã gửi liên kết đăng nhập</span>
                    </div>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginBottom: "12px" }}>
                      Vui lòng kiểm tra hộp thư <strong>{magicEmail}</strong> và nhấn vào liên kết để xác thực.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMagicLinkSent(false);
                        setMagicEmail("");
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--accent-en-primary)",
                        fontSize: "var(--text-xs)",
                        fontWeight: 600,
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Nhập địa chỉ email khác
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleMagicLinkSignIn} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <div style={{ position: "relative" }}>
                        <Mail
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
                          id="login-magic-email"
                          type="email"
                          required
                          value={magicEmail}
                          onChange={(e) => setMagicEmail(e.target.value)}
                          placeholder="name@example.com"
                          style={{
                            width: "100%",
                            padding: "10px 12px 10px 38px",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border-strong)",
                            backgroundColor: "var(--bg-surface)",
                            color: "var(--text-primary)",
                            fontSize: "var(--text-sm)",
                          }}
                        />
                      </div>
                    </div>

                    <Button
                      id="login-magic-submit-btn"
                      type="submit"
                      variant="secondary"
                      size="md"
                      isLoading={isMagicLoading}
                      disabled={isGoogleLoading}
                      style={{ width: "100%" }}
                    >
                      Gửi liên kết đăng nhập
                    </Button>
                  </form>
                )}

                {/* Guest Action */}
                <div style={{ paddingTop: "8px", borderTop: "1px solid var(--border-subtle)", textAlign: "center" }}>
                  <button
                    id="login-guest-btn"
                    type="button"
                    onClick={handleGuestContinue}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-secondary)",
                      fontSize: "var(--text-sm)",
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-md)",
                      transition: "color var(--transition-fast)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                  >
                    <span>Tiếp tục không cần đăng nhập</span>
                    <ArrowRight size={15} />
                  </button>
                </div>

                {/* Privacy & Offline assurance footer */}
                <p
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-tertiary)",
                    textAlign: "center",
                    lineHeight: "1.45",
                    margin: 0,
                  }}
                >
                  Dữ liệu học tập trên thiết bị luôn được giữ lại 100%. Đăng nhập chỉ cần thiết khi bạn muốn sao lưu và đồng bộ giữa các thiết bị.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* SERVER RUNTIME AUTH FLOW */
          <div>
            {import.meta.env.DEV && (
              <div
                style={{
                  backgroundColor: "var(--accent-en-subtle)",
                  border: "1px solid var(--accent-en-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px 14px",
                  marginBottom: "var(--space-6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontSize: "var(--text-xs)", color: "var(--accent-en-text)" }}>
                  <span style={{ fontWeight: 700 }}>Tài khoản Demo có sẵn:</span>
                  <div>demo@tutrinhlanguage.local</div>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 8px",
                    borderRadius: "var(--radius-xs)",
                    backgroundColor: "var(--accent-en-primary)",
                    color: "#FFFFFF",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                  }}
                >
                  <KeyRound size={12} />
                  <span>Điền mẫu</span>
                </button>
              </div>
            )}

            {serverErrorMsg && (
              <div
                className="animate-fade-in"
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-error-bg)",
                  border: "1px solid var(--color-error-border)",
                  color: "var(--color-error-text)",
                  fontSize: "var(--text-sm)",
                  marginBottom: "var(--space-4)",
                }}
              >
                {serverErrorMsg}
              </div>
            )}

            <form onSubmit={handleServerSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label
                  htmlFor="login-email"
                  style={{
                    display: "block",
                    fontSize: "var(--text-xs)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--text-secondary)",
                    marginBottom: "6px",
                  }}
                >
                  Địa chỉ Email
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
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
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 38px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-strong)",
                      backgroundColor: "var(--bg-surface)",
                      fontSize: "var(--text-sm)",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  style={{
                    display: "block",
                    fontSize: "var(--text-xs)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--text-secondary)",
                    marginBottom: "6px",
                  }}
                >
                  Mật khẩu
                </label>
                <div style={{ position: "relative" }}>
                  <Lock
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
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 38px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-strong)",
                      backgroundColor: "var(--bg-surface)",
                      fontSize: "var(--text-sm)",
                    }}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isServerLoading}
                rightIcon={<ArrowRight size={18} />}
                style={{ width: "100%", marginTop: "8px" }}
              >
                Đăng nhập
              </Button>
            </form>

            <div
              style={{
                textAlign: "center",
                marginTop: "var(--space-6)",
                fontSize: "var(--text-sm)",
                color: "var(--text-secondary)",
              }}
            >
              Chưa có tài khoản?{" "}
              <Link to="/register" style={{ color: "var(--accent-en-primary)", fontWeight: 600 }}>
                Tạo tài khoản mới
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
