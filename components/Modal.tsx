"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { EASE_OUT } from "./ui";

/** Dimmed overlay + spring-in dialog. Escape closes; body scroll locks. */
export function Modal({
  onClose,
  children,
  maxWidth = 360,
  label,
}: {
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
  label: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: EASE_OUT }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(1,36,24,.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: 16,
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FFFFFF",
          borderRadius: 12,
          padding: 32,
          width: "100%",
          maxWidth,
          boxShadow: "0 8px 32px rgba(0,0,0,.2)",
          boxSizing: "border-box",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
