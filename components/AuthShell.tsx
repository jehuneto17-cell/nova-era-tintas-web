"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { EASE_OUT } from "./ui";

/** Minimal frame used by Login and Cadastro — logo header only, centred card. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          height: 64,
          background: "#FFFFFF",
          borderBottom: "1px solid #E5E5E5",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          flex: "none",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-archivo), sans-serif",
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: "-0.01em",
            color: "#012418",
          }}
        >
          Nova Era Tintas
        </Link>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          style={{ width: "100%", maxWidth: 500 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

/** Toast pinned to the top-right, sliding in from the edge. */
export function Toast({ message, tone = "error" }: { message: string; tone?: "error" | "success" }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      role="status"
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        background: tone === "error" ? "#E63946" : "#00B20B",
        color: "#FFFFFF",
        padding: "14px 20px",
        borderRadius: 8,
        fontFamily: "var(--font-manrope), sans-serif",
        fontWeight: 600,
        fontSize: 13,
        boxShadow: "0 4px 16px rgba(0,0,0,.15)",
        zIndex: 100,
      }}
    >
      {message}
    </motion.div>
  );
}

/** Google + Apple buttons, side by side, matching the mobile app's social login row. */
export function SocialAuthButtons({
  onGoogle,
  onApple,
  disabled,
}: {
  onGoogle: () => void;
  onApple: () => void;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
      <SocialButton onClick={onGoogle} disabled={disabled} label="Google">
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.87 2.7-6.62z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58z"
          />
        </svg>
        <span>Google</span>
      </SocialButton>
      <SocialButton onClick={onApple} disabled={disabled} label="Apple">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#012418">
          <path d="M16.365 1.43c0 1.14-.462 2.24-1.21 3.05-.83.9-2.16 1.6-3.27 1.51-.14-1.1.46-2.26 1.19-3.02.83-.87 2.24-1.53 3.29-1.54zm3.34 15.13c-.42.98-.62 1.42-1.16 2.28-.75 1.2-1.81 2.7-3.12 2.71-1.17.01-1.47-.76-3.05-.75-1.58 0-1.92.76-3.09.74-1.31-.02-2.31-1.36-3.06-2.56C4.05 16.32 3.5 12.6 5 10.05c.9-1.5 2.42-2.44 4.08-2.46 1.35-.02 2.14.9 3.24.9 1.1 0 1.68-.9 3.24-.87.68.03 2.6.28 3.83 2.1-.1.06-2.28 1.34-2.26 3.97.03 3.14 2.75 4.19 2.78 4.2-.02.06-.42 1.5-1.19 2.63z" />
        </svg>
        <span>Apple</span>
      </SocialButton>
    </div>
  );
}

function SocialButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { y: -1, borderColor: "#012418" } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.15, ease: EASE_OUT }}
      aria-label={`Continuar com ${label}`}
      style={{
        flex: 1,
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        background: "#FFFFFF",
        border: "1px solid #E5E5E5",
        borderRadius: 8,
        fontFamily: "var(--font-manrope), sans-serif",
        fontWeight: 600,
        fontSize: 14,
        color: "#012418",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </motion.button>
  );
}

/** "ou continue com" divider used between social buttons and the email form. */
export function AuthDivider({ label = "ou continue com" }: { label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
      <span style={{ flex: 1, height: 1, background: "#E5E5E5" }} />
      <span
        style={{
          fontFamily: "var(--font-manrope), sans-serif",
          fontSize: 12,
          color: "#999999",
          flex: "none",
        }}
      >
        {label}
      </span>
      <span style={{ flex: 1, height: 1, background: "#E5E5E5" }} />
    </div>
  );
}

export function Checkbox({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: React.ReactNode;
}) {
  return (
    <button
      onClick={onToggle}
      role="checkbox"
      aria-checked={checked}
      type="button"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        background: "transparent",
        border: "none",
        padding: 0,
        textAlign: "left",
      }}
    >
      <motion.span
        animate={{
          background: checked ? "#00B20B" : "transparent",
          borderColor: checked ? "#00B20B" : "#E5E5E5",
        }}
        transition={{ duration: 0.18, ease: EASE_OUT }}
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          border: "2px solid #E5E5E5",
          display: "grid",
          placeItems: "center",
          flex: "none",
        }}
      >
        {checked && (
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
      </motion.span>
      <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 14, color: "#012418" }}>
        {label}
      </span>
    </button>
  );
}
