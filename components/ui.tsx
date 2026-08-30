"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const EASE_OUT = [0, 0, 0.2, 1] as const;

/**
 * Solid green CTA. Hovers to the darker green with a lift, presses down to
 * 0.98, and shows a spinner while `loading`.
 */
export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
  loading,
  height = 48,
  style,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
  height?: number;
  style?: React.CSSProperties;
}) {
  const off = disabled || loading;
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={off}
      whileHover={off ? undefined : { scale: 1.02, boxShadow: "0 2px 8px rgba(0,0,0,.1)" }}
      whileTap={off ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      style={{
        width: "100%",
        height,
        background: off ? "#A5DCA8" : "#2E9222",
        color: "#FFFFFF",
        border: "none",
        borderRadius: 8,
        fontFamily: "var(--font-archivo), sans-serif",
        fontWeight: 700,
        fontSize: 15,
        cursor: off ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        transition: "background 200ms var(--ease-out)",
        ...style,
      }}
    >
      {loading && <Spinner />}
      {children}
    </motion.button>
  );
}

/** Outlined button — white fill, green border, tints on hover. */
export function SecondaryButton({
  children,
  onClick,
  height = 48,
  borderColor = "#2E9222",
  color = "#2E9222",
  style,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  height?: number;
  borderColor?: string;
  color?: string;
  style?: React.CSSProperties;
}) {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      style={{
        width: "100%",
        height,
        background: hover ? "#F3FBF4" : "#FFFFFF",
        border: `2px solid ${borderColor}`,
        color,
        borderRadius: 8,
        fontFamily: "var(--font-archivo), sans-serif",
        fontWeight: 700,
        fontSize: 15,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        transition: "all 200ms var(--ease-out)",
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}

export function Spinner({ size = 16, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      style={{
        width: size,
        height: size,
        border: `2px solid ${color}`,
        borderTopColor: "transparent",
        borderRadius: "50%",
        display: "block",
      }}
    />
  );
}

/** Text input whose border + shadow animate on focus, matching the designs. */
export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  hint,
  required,
  as = "input",
  rows = 4,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  as?: "input" | "textarea";
  rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? "#E63946" : focused ? "#2E9222" : "#E5E5E5";

  const shared = {
    value,
    placeholder,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      width: "100%",
      boxSizing: "border-box" as const,
      padding: as === "textarea" ? "12px 14px" : "0 14px",
      height: as === "textarea" ? undefined : 48,
      border: `2px solid ${borderColor}`,
      borderRadius: 8,
      fontFamily: "var(--font-manrope), sans-serif",
      fontSize: 14,
      color: "#012418",
      background: "#FFFFFF",
      outline: "none",
      boxShadow: focused ? "0 2px 8px rgba(0,0,0,.1)" : "none",
      transition: "all 200ms var(--ease-out)",
      resize: "vertical" as const,
    },
  };

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {label && (
        <span
          style={{
            fontFamily: "var(--font-archivo), sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: "#012418",
          }}
        >
          {label}
          {required && <span style={{ color: "#E63946" }}> *</span>}
        </span>
      )}
      {as === "textarea" ? (
        <textarea {...shared} rows={rows} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input {...shared} type={type} onChange={(e) => onChange(e.target.value)} />
      )}
      {error ? (
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, color: "#E63946" }}
        >
          {error}
        </motion.span>
      ) : hint ? (
        <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, color: "#999999" }}>
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        gap: 16,
      }}
    >
      <h3
        style={{
          margin: 0,
          fontFamily: "var(--font-archivo), sans-serif",
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: "-0.01em",
          color: "#012418",
        }}
      >
        {children}
      </h3>
      {action}
    </div>
  );
}

export function Stars({ size = 12, letterSpacing = 1 }: { size?: number; letterSpacing?: number }) {
  return (
    <span style={{ color: "#FFB703", fontSize: size, letterSpacing: `${letterSpacing}px` }}>
      ★★★★★
    </span>
  );
}

/** Small quantity stepper used by cart rows and the PDP. */
export function QtyStepper({
  qty,
  onChange,
  size = "sm",
}: {
  qty: number;
  onChange: (n: number) => void;
  size?: "sm" | "lg";
}) {
  const btn = size === "lg" ? 44 : 32;
  const input = size === "lg" ? 80 : 50;
  const radius = size === "lg" ? 8 : 6;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: size === "lg" ? 12 : 8 }}>
      <StepButton size={btn} radius={radius} onClick={() => onChange(qty - 1)} label="Diminuir">
        −
      </StepButton>
      <input
        value={String(qty)}
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/\D/g, ""), 10);
          onChange(isNaN(n) ? 1 : n);
        }}
        aria-label="Quantidade"
        style={{
          width: input,
          height: btn,
          boxSizing: "border-box",
          border: size === "lg" ? "2px solid #E5E5E5" : "1px solid #E5E5E5",
          borderRadius: radius,
          textAlign: "center",
          fontFamily: "var(--font-manrope), sans-serif",
          fontWeight: 600,
          fontSize: size === "lg" ? 14 : 13,
          color: "#012418",
          outline: "none",
          padding: 0,
          background: "#FFFFFF",
        }}
      />
      <StepButton size={btn} radius={radius} onClick={() => onChange(qty + 1)} label="Aumentar">
        +
      </StepButton>
    </div>
  );
}

function StepButton({
  children,
  onClick,
  size,
  radius,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  size: number;
  radius: number;
  label: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.15, ease: EASE_OUT }}
      style={{
        width: size,
        height: size,
        background: hover ? "#E5E5E5" : "#F5F5F5",
        border: "none",
        borderRadius: radius,
        fontFamily: "var(--font-archivo), sans-serif",
        fontWeight: 700,
        fontSize: size === 44 ? 18 : 16,
        color: "#012418",
        cursor: "pointer",
        transition: "background 200ms var(--ease-out)",
      }}
    >
      {children}
    </motion.button>
  );
}

/** Status pill used across the order screens. */
export function StatusBadge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: 4,
        background: bg,
        color,
        fontFamily: "var(--font-archivo), sans-serif",
        fontWeight: 600,
        fontSize: 11,
      }}
    >
      {label}
    </span>
  );
}

export { EASE_OUT };
