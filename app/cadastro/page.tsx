"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthDivider, AuthShell, SocialAuthButtons, Toast } from "@/components/AuthShell";
import { EASE_OUT, Spinner } from "@/components/ui";
import { useAuth } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordStrength(pw: string) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return 1;
  if (score <= 2) return 2;
  return 3;
}

/** Screen 12 — Cadastro. */
export default function CadastroPage() {
  const router = useRouter();
  const { user, loading: authLoading, cadastrar, loginComGoogle, loginComApple } = useAuth();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [touched, setTouched] = useState({ nome: false, email: false, confirmar: false, terms: false });
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [toast, setToast] = useState<"success" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState("Erro ao criar conta.");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (!authLoading && user) router.replace("/");
  }, [authLoading, user, router]);

  const nomeValid = nome.trim().length >= 3;
  const emailValid = EMAIL_RE.test(email);
  const strength = passwordStrength(senha);
  const confirmValid = confirmar.length > 0 && confirmar === senha;

  const showNomeError = touched.nome && nome !== "" && !nomeValid;
  const showEmailError = touched.email && email !== "" && !emailValid;
  const showConfirmarError = touched.confirmar && confirmar !== "" && !confirmValid;
  const showTermsError = touched.terms && !terms;

  const canSubmit =
    nomeValid && emailValid && senha.length >= 8 && confirmValid && terms && !loading;

  const barColors =
    strength === 1
      ? ["#E63946", "#E5E5E5", "#E5E5E5"]
      : strength === 2
        ? ["#FFB703", "#FFB703", "#E5E5E5"]
        : strength === 3
          ? ["#2E9222", "#2E9222", "#2E9222"]
          : ["#E5E5E5", "#E5E5E5", "#E5E5E5"];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ nome: true, email: true, confirmar: true, terms: true });
    if (!canSubmit) return;
    setLoading(true);
    try {
      await cadastrar(nome.trim(), email, senha, telefone);
      setLoading(false);
      setToast("success");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setToast(null);
        router.push("/");
      }, 1500);
    } catch (err) {
      setLoading(false);
      const code = (err as { code?: string })?.code;
      const map: Record<string, string> = {
        "auth/email-already-in-use": "Este email já está cadastrado",
        "auth/invalid-email": "Email inválido",
        "auth/weak-password": "Senha muito fraca. Use pelo menos 6 caracteres",
        "auth/operation-not-allowed": "Cadastro indisponível no momento",
      };
      setErrorMsg((code && map[code]) || "Erro ao criar conta. Tente novamente.");
      setToast("error");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), 5000);
    }
  }

  async function submitSocial(fn: () => Promise<void>) {
    setSocialLoading(true);
    try {
      await fn();
      setSocialLoading(false);
      setToast("success");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setToast(null);
        router.push("/");
      }, 1500);
    } catch (err) {
      setSocialLoading(false);
      const code = (err as { code?: string })?.code;
      setErrorMsg(
        code === "auth/popup-closed-by-user"
          ? "Login cancelado"
          : "Não foi possível continuar. Tente novamente."
      );
      setToast("error");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), 5000);
    }
  }

  if (authLoading || user) {
    return (
      <AuthShell>
        <div style={{ padding: "120px 0", textAlign: "center", fontFamily: "var(--font-manrope), sans-serif", color: "#999999" }}>
          Carregando...
        </div>
      </AuthShell>
    );
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
            margin: "0 0 12px",
            fontFamily: "var(--font-archivo), sans-serif",
            fontWeight: 700,
            fontSize: 28,
            color: "#012418",
            textAlign: "center",
          }}
        >
          Criar sua conta
        </h1>
        <p
          style={{
            margin: "0 0 32px",
            fontFamily: "var(--font-manrope), sans-serif",
            fontSize: 14,
            color: "#999999",
            textAlign: "center",
          }}
        >
          Preencha os dados para começar suas compras
        </p>

        <SocialAuthButtons
          onGoogle={() => submitSocial(loginComGoogle)}
          onApple={() => submitSocial(loginComApple)}
          disabled={socialLoading}
        />
        <AuthDivider />

        <AuthField
          id="nome"
          label="Nome Completo"
          value={nome}
          onChange={setNome}
          onBlur={() => setTouched((t) => ({ ...t, nome: true }))}
          placeholder="João da Silva"
          valid={nomeValid}
          error={showNomeError ? "Nome deve ter pelo menos 3 caracteres" : null}
        />

        <AuthField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          placeholder="seu.email@exemplo.com"
          valid={emailValid}
          error={showEmailError ? "Email inválido ou já cadastrado" : null}
        />

        <AuthField
          id="telefone"
          label="Telefone"
          type="tel"
          value={telefone}
          onChange={setTelefone}
          onBlur={() => {}}
          placeholder="(35) 98414-1300"
          valid={true}
          error={null}
        />

        {/* Password + strength meter */}
        <div style={{ marginBottom: 20 }}>
          <FieldLabel htmlFor="senha">Crie uma senha</FieldLabel>
          <PasswordInput
            id="senha"
            value={senha}
            onChange={setSenha}
            show={showSenha}
            onToggle={() => setShowSenha((v) => !v)}
          />
          <div style={{ display: "flex", gap: 4, marginTop: 8, width: 60 }}>
            {barColors.map((c, i) => (
              <motion.span
                key={i}
                animate={{ background: c }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
                style={{ height: 3, flex: 1, borderRadius: 2, background: c, display: "block" }}
              />
            ))}
          </div>
          <div
            style={{
              marginTop: 6,
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 12,
              color: "#999999",
            }}
          >
            Mínimo 8 caracteres. Inclua maiúsculas, minúsculas e números.
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <FieldLabel htmlFor="confirmar">Confirme a senha</FieldLabel>
          <PasswordInput
            id="confirmar"
            value={confirmar}
            onChange={setConfirmar}
            onBlur={() => setTouched((t) => ({ ...t, confirmar: true }))}
            show={showConfirmar}
            onToggle={() => setShowConfirmar((v) => !v)}
            borderColor={
              showConfirmarError ? "#E63946" : confirmar && confirmValid ? "#2E9222" : undefined
            }
          />
          <AnimatePresence>
            {showConfirmarError && (
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
                As senhas não coincidem
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Terms */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 24 }}>
          <motion.button
            type="button"
            onClick={() => {
              setTerms((v) => !v);
              setTouched((t) => ({ ...t, terms: true }));
            }}
            role="checkbox"
            aria-checked={terms}
            animate={{
              background: terms ? "#2E9222" : "transparent",
              borderColor: showTermsError ? "#E63946" : terms ? "#2E9222" : "#E5E5E5",
            }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            style={{
              width: 18,
              height: 18,
              flex: "none",
              marginTop: 1,
              borderRadius: 4,
              border: "2px solid #E5E5E5",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {terms && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.15, ease: EASE_OUT }}
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="4 12 9 17 20 6" />
              </motion.svg>
            )}
          </motion.button>
          <div>
            <span
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 13,
                lineHeight: 1.5,
                color: showTermsError ? "#E63946" : "#012418",
                transition: "color 200ms var(--ease-out)",
              }}
            >
              Li e concordo com os{" "}
              <Link href="/cadastro" style={{ fontWeight: 600 }}>
                Termos de Serviço
              </Link>{" "}
              e{" "}
              <Link href="/cadastro" style={{ fontWeight: 600 }}>
                Política de Privacidade
              </Link>
            </span>
            <AnimatePresence>
              {showTermsError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: EASE_OUT }}
                  style={{
                    marginTop: 4,
                    fontFamily: "var(--font-manrope), sans-serif",
                    fontSize: 12,
                    color: "#E63946",
                  }}
                >
                  Você deve aceitar os termos
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.button
          type="submit"
          whileHover={canSubmit ? { y: -1, boxShadow: "0 2px 8px rgba(46,146,34,.2)" } : undefined}
          whileTap={canSubmit ? { scale: 0.98 } : undefined}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          style={{
            width: "100%",
            height: 48,
            background: "#2E9222",
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
            transition: "opacity 200ms var(--ease-out)",
          }}
        >
          {loading && <Spinner />}
          <span>{loading ? "Criando..." : "Criar Conta"}</span>
        </motion.button>

        <div
          style={{
            textAlign: "center",
            fontFamily: "var(--font-manrope), sans-serif",
            fontSize: 14,
            color: "#012418",
          }}
        >
          Já tem conta?{" "}
          <Link href="/login" style={{ color: "#2E9222", fontWeight: 600 }}>
            Entrar
          </Link>
        </div>
      </form>

      <AnimatePresence>
        {toast && (
          <Toast
            tone={toast === "success" ? "success" : "error"}
            message={toast === "success" ? "Conta criada com sucesso!" : errorMsg}
          />
        )}
      </AnimatePresence>
    </AuthShell>
  );
}

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "block",
        fontFamily: "var(--font-manrope), sans-serif",
        fontWeight: 600,
        fontSize: 14,
        color: "#012418",
        marginBottom: 8,
      }}
    >
      {children}
    </label>
  );
}

function AuthField({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  valid,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  placeholder: string;
  type?: string;
  valid: boolean;
  error: string | null;
}) {
  const [focused, setFocused] = useState(false);
  const border = error ? "#E63946" : focused || (value && valid) ? "#2E9222" : "#E5E5E5";

  return (
    <div style={{ marginBottom: 20 }}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur();
        }}
        placeholder={placeholder}
        aria-invalid={!!error}
        style={{
          width: "100%",
          height: 44,
          boxSizing: "border-box",
          padding: "12px 16px",
          border: `2px solid ${border}`,
          borderRadius: 8,
          fontFamily: "var(--font-manrope), sans-serif",
          fontSize: 14,
          color: "#012418",
          outline: "none",
          background: "#FFFFFF",
          boxShadow: focused ? "0 0 0 3px rgba(46,146,34,.1)" : "none",
          transition: "all 200ms var(--ease-out)",
        }}
      />
      <AnimatePresence>
        {error && (
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
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  onBlur,
  show,
  onToggle,
  borderColor,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  show: boolean;
  onToggle: () => void;
  borderColor?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [hover, setHover] = useState(false);
  const border = borderColor ?? (focused ? "#2E9222" : "#E5E5E5");

  return (
    <div style={{ position: "relative" }}>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        type={show ? "text" : "password"}
        placeholder="••••••••"
        style={{
          width: "100%",
          height: 44,
          boxSizing: "border-box",
          padding: "12px 44px 12px 16px",
          border: `2px solid ${border}`,
          borderRadius: 8,
          fontFamily: "var(--font-manrope), sans-serif",
          fontSize: 14,
          color: "#012418",
          outline: "none",
          background: "#FFFFFF",
          boxShadow: focused ? "0 0 0 3px rgba(46,146,34,.1)" : "none",
          transition: "all 200ms var(--ease-out)",
        }}
      />
      <button
        type="button"
        onClick={onToggle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
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
          color: hover ? "#2E9222" : "#999999",
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
          {show ? (
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
    </div>
  );
}
