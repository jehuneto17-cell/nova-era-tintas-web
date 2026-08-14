"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

/**
 * Standard page frame: sticky header, sticky left rail, animated main, footer.
 * Main content fades up on route entry — the design's `fadeUp` keyframe.
 */
export function Shell({
  children,
  breadcrumb,
}: {
  children: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF" }}>
      <Header />
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <Sidebar />
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
          style={{ flex: 1, minWidth: 0, padding: 24 }}
        >
          {breadcrumb && <Breadcrumb items={breadcrumb} />}
          {children}
        </motion.main>
      </div>
      <Footer />
    </div>
  );
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 20,
        fontFamily: "var(--font-manrope), sans-serif",
        fontSize: 12,
        flexWrap: "wrap",
      }}
    >
      {items.map((it, i) => (
        <span key={it.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {it.href ? (
            <Link href={it.href}>{it.label}</Link>
          ) : (
            <span style={{ color: "#012418" }}>{it.label}</span>
          )}
          {i < items.length - 1 && <span style={{ color: "#999999" }}>/</span>}
        </span>
      ))}
    </nav>
  );
}
