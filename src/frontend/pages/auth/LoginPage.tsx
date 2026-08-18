import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sparkles, Lock, Mail, ArrowRight, KeyRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { getFriendlyErrorMessage } from "../../api/client";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMsg(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("demo@tutrinhlanguage.local");
    setPassword("Demo123!");
    setErrorMsg(null);
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
          maxWidth: "440px",
          padding: "var(--space-8)",
          boxShadow: "var(--shadow-xl)",
          border: "1px solid var(--border-default)",
        }}
      >
        {/* Branding */}
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
              boxShadow: "var(--shadow-md)",
              marginBottom: "var(--space-3)",
            }}
          >
            <Sparkles size={24} />
          </div>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>TÚ TRINH LANGUAGE</h1>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginTop: "4px" }}>
            Không gian học tiếng Anh & tiếng Trung cá nhân hóa
          </p>
        </div>

        {/* Demo Account Quick-Fill Helper */}
        {import.meta.env.DEV && <div
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
        </div>}

        {/* Error Notice */}
        {errorMsg && (
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
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label
              htmlFor="login-email"
              style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "6px" }}
            >
              Địa chỉ Email
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
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
              style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "6px" }}
            >
              Mật khẩu
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
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
            isLoading={isLoading}
            rightIcon={<ArrowRight size={18} />}
            style={{ width: "100%", marginTop: "8px" }}
          >
            Đăng nhập
          </Button>
        </form>

        {/* Register Switch */}
        <div style={{ textAlign: "center", marginTop: "var(--space-6)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
          Chưa có tài khoản?{" "}
          <Link to="/register" style={{ color: "var(--accent-en-primary)", fontWeight: 600 }}>
            Tạo tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
};
