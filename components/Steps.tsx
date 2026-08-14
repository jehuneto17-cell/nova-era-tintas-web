"use client";

import { motion } from "framer-motion";
import { EASE_OUT } from "./ui";

/** Checkout progress rail: Entrega → Pagamento → Confirmação. */
export function Steps({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Entrega" },
    { n: 2, label: "Pagamento" },
    { n: 3, label: "Confirmação" },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "#F5F5F5",
        padding: "12px 16px",
        borderRadius: 8,
        borderBottom: "1px solid #E5E5E5",
        marginBottom: 20,
        flexWrap: "wrap",
      }}
    >
      {steps.map((st, i) => {
        const done = st.n <= current;
        return (
          <div key={st.n} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <motion.div
                initial={false}
                animate={{
                  background: done ? "#00B20B" : "#F5F5F5",
                  color: done ? "#FFFFFF" : "#999999",
                  scale: st.n === current ? 1.1 : 1,
                }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  border: done ? "none" : "1px solid #E5E5E5",
                }}
              >
                {st.n}
              </motion.div>
              <span
                style={{
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 600,
                  fontSize: 13,
                  color: done ? "#012418" : "#999999",
                  transition: "color 250ms var(--ease-out)",
                }}
              >
                {st.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                style={{
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#CCCCCC",
                }}
              >
                →
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
