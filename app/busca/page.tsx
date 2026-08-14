"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shell } from "@/components/Shell";
import { Icon } from "@/components/Icon";
import { EASE_OUT } from "@/components/ui";
import { useBuscas } from "@/lib/hooks";

const RECENT_INIT: string[] = [];

/** Screen 9 — Busca (estado inicial: histórico, tendências, autocomplete). */
export default function BuscaPage() {
  const router = useRouter();
  const buscas = useBuscas();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState(RECENT_INIT);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const termos = buscas?.mostrar ? buscas.termos : [];
  const showSuggestions = focused && query.trim().length >= 2;
  const suggestions = showSuggestions
    ? termos.filter((l) => l.toLowerCase().includes(query.trim().toLowerCase()))
    : [];

  function submit(q: string) {
    if (!q.trim()) return;
    router.push(`/busca/resultados?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <Shell>
      <div style={{ padding: "16px 0" }}>
        <AnimatePresence>
          {!showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              style={{ textAlign: "center", marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}
            >
              <h1
                style={{
                  margin: "0 0 8px",
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 800,
                  fontSize: 28,
                  color: "#012418",
                }}
              >
                O que você está procurando?
              </h1>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontSize: 14,
                  color: "#666666",
                }}
              >
                Explore nossos produtos por nome, categoria ou tipo
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Big search field */}
        <div style={{ width: "100%", maxWidth: 600, margin: "0 auto 40px", position: "relative" }}>
          <Icon
            name="search"
            size={18}
            color="#00B20B"
            style={{ position: "absolute", left: 20, top: 19, pointerEvents: "none", zIndex: 2 }}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit(query);
            }}
            onFocus={() => {
              if (blurTimer.current) clearTimeout(blurTimer.current);
              setFocused(true);
            }}
            onBlur={() => {
              blurTimer.current = setTimeout(() => setFocused(false), 150);
            }}
            placeholder="Busque por tintas, pincéis..."
            aria-label="Buscar"
            style={{
              width: "100%",
              height: 56,
              boxSizing: "border-box",
              padding: "14px 44px 14px 48px",
              borderRadius: showSuggestions && suggestions.length > 0 ? "28px 28px 0 0" : 28,
              border: `2px solid ${focused ? "#00B20B" : "#E5E5E5"}`,
              boxShadow: focused ? "0 2px 12px rgba(0,178,11,.15)" : "none",
              outline: "none",
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 600,
              fontSize: 15,
              color: "#012418",
              background: "#FFFFFF",
              transition: "all 200ms var(--ease-out)",
            }}
          />
          <AnimatePresence>
            {query.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.15, ease: EASE_OUT }}
                onClick={() => setQuery("")}
                aria-label="Limpar busca"
                style={{
                  position: "absolute",
                  right: 16,
                  top: 19,
                  width: 18,
                  height: 18,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: 0,
                  display: "grid",
                  placeItems: "center",
                  zIndex: 2,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" stroke="#999999" strokeWidth="2.5">
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Autocomplete dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: EASE_OUT }}
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "100%",
                  background: "#FFFFFF",
                  border: "1px solid #E5E5E5",
                  borderTop: "none",
                  borderRadius: "0 0 12px 12px",
                  boxShadow: "0 4px 16px rgba(0,0,0,.1)",
                  maxHeight: 400,
                  overflowY: "auto",
                  zIndex: 100,
                }}
              >
                {suggestions.map((label) => (
                  <SuggestionRow key={label} label={label} onSelect={() => submit(label)} />
                ))}
                <SuggestionFooter onClick={() => submit("todas as tintas")} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!showSuggestions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            style={{ maxWidth: 900, margin: "0 auto" }}
          >
            {/* Recent */}
            <div style={{ marginBottom: 40 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-archivo), sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#012418",
                  }}
                >
                  Buscas Recentes
                </span>
                {recent.length > 0 && (
                  <ClearButton onClick={() => setRecent([])}>Limpar histórico</ClearButton>
                )}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <AnimatePresence mode="popLayout">
                  {recent.map((r, i) => (
                    <RecentChip
                      key={r}
                      label={r}
                      onSelect={() => submit(r)}
                      onRemove={() => setRecent((x) => x.filter((_, j) => j !== i))}
                    />
                  ))}
                </AnimatePresence>
                {recent.length === 0 && (
                  <span
                    style={{
                      fontFamily: "var(--font-manrope), sans-serif",
                      fontSize: 12,
                      color: "#999999",
                    }}
                  >
                    Nenhuma busca recente.
                  </span>
                )}
              </div>
            </div>

            {/* Trending */}
            {termos.length > 0 && (
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-archivo), sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#012418",
                    marginBottom: 16,
                  }}
                >
                  Em Destaque
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {termos.map((t, i) => (
                    <TrendingChip key={t} label={t} index={i} onSelect={() => submit(t)} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Shell>
  );
}

function SuggestionRow({
  label,
  onSelect,
}: {
  label: string;
  onSelect: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: "1px solid #F5F5F5",
        cursor: "pointer",
        background: hover ? "#F5F5F5" : "transparent",
        border: "none",
        width: "100%",
        textAlign: "left",
        transition: "background 150ms var(--ease-out)",
      }}
    >
      <Icon name="search" size={16} color="#00B20B" />
      <span
        style={{
          flex: 1,
          fontFamily: "var(--font-manrope), sans-serif",
          fontWeight: 500,
          fontSize: 13,
          color: "#012418",
        }}
      >
        {label}
      </span>
    </button>
  );
}

function SuggestionFooter({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "#E5E5E5" : "#F5F5F5",
        padding: "12px 16px",
        textAlign: "center",
        fontFamily: "var(--font-manrope), sans-serif",
        fontWeight: 700,
        fontSize: 12,
        cursor: "pointer",
        width: "100%",
        border: "none",
        color: "#012418",
        transition: "background 150ms var(--ease-out)",
      }}
    >
      Ver todas as tintas
    </button>
  );
}

function RecentChip({
  label,
  onSelect,
  onRemove,
}: {
  label: string;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.18, ease: EASE_OUT }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onSelect}
      style={{
        display: "inline-flex",
        gap: 6,
        alignItems: "center",
        background: hover ? "#E5E5E5" : "#F5F5F5",
        border: "1px solid #E5E5E5",
        padding: "8px 12px",
        borderRadius: 6,
        fontFamily: "var(--font-manrope), sans-serif",
        fontWeight: 600,
        fontSize: 12,
        color: "#666666",
        cursor: "pointer",
        transition: "background 200ms var(--ease-out)",
      }}
    >
      <Icon name="clock" size={14} color="#999999" strokeWidth={2} />
      {label}
      <span
        role="button"
        aria-label={`Remover ${label}`}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        style={{ display: "grid", placeItems: "center", cursor: "pointer" }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" stroke="#999999" strokeWidth="3">
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </svg>
      </span>
    </motion.span>
  );
}

function TrendingChip({
  label,
  index,
  onSelect,
}: {
  label: string;
  index: number;
  onSelect: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05, ease: EASE_OUT }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onSelect}
      style={{
        display: "inline-flex",
        gap: 8,
        alignItems: "center",
        background: hover ? "#E8F5E9" : "#F3FBF4",
        border: "1px solid #00B20B",
        padding: "8px 12px",
        borderRadius: 6,
        fontFamily: "var(--font-manrope), sans-serif",
        fontWeight: 600,
        fontSize: 12,
        color: "#00B20B",
        cursor: "pointer",
        transition: "background 200ms var(--ease-out)",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00B20B" strokeWidth="2">
        <polyline points="3 17 9 11 13 15 21 6" />
        <polyline points="15 6 21 6 21 12" />
      </svg>
      {label}
    </motion.button>
  );
}

function ClearButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontFamily: "var(--font-manrope), sans-serif",
        fontWeight: 500,
        fontSize: 12,
        color: hover ? "#00B20B" : "#0088B7",
        transition: "color 200ms var(--ease-out)",
      }}
    >
      {children}
    </button>
  );
}
