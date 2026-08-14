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
