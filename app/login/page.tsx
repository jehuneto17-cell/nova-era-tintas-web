"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthDivider, AuthShell, Checkbox, SocialAuthButtons, Toast } from "@/components/AuthShell";
import { EASE_OUT, Spinner } from "@/components/ui";
import { useAuth } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Email ou senha inválidos",
  "auth/user-not-found": "Email ou senha inválidos",
  "auth/wrong-password": "Email ou senha inválidos",
  "auth/invalid-email": "Email inválido",
  "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde",
  "auth/user-disabled": "Esta conta foi desativada",
};

function friendlyError(err: unknown): string {
  const code = (err as { code?: string })?.code;
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  return "Não foi possível entrar. Tente novamente.";
}

/** Screen 11 — Login. */
export default function LoginPage() {
  const router = useRouter();
  const { login, loginComGoogle, loginComApple } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const emailValid = email === "" || EMAIL_RE.test(email);
  const showEmailError = emailTouched && email !== "" && !emailValid;
  const canSubmit = EMAIL_RE.test(email) && password.length > 0 && !loading;

  const emailBorder = showEmailError
    ? "#E63946"
    : emailFocused || (email && emailValid)
      ? "#00B20B"
      : "#E5E5E5";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setLoading(false);
      setToast(friendlyError(err));
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), 4000);
    }
  }

  async function submitSocial(fn: () => Promise<void>) {
    setSocialLoading(true);
    try {
      await fn();
      router.push("/");
    } catch (err) {
      setSocialLoading(false);
      setToast(friendlyError(err));
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), 4000);
    }
  }

  return (
    <AuthShell>
      <form
        onSubmit={submit}
        style={{
          background: "#FFFFFF",
          border: "1px solid #E5E5E5",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,.05)",
          padding: 40,
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            margin: "0 0 32px",
            fontFamily: "var(--font-archivo), sans-serif",
            fontWeight: 700,
            fontSize: 28,
            color: "#012418",
            textAlign: "center",
          }}
        >
          Entrar na sua conta
        </h1>

        <SocialAuthButtons
          onGoogle={() => submitSocial(loginComGoogle)}
          onApple={() => submitSocial(loginComApple)}
          disabled={socialLoading}
        />
        <AuthDivider />

        <div style={{ marginBottom: 20 }}>
          <label
            htmlFor="login-email"
            style={{
              display: "block",
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 600,
              fontSize: 14,
              color: "#012418",
              marginBottom: 8,
            }}
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => {
              setEmailFocused(false);
              setEmailTouched(true);
            }}
            placeholder="seu.email@exemplo.com"
            aria-invalid={showEmailError}
            style={{
              width: "100%",
              height: 44,
              boxSizing: "border-box",
              padding: "12px 16px",
              border: `2px solid ${emailBorder}`,
              borderRadius: 8,
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 14,
              color: "#012418",
              outline: "none",
              background: "#FFFFFF",
              boxShadow:
                email && emailValid && !showEmailError ? "0 0 0 3px rgba(0,178,11,.1)" : "none",
              transition: "all 200ms var(--ease-out)",
            }}
          />
          <AnimatePresence>
            {showEmailError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: EASE_OUT }}
                style={{
                  marginTop: 6,
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontSize: 12,
                  color: "#E63946",
                }}
              >
                Formato de email inválido
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="login-password"
            style={{
              display: "block",
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 600,
              fontSize: 14,
              color: "#012418",
              marginBottom: 8,
            }}
          >
            Senha
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPwFocused(true)}
              onBlur={() => setPwFocused(false)}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              style={{
                width: "100%",
                height: 44,
                boxSizing: "border-box",
                padding: "12px 44px 12px 16px",
                border: `2px solid ${pwFocused ? "#00B20B" : "#E5E5E5"}`,
                borderRadius: 8,
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 14,
                color: "#012418",
                outline: "none",
                background: "#FFFFFF",
                boxShadow: pwFocused ? "0 0 0 3px rgba(0,178,11,.1)" : "none",
                transition: "all 200ms var(--ease-out)",
              }}
            />
            <EyeToggle open={showPassword} onClick={() => setShowPassword((v) => !v)} />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Checkbox checked={remember} onToggle={() => setRemember((v) => !v)} label="Lembrar-me" />
          <Link
            href="/login"
            style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 600, fontSize: 14 }}
          >
            Esqueci minha senha?
          </Link>
        </div>

        <motion.button
          type="submit"
          disabled={!canSubmit}
          whileHover={canSubmit ? { y: -1, boxShadow: "0 2px 8px rgba(0,178,11,.2)" } : undefined}
          whileTap={canSubmit ? { scale: 0.98 } : undefined}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          style={{
            width: "100%",
            height: 48,
            background: "#00B20B",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 8,
            fontFamily: "var(--font-archivo), sans-serif",
            fontWeight: 700,
            fontSize: 15,
            cursor: canSubmit ? "pointer" : "not-allowed",
            opacity: canSubmit ? 1 : 0.5,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            transition: "opacity 200ms var(--ease-out), background 200ms var(--ease-out)",
          }}
        >
          {loading && <Spinner />}
          <span>{loading ? "Entrando..." : "Entrar"}</span>
        </motion.button>

        <div
          style={{
            textAlign: "center",
            fontFamily: "var(--font-manrope), sans-serif",
            fontSize: 14,
            color: "#012418",
          }}
        >
          Não tem conta?{" "}
          <Link href="/cadastro" style={{ color: "#00B20B", fontWeight: 600 }}>
            Criar conta
          </Link>
        </div>
      </form>

      <AnimatePresence>{toast && <Toast message={toast} />}</AnimatePresence>
    </AuthShell>
  );
}

function EyeToggle({ open, onClick }: { open: boolean; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={open ? "Ocultar senha" : "Mostrar senha"}
      style={{
        position: "absolute",
        right: 12,
        top: 12,
        width: 20,
        height: 20,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: 0,
        color: hover ? "#00B20B" : "#999999",
        display: "grid",
        placeItems: "center",
        transition: "color 200ms var(--ease-out)",
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {open ? (
          <>
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
            <circle cx="12" cy="12" r="3" />
          </>
        ) : (
          <>
            <path d="M3 3l18 18" />
            <path d="M10.6 5.1A10.8 10.8 0 0 1 12 5c6.5 0 10 6 10 6a15 15 0 0 1-2.3 3.1M6.5 6.6C4 8.3 2 11 2 11s3.5 6 10 6a9.6 9.6 0 0 0 3.4-.6" />
            <path d="M9.5 9.7A2.9 2.9 0 0 0 9 11a3 3 0 0 0 3 3 2.9 2.9 0 0 0 1.3-.3" />
          </>
        )}
      </svg>
    </button>
  );
}
