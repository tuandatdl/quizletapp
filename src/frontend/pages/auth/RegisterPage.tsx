import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Lock, Mail, User as UserIcon, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { getFriendlyErrorMessage } from "../../api/client";

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg("Vui lòng điền đầy đủ họ tên, email và mật khẩu.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Mật khẩu phải có độ dài tối thiểu 8 ký tự.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      await register({ name, email, password });
      navigate("/", { replace: true });
    } catch (err: any) {
      setErrorMsg(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
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
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>Tạo tài khoản học tập</h1>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginTop: "4px" }}>
            Bắt đầu hành trình chinh phục tiếng Anh và tiếng Trung cùng Lexis
          </p>
        </div>

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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label
              htmlFor="register-name"
              style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "6px" }}
            >
              Họ và tên
            </label>
            <div style={{ position: "relative" }}>
              <UserIcon size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
              <input
                id="register-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Minh Anh"
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
              htmlFor="register-email"
              style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "6px" }}
            >
              Địa chỉ Email
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
              <input
                id="register-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="learner@example.com"
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
              htmlFor="register-password"
              style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "6px" }}
            >
              Mật khẩu (tối thiểu 8 ký tự)
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
              <input
                id="register-password"
                type="password"
                required
                minLength={8}
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
            Đăng ký tài khoản
          </Button>
        </form>

        <div style={{ textAlign: "center", marginTop: "var(--space-6)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
          Đã có tài khoản?{" "}
          <Link to="/login" style={{ color: "var(--accent-en-primary)", fontWeight: 600 }}>
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
