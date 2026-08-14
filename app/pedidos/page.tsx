"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shell } from "@/components/Shell";
import { EASE_OUT, PrimaryButton } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { subscribePedidosDoCliente } from "@/lib/pedidos";
import { brl } from "@/lib/store";
import type { Pedido, PedidoEstado } from "@/lib/types";

const PAGE_SIZE = 5;

const ESTADO_LABEL: Record<PedidoEstado, string> = {
  em_negociacao: "Em Negociação",
  aguardando_pagamento: "Aguardando Pagamento",
  aguardando_confirmacao: "Aguardando Confirmação",
  pago: "Pagamento Confirmado",
  separacao: "Separação",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
  expirado: "Expirado",
};

const ESTADO_STYLE: Record<PedidoEstado, { bg: string; color: string }> = {
  em_negociacao: { bg: "#FFF8E5", color: "#FFB703" },
  aguardando_pagamento: { bg: "#FFF8E5", color: "#FFB703" },
  aguardando_confirmacao: { bg: "#FFF8E5", color: "#FFB703" },
  pago: { bg: "#E8F5E9", color: "#00B20B" },
  separacao: { bg: "#F0F7FB", color: "#0088B7" },
  enviado: { bg: "#F0F7FB", color: "#0088B7" },
  entregue: { bg: "#E8F5E9", color: "#00B20B" },
  cancelado: { bg: "#FFEBEE", color: "#E63946" },
  expirado: { bg: "#FFEBEE", color: "#E63946" },
};

const ESTADO_OPTIONS = Object.keys(ESTADO_LABEL) as PedidoEstado[];

function formatDate(iso: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const MESES = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

function pedidoTotal(p: Pedido) {
  return p.itens.reduce((s, i) => s + i.preco * i.qtd, 0) + p.frete;
}

function pedidoDescricao(p: Pedido) {
  return p.itens.map((i) => `${i.qtd}x ${i.nome}`).join(", ");
}

/** Screen 15 — Meus Pedidos. */
export default function PedidosPage() {
  const router = useRouter();
  const { user, cliente, loading: authLoading } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidosLoaded, setPedidosLoaded] = useState(false);
  const [loadedClienteId, setLoadedClienteId] = useState<string | null | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Todos" | PedidoEstado>("Todos");
  const [sortSelect, setSortSelect] = useState("recentes");
  const [sortField, setSortField] = useState<"data" | "numero" | "valor" | "status">("data");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const clienteId = cliente?.id ?? null;
  if (clienteId !== loadedClienteId) {
    setLoadedClienteId(clienteId);
    setPedidos([]);
    setPedidosLoaded(false);
  }
  // "Carregando" enquanto o Auth ainda resolve, ou enquanto já sabemos o
  // cliente mas a primeira leitura dos pedidos ainda não chegou.
  const loading = authLoading || (!!clienteId && !pedidosLoaded);

  useEffect(() => {
    if (!cliente) return;
    const unsub = subscribePedidosDoCliente(cliente.id, (list) => {
      setPedidos(list);
      setPedidosLoaded(true);
    });
    return unsub;
  }, [cliente]);

  const filtered = useMemo(() => {
    let list = [...pedidos];
    if (statusFilter !== "Todos") list = list.filter((o) => o.estado === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (o) => o.numero.toLowerCase().includes(q) || formatDate(o.criadoEm).toLowerCase().includes(q),
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sortField === "numero") return a.numero.localeCompare(b.numero) * dir;
      if (sortField === "valor") return (pedidoTotal(a) - pedidoTotal(b)) * dir;
      if (sortField === "status") return a.estado.localeCompare(b.estado) * dir;
      return (a.criadoEm < b.criadoEm ? -1 : a.criadoEm > b.criadoEm ? 1 : 0) * dir;
    });
    return list;
  }, [pedidos, search, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, (current - 1) * PAGE_SIZE + PAGE_SIZE);

  function applySortSelect(v: string) {
    const map: Record<string, ["data" | "numero" | "valor" | "status", "asc" | "desc"]> = {
      recentes: ["data", "desc"],
      antigos: ["data", "asc"],
      maior: ["valor", "desc"],
      menor: ["valor", "asc"],
      status: ["status", "asc"],
    };
    setSortSelect(v);
    setSortField(map[v][0]);
    setSortDir(map[v][1]);
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("Todos");
    applySortSelect("recentes");
  }

  if (!authLoading && !user) {
    return (
      <Shell>
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E5E5",
            borderRadius: 12,
            padding: "64px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 700,
              fontSize: 20,
              color: "#012418",
              marginBottom: 8,
            }}
          >
            Entre para ver seus pedidos
          </div>
          <p style={{ margin: "0 0 24px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 14, color: "#999999" }}>
            Faça login para acompanhar seus pedidos.
          </p>
          <div style={{ maxWidth: 240, margin: "0 auto" }}>
            <PrimaryButton height={44} onClick={() => router.push("/login")}>
              Entrar
            </PrimaryButton>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-archivo), sans-serif",
            fontWeight: 700,
            fontSize: 28,
            color: "#012418",
          }}
        >
          Meus Pedidos
        </h1>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            background: "#F8F8F8",
            padding: "8px 16px",
            borderRadius: 8,
            fontFamily: "var(--font-manrope), sans-serif",
            fontSize: 14,
            color: "#999999",
          }}
        >
          {pedidos.length} pedidos
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          background: "#F8F8F8",
          border: "1px solid #E5E5E5",
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 200 }}>
          <FilterLabel>Buscar</FilterLabel>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <FilterLabel>Status</FilterLabel>
          <FilterSelect
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v as "Todos" | PedidoEstado); setPage(1); }}
            width={200}
            options={[
              { value: "Todos", label: "Todos" },
              ...ESTADO_OPTIONS.map((e) => ({ value: e, label: ESTADO_LABEL[e] })),
            ]}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <FilterLabel>Ordenar por</FilterLabel>
          <FilterSelect
            value={sortSelect}
            onChange={applySortSelect}
            width={180}
            options={[
              { value: "recentes", label: "Mais recentes" },
              { value: "antigos", label: "Mais antigos" },
              { value: "maior", label: "Maior valor" },
              { value: "menor", label: "Menor valor" },
              { value: "status", label: "Status" },
            ]}
          />
        </div>
        <ClearFilters onClick={clearFilters} />
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E5E5",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 1px 8px rgba(0,0,0,.05)",
            }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  height: 64,
                  borderBottom: "1px solid #E5E5E5",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "0 16px",
                }}
              >
                <Shimmer width={80} />
                <Shimmer width={110} />
                <Shimmer flex />
                <Shimmer width={80} />
                <Shimmer width={120} height={24} />
              </div>
            ))}
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E5E5",
              borderRadius: 12,
              padding: "64px 24px",
              textAlign: "center",
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#999999"
              strokeWidth="1.5"
              style={{ margin: "0 auto 16px", display: "block" }}
            >
              <path d="M3 7l9-4 9 4v10l-9 4-9-4z" />
              <path d="M3 7l9 4 9-4M12 11v10" />
            </svg>
            <div
              style={{
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 20,
                color: "#012418",
                marginBottom: 8,
              }}
            >
              Nenhum pedido encontrado
            </div>
            <p
              style={{
                margin: "0 0 24px",
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 14,
                color: "#999999",
              }}
            >
              Você ainda não realizou nenhuma compra. Comece a explorar!
            </p>
            <div style={{ maxWidth: 240, margin: "0 auto" }}>
              <PrimaryButton height={44} onClick={() => router.push("/produtos")}>
                Continuar Comprando
              </PrimaryButton>
            </div>
          </motion.div>
        ) : (
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E5E5",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 1px 8px rgba(0,0,0,.05)",
              }}
            >
              <div className="orders-row orders-head">
                <SortHeader
                  onClick={() => {
                    setSortField("numero");
                    setSortDir(sortField === "numero" && sortDir === "asc" ? "desc" : "asc");
                  }}
                  arrow={sortField === "numero" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                >
                  Nº Pedido
                </SortHeader>
                <SortHeader
                  onClick={() => {
                    setSortField("data");
                    setSortDir(sortField === "data" && sortDir === "desc" ? "asc" : "desc");
                  }}
                  arrow={sortField === "data" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                >
                  Data
                </SortHeader>
                <HeadCell>Descrição</HeadCell>
                <HeadCell>Valor</HeadCell>
                <HeadCell>Status</HeadCell>
                <div />
              </div>

              <AnimatePresence initial={false}>
                {pageItems.map((o, i) => (
                  <OrderRow key={o.id} pedido={o} index={i} onOpen={() => router.push(`/pedidos/${o.id}`)} />
                ))}
              </AnimatePresence>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 12,
                marginTop: 32,
                paddingTop: 24,
                borderTop: "1px solid #E5E5E5",
              }}
            >
              <span
                style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#999999" }}
              >
                Página {current} de {totalPages} (mostrando {pageItems.length} de {filtered.length}{" "}
                pedidos)
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 4,
                marginTop: 12,
              }}
            >
              <PageArrow disabled={current === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                ‹
              </PageArrow>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <PageNumber key={n} n={n} active={n === current} onClick={() => setPage(n)} />
              ))}
              <PageArrow
                disabled={current === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                ›
              </PageArrow>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  );
}

function OrderRow({ pedido, index, onOpen }: { pedido: Pedido; index: number; onOpen: () => void }) {
  const [hover, setHover] = useState(false);
  const style = ESTADO_STYLE[pedido.estado];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: EASE_OUT }}
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="orders-row"
      style={{
        minHeight: 64,
        borderBottom: "1px solid #E5E5E5",
        alignItems: "center",
        cursor: "pointer",
        background: hover ? "#F8F8F8" : "transparent",
        transition: "background 150ms var(--ease-out)",
      }}
    >
      <div
        style={{
          fontFamily: "'Courier New', monospace",
          fontWeight: 600,
          fontSize: 13,
          color: "#0088B7",
        }}
      >
        {pedido.numero}
      </div>
      <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#012418" }}>
        {formatDate(pedido.criadoEm)}
      </div>
      <div
        style={{
          fontFamily: "var(--font-manrope), sans-serif",
          fontSize: 13,
          color: "#999999",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {pedidoDescricao(pedido)}
      </div>
      <div
        style={{
          fontFamily: "var(--font-manrope), sans-serif",
          fontWeight: 600,
          fontSize: 13,
          color: "#00B20B",
        }}
      >
        {brl(pedidoTotal(pedido))}
      </div>
      <div>
        <span
          style={{
            display: "inline-block",
            fontFamily: "var(--font-manrope), sans-serif",
            fontWeight: 600,
            fontSize: 12,
            padding: "6px 12px",
            borderRadius: 4,
            background: style.bg,
            color: style.color,
            borderLeft: `3px solid ${style.color}`,
          }}
        >
          {ESTADO_LABEL[pedido.estado]}
        </span>
      </div>
      <motion.div
        animate={{ x: hover ? 2 : 0, color: hover ? "#00B20B" : "#999999" }}
        transition={{ duration: 0.15, ease: EASE_OUT }}
        style={{ fontSize: 20, textAlign: "right" }}
      >
        ›
      </motion.div>
    </motion.div>
  );
}

function Shimmer({ width, height = 14, flex }: { width?: number; height?: number; flex?: boolean }) {
  return (
    <div
      className="shimmer"
      style={{
        width: flex ? undefined : width,
        flex: flex ? 1 : "none",
        height,
        borderRadius: 4,
      }}
    />
  );
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        fontFamily: "var(--font-manrope), sans-serif",
        fontWeight: 600,
        fontSize: 12,
        color: "#999999",
      }}
    >
      {children}
    </label>
  );
}

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#999999"
        strokeWidth="2"
        style={{ position: "absolute", left: 12, top: 12, pointerEvents: "none" }}
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="16.5" y1="16.5" x2="21" y2="21" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Nº do pedido ou data..."
        aria-label="Buscar pedidos"
        style={{
          width: "100%",
          height: 40,
          boxSizing: "border-box",
          padding: "10px 16px 10px 38px",
          border: `2px solid ${focused ? "#00B20B" : "#E5E5E5"}`,
          borderRadius: 8,
          fontFamily: "var(--font-manrope), sans-serif",
          fontSize: 14,
          color: "#012418",
          outline: "none",
          background: "#FFFFFF",
          boxShadow: focused ? "0 0 0 3px rgba(0,178,11,.1)" : "none",
          transition: "all 200ms var(--ease-out)",
        }}
      />
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  width,
}: {
  value: string;
  onChange: (v: string) => void;
  options: (string | { value: string; label: string })[];
  width: number;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%",
        maxWidth: width,
        minWidth: 140,
        height: 40,
        padding: "10px 12px",
        border: `2px solid ${focused ? "#00B20B" : "#E5E5E5"}`,
        borderRadius: 8,
        fontFamily: "var(--font-manrope), sans-serif",
        fontSize: 14,
        outline: "none",
        background: "#FFFFFF",
        color: "#012418",
        cursor: "pointer",
        transition: "border-color 200ms var(--ease-out)",
      }}
    >
      {options.map((o) =>
        typeof o === "string" ? (
          <option key={o} value={o}>
            {o}
          </option>
        ) : (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ),
      )}
    </select>
  );
}

function ClearFilters({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: 40,
        background: "transparent",
        border: "none",
        color: hover ? "#00B20B" : "#0088B7",
        fontFamily: "var(--font-manrope), sans-serif",
        fontWeight: 600,
        fontSize: 13,
        cursor: "pointer",
        display: "flex",
        gap: 4,
        alignItems: "center",
        marginLeft: "auto",
        textDecoration: hover ? "underline" : "none",
        transition: "color 200ms var(--ease-out)",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
      Limpar
    </button>
  );
}

function HeadCell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-manrope), sans-serif",
        fontWeight: 700,
        fontSize: 12,
        color: "#012418",
      }}
    >
      {children}
    </div>
  );
}

function SortHeader({
  children,
  onClick,
  arrow,
}: {
  children: React.ReactNode;
  onClick: () => void;
  arrow: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "var(--font-manrope), sans-serif",
        fontWeight: 700,
        fontSize: 12,
        color: "#012418",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 4,
        background: "transparent",
        border: "none",
        padding: 0,
        textAlign: "left",
      }}
    >
      {children} {arrow}
    </button>
  );
}

function PageArrow({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 36,
        height: 36,
        borderRadius: 6,
        border: `1px solid ${hover && !disabled ? "#00B20B" : "#E5E5E5"}`,
        background: disabled ? "#F8F8F8" : hover ? "#F8F8F8" : "transparent",
        color: disabled ? "#CCCCCC" : "#012418",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 200ms var(--ease-out)",
      }}
    >
      {children}
    </button>
  );
}

function PageNumber({ n, active, onClick }: { n: number; active: boolean; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileTap={{ scale: 0.92 }}
      animate={{ background: active ? "#00B20B" : hover ? "#F8F8F8" : "transparent" }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      aria-current={active ? "page" : undefined}
      style={{
        width: 36,
        height: 36,
        borderRadius: 6,
        border: "none",
        color: active ? "#FFFFFF" : "#012418",
        fontFamily: "var(--font-manrope), sans-serif",
        fontWeight: 600,
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      {n}
    </motion.button>
  );
}
