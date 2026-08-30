"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shell } from "@/components/Shell";
import { ProductCard } from "@/components/ProductCard";
import { Icon } from "@/components/Icon";
import { EASE_OUT } from "@/components/ui";
import { useCategoriasAtivas, useProdutos } from "@/lib/hooks";
import { precoMinimo } from "@/lib/produtos";

const COLORS: [string, string][] = [
  ["Branco", "#FFFFFF"],
  ["Preto", "#2B2B2B"],
  ["Cinza", "#B8BCBB"],
  ["Vermelho", "#E63946"],
  ["Azul", "#0088B7"],
  ["Verde", "#2E9222"],
  ["Amarelo", "#FFB703"],
  ["Marrom", "#7B4B2A"],
];

const SORTS = ["Mais Relevantes", "Menor Preço", "Maior Preço"];

type CheckGroup = "categoria" | "volume";

/** Screen 8 — Produtos Filtrados. */
export default function ProdutosPage() {
  const { produtos, loading } = useProdutos();
  const { categorias } = useCategoriasAtivas();

  const [openGroups, setOpenGroups] = useState({
    categoria: true,
    preco: true,
    volume: true,
    cor: true,
  });
  const [checked, setChecked] = useState<Record<CheckGroup, Record<string, boolean>>>({
    categoria: {},
    volume: {},
  });
  const [color, setColor] = useState<string | null>(null);
  const [min, setMin] = useState("0");
  const [max, setMax] = useState("500");
  const [sort, setSort] = useState(SORTS[0]);

  const toggleGroup = (k: keyof typeof openGroups) =>
    setOpenGroups((s) => ({ ...s, [k]: !s[k] }));

  const toggleCheck = (group: CheckGroup, label: string) =>
    setChecked((s) => ({ ...s, [group]: { ...s[group], [label]: !s[group][label] } }));

  // Filter option lists derived from the real catalogue.
  const categoriaOpts = useMemo(() => {
    const counts = new Map<string, number>();
    produtos.forEach((p) => counts.set(p.categoria, (counts.get(p.categoria) ?? 0) + 1));
    return categorias
      .filter((c) => counts.has(c.nome))
      .map((c) => [c.nome, counts.get(c.nome) ?? 0] as [string, number]);
  }, [produtos, categorias]);

  const volumeOpts = useMemo(() => {
    const counts = new Map<string, number>();
    produtos.forEach((p) => p.volumes.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1)));
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [produtos]);

  const activeFilters = useMemo(() => {
    const out: { group: CheckGroup | "color" | "price"; key: string; label: string }[] = [];
    (["categoria", "volume"] as CheckGroup[]).forEach((g) => {
      Object.entries(checked[g]).forEach(([k, v]) => {
        if (v) out.push({ group: g, key: k, label: k });
      });
    });
    if (color) out.push({ group: "color", key: color, label: color });
    if (min !== "0" || max !== "500") out.push({ group: "price", key: "price", label: `R$ ${min}-${max}` });
    return out;
  }, [checked, color, min, max]);

  function removeActive(item: (typeof activeFilters)[number]) {
    if (item.group === "color") setColor(null);
    else if (item.group === "price") {
      setMin("0");
      setMax("500");
    } else toggleCheck(item.group, item.key);
  }

  function clearAll() {
    setChecked({ categoria: {}, volume: {} });
    setColor(null);
    setMin("0");
    setMax("500");
  }

  const selectedCategorias = Object.entries(checked.categoria)
    .filter(([, v]) => v)
    .map(([k]) => k);
  const selectedVolumes = Object.entries(checked.volume)
    .filter(([, v]) => v)
    .map(([k]) => k);
  const minVal = Number(min) || 0;
  const maxVal = Number(max) || Infinity;

  const products = useMemo(() => {
    let list = produtos.filter((p) => {
      if (selectedCategorias.length > 0 && !selectedCategorias.includes(p.categoria)) return false;
      if (selectedVolumes.length > 0 && !p.volumes.some((v) => selectedVolumes.includes(v))) return false;
      if (color && !p.todasCores && !p.cores.some((c) => c.nome === color)) return false;
      const preco = precoMinimo(p);
      if (preco < minVal || preco > maxVal) return false;
      return true;
    });
    list = [...list];
    if (sort === "Menor Preço") list.sort((a, b) => precoMinimo(a) - precoMinimo(b));
    if (sort === "Maior Preço") list.sort((a, b) => precoMinimo(b) - precoMinimo(a));
    return list;
  }, [produtos, selectedCategorias, selectedVolumes, color, minVal, maxVal, sort]);

  return (
    <Shell
      breadcrumb={[
        { label: "Início", href: "/" },
        { label: "Tintas", href: "/categorias" },
        { label: "Tintas Acrílicas" },
      ]}
    >
      <div className="filter-split">
        {/* Filters */}
        <aside
          className="unstick-mobile"
          style={{
            position: "sticky",
            top: 88,
            maxHeight: "calc(100vh - 120px)",
            overflow: "auto",
            paddingRight: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: 16,
              borderBottom: "1px solid #E5E5E5",
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
              Filtros
            </span>
            <LinkButton onClick={clearAll}>Limpar tudo</LinkButton>
          </div>

          <FilterGroup
            label="Categoria"
            open={openGroups.categoria}
            onToggle={() => toggleGroup("categoria")}
          >
            {categoriaOpts.map(([l, c]) => (
              <CheckRow
                key={l}
                label={l}
                count={c}
                checked={!!checked.categoria[l]}
                onToggle={() => toggleCheck("categoria", l)}
              />
            ))}
          </FilterGroup>

          <FilterGroup label="Preço" open={openGroups.preco} onToggle={() => toggleGroup("preco")}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <NumInput value={min} onChange={setMin} />
              <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11 }}>até</span>
              <NumInput value={max} onChange={setMax} />
            </div>
            <div
              style={{
                height: 4,
                background: "linear-gradient(to right,#E5E5E5 0%,#2E9222 50%,#E5E5E5 100%)",
                borderRadius: 2,
                marginTop: 12,
              }}
            />
            <div
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontWeight: 600,
                fontSize: 12,
                color: "#012418",
                marginTop: 12,
              }}
            >
              R$ {min || 0},00 - R$ {max || 0},00
            </div>
          </FilterGroup>

          <FilterGroup label="Volume" open={openGroups.volume} onToggle={() => toggleGroup("volume")}>
            {volumeOpts.map(([l, c]) => (
              <CheckRow
                key={l}
                label={l}
                count={c}
                checked={!!checked.volume[l]}
                onToggle={() => toggleCheck("volume", l)}
              />
            ))}
          </FilterGroup>

          <FilterGroup label="Cor" open={openGroups.cor} onToggle={() => toggleGroup("cor")}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {COLORS.map(([label, hex]) => {
                const on = color === label;
                return (
                  <motion.button
                    key={label}
                    title={label}
                    aria-label={label}
                    aria-pressed={on}
                    onClick={() => setColor(on ? null : label)}
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ duration: 0.2, ease: EASE_OUT }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: hex,
                      border: `2px solid ${on ? "#2E9222" : "transparent"}`,
                      cursor: "pointer",
                      boxShadow: on ? "0 0 0 1px #E5E5E5" : "0 0 0 1px #EEEEEE",
                      padding: 0,
                      transition: "border-color 200ms var(--ease-out)",
                    }}
                  />
                );
              })}
            </div>
          </FilterGroup>
        </aside>

        {/* Results */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: "1px solid #E5E5E5",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontWeight: 600,
                fontSize: 13,
                color: "#012418",
              }}
            >
              {products.length} produtos
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontWeight: 500,
                  fontSize: 12,
                  color: "#999999",
                }}
              >
                Ordenar por:
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Ordenar por"
                style={{
                  height: 36,
                  padding: "0 12px",
                  border: "2px solid #E5E5E5",
                  borderRadius: 6,
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontWeight: 600,
                  fontSize: 12,
                  color: "#012418",
                  background: "#FFFFFF",
                  outline: "none",
                  cursor: "pointer",
                  transition: "border-color 200ms var(--ease-out)",
                }}
              >
                {SORTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <AnimatePresence>
            {activeFilters.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                style={{ overflow: "hidden" }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-manrope), sans-serif",
                      fontWeight: 500,
                      fontSize: 12,
                      color: "#999999",
                    }}
                  >
                    Filtros aplicados:
                  </span>
                  <AnimatePresence mode="popLayout">
                    {activeFilters.map((af) => (
                      <motion.span
                        key={af.group + af.key}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.18, ease: EASE_OUT }}
                        style={{
                          display: "inline-flex",
                          gap: 6,
                          alignItems: "center",
                          background: "#F5F5F5",
                          border: "1px solid #E5E5E5",
                          padding: "6px 12px",
                          borderRadius: 20,
                          fontFamily: "var(--font-manrope), sans-serif",
                          fontWeight: 600,
                          fontSize: 11,
                          color: "#012418",
                        }}
                      >
                        {af.label}
                        <ChipRemove onClick={() => removeActive(af)} label={af.label} />
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  <LinkButton onClick={clearAll}>Limpar todos</LinkButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div
              style={{
                padding: "80px 0",
                textAlign: "center",
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 13,
                color: "#999999",
              }}
            >
              Carregando produtos...
            </div>
          ) : products.length === 0 ? (
            <div
              style={{
                padding: "80px 0",
                textAlign: "center",
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 13,
                color: "#999999",
              }}
            >
              Nenhum produto encontrado com os filtros selecionados.
            </div>
          ) : (
            <motion.div layout className="grid-4">
              {products.map((p, i) => (
                <ProductCard key={p.id} produto={p} index={i} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </Shell>
  );
}

function FilterGroup({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ borderBottom: "1px solid #E5E5E5", paddingBottom: 16, marginBottom: 16 }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          width: "100%",
          background: "transparent",
          border: "none",
          padding: 0,
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-archivo), sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: "#012418",
          }}
        >
          {label}
        </span>
        <Icon
          name="chevron"
          size={16}
          color="#012418"
          strokeWidth={2}
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 200ms var(--ease-out)" }}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckRow({
  label,
  count,
  checked,
  onToggle,
}: {
  label: string;
  count: number;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      role="checkbox"
      aria-checked={checked}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6px 0",
        cursor: "pointer",
        background: "transparent",
        border: "none",
        width: "100%",
        textAlign: "left",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <motion.span
          animate={{
            background: checked ? "#2E9222" : "#FFFFFF",
            borderColor: checked ? "#2E9222" : "#E5E5E5",
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
          <AnimatePresence>
            {checked && (
              <motion.svg
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
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
          </AnimatePresence>
        </motion.span>
        <span
          style={{
            fontFamily: "var(--font-manrope), sans-serif",
            fontWeight: 500,
            fontSize: 12,
            color: "#012418",
          }}
        >
          {label}
        </span>
      </span>
      <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, color: "#999999" }}>
        ({count})
      </span>
    </button>
  );
}

function NumInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      aria-label="Valor"
      style={{
        width: 80,
        height: 36,
        boxSizing: "border-box",
        border: `2px solid ${focused ? "#2E9222" : "#E5E5E5"}`,
        padding: 8,
        borderRadius: 6,
        fontFamily: "var(--font-manrope), sans-serif",
        fontSize: 12,
        color: "#012418",
        outline: "none",
        background: "#FFFFFF",
        transition: "border-color 200ms var(--ease-out)",
      }}
    />
  );
}

function ChipRemove({ onClick, label }: { onClick: () => void; label: string }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={`Remover filtro ${label}`}
      style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", display: "grid" }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        stroke={hover ? "#E63946" : "#999999"}
        strokeWidth="2.5"
        style={{ transition: "stroke 200ms var(--ease-out)" }}
      >
        <line x1="5" y1="5" x2="19" y2="19" />
        <line x1="19" y1="5" x2="5" y2="19" />
      </svg>
    </button>
  );
}

function LinkButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
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
        fontSize: 11,
        color: hover ? "#2E9222" : "#0088B7",
        transition: "color 200ms var(--ease-out)",
      }}
    >
      {children}
    </button>
  );
}
