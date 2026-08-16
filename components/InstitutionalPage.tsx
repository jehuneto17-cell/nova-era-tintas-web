"use client";

import { motion } from "framer-motion";
import { Shell, Breadcrumb } from "@/components/Shell";
import { EASE_OUT } from "@/components/ui";

export function InstitutionalPage({
  title,
  breadcrumbLabel,
  subtitle,
  children,
}: {
  title: string;
  breadcrumbLabel: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Shell breadcrumb={[{ label: "Home", href: "/" }, { label: breadcrumbLabel }]}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          style={{ width: "100%", maxWidth: 800 }}
        >
          <h1
            style={{
              margin: "0 0 12px",
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 700,
              fontSize: 28,
              color: "#012418",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              margin: "0 0 24px",
              paddingBottom: 24,
              borderBottom: "1px solid #E5E5E5",
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 14,
              color: "#999999",
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 40 }}>
            {children}
          </div>
        </motion.div>
      </div>
    </Shell>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E5E5",
        borderRadius: 12,
        padding: 20,
      }}
    >
      <h2
        style={{
          margin: "0 0 10px",
          fontFamily: "var(--font-archivo), sans-serif",
          fontWeight: 700,
          fontSize: 15,
          color: "#012418",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontFamily: "var(--font-manrope), sans-serif",
          fontSize: 14,
          color: "#333333",
          lineHeight: 1.7,
        }}
      >
        {children}
      </div>
    </div>
  );
}
