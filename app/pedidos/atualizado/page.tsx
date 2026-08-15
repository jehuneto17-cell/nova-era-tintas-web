"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Shell } from "@/components/Shell";
import { Icon } from "@/components/Icon";
import { Placeholder } from "@/components/Placeholder";
import { EASE_OUT } from "@/components/ui";
import { subscribePedido } from "@/lib/pedidos";
import { brl } from "@/lib/store";
import type { Pedido, PedidoEstado, PedidoItem } from "@/lib/types";

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

function formatDateTime(iso: string | undefined) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function chaveItem(it: PedidoItem) {
  return `${it.produtoId}|${it.variacao}`;
}

function ultimaEdicao(pedido: Pedido) {
  for (let i = pedido.historico.length - 1; i >= 0; i--) {
    if (pedido.historico[i].tipo === "edicao") return pedido.historico[i];
  }
  return null;
}

/** Screen 18 — Pedido Atualizado. */
export default function PedidoAtualizadoPage() {
  return (
    <Suspense fallback={<Shell>{null}</Shell>}>
      <Atualizado />
    </Suspense>
  );
}

function Atualizado() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  const [pedido, setPedido] = useState<Pedido | null | undefined>(undefined);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  if (id !== loadedId) {
    setLoadedId(id);
    setPedido(id ? undefined : null);
  }

  useEffect(() => {
    if (!id) return;
    return subscribePedido(id, setPedido);
  }, [id]);

  if (!id || pedido === null) {
    return (
      <Shell>
        <div style={{ padding: "120px 0", textAlign: "center", fontFamily: "var(--font-manrope), sans-serif", color: "#999999" }}>
          Pedido não encontrado.
        </div>
      </Shell>
    );
  }

  if (pedido === undefined) {
    return (
      <Shell>
        <div style={{ padding: "120px 0", textAlign: "center", fontFamily: "var(--font-manrope), sans-serif", color: "#999999" }}>
          Carregando pedido...
        </div>
      </Shell>
    );
  }

  const edicao = ultimaEdicao(pedido);

  if (!edicao || !edicao.itensAnteriores) {
    return (
      <Shell>
        <div style={{ padding: "120px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 18, color: "#012418" }}>
            Este pedido não tem revisões
          </span>
          <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#999999" }}>
            Nenhuma alteração foi feita pelo vendedor até agora.
          </span>
          <button
            type="button"
            onClick={() => router.push(`/pedidos/${pedido.id}`)}
            style={{
              marginTop: 8,
              height: 44,
              padding: "0 20px",
              background: "#00B20B",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 8,
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Ver detalhes do pedido
          </button>
        </div>
      </Shell>
    );
  }

  const itensAnteriores = edicao.itensAnteriores;
  const anterioresPorChave = new Map(itensAnteriores.map((it) => [chaveItem(it), it]));
  const atuaisPorChave = new Map(pedido.itens.map((it) => [chaveItem(it), it]));

  const linhasItens = pedido.itens.map((it) => {
    const anterior = anterioresPorChave.get(chaveItem(it));
    const mudou = !anterior || anterior.qtd !== it.qtd || anterior.preco !== it.preco;
    return { item: it, anterior: anterior ?? null, mudou };
  });
  const removidos = itensAnteriores.filter((it) => !atuaisPorChave.has(chaveItem(it)));

  const subtotalAnterior = itensAnteriores.reduce((s, it) => s + it.preco * it.qtd, 0);
  const subtotal = pedido.itens.reduce((s, i) => s + i.preco * i.qtd, 0);
  const totalAnterior = subtotalAnterior + (edicao.freteAnterior ?? pedido.frete);
  const total = subtotal + pedido.frete;
  const diff = total - totalAnterior;
  const ultima = pedido.historico[pedido.historico.length - 1];

  return (
    <Shell>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          style={{ width: "100%", maxWidth: 700 }}
        >
          {/* Success hero */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E5E5",
              borderRadius: 12,
              padding: "40px 24px",
              textAlign: "center",
              marginBottom: 32,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0, y: -8 }}
              animate={{ opacity: 1, scale: [0, 1.1, 1], y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT, times: [0, 0.7, 1] }}
              style={{
                width: 80,
                height: 80,
                background: "#E8F5E9",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <motion.svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#00B20B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.polyline
                  points="4 12 9 17 20 6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.25, ease: EASE_OUT }}
                />
              </motion.svg>
            </motion.div>
            <h1
              style={{
                margin: 0,
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 28,
                color: "#012418",
              }}
            >
              Pedido Atualizado
            </h1>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 14,
                color: "#999999",
                lineHeight: 1.6,
              }}
            >
              O status do seu pedido foi atualizado.
            </p>
            <span
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontWeight: 600,
                fontSize: 13,
                color: "#0088B7",
              }}
            >
              Pedido {pedido.numero}
            </span>
          </div>

          {/* Diff de itens */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E5E5",
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
            }}
          >
            <SectionHeading>Itens do Pedido (Atualizado)</SectionHeading>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {linhasItens.map(({ item, anterior, mudou }) => (
                <motion.div
                  key={chaveItem(item)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: EASE_OUT }}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    border: "1px solid #E5E5E5",
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <div style={{ width: 56, height: 56, flex: "none", borderRadius: 8, overflow: "hidden", background: "#F8F8F8" }}>
                    <Placeholder label={item.nome} fontSize={9} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 600, fontSize: 13, color: "#012418" }}>
                      {item.nome}
                    </span>
                    <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, color: "#999999" }}>
                      {item.variacao}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, color: "#012418" }}>
                        {item.qtd}x | {brl(item.preco)}
                      </span>
                      {mudou && (
                        <span
                          style={{
                            fontFamily: "var(--font-manrope), sans-serif",
                            fontWeight: 700,
                            fontSize: 10,
                            color: "#FFFFFF",
                            background: "#FFB703",
                            borderRadius: 4,
                            padding: "2px 6px",
                          }}
                        >
                          MUDOU
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      {mudou && anterior && (
                        <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, color: "#999999", textDecoration: "line-through" }}>
                          era {brl(anterior.preco * anterior.qtd)}
                        </span>
                      )}
                      {mudou && !anterior && (
                        <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, color: "#00B20B", fontWeight: 600 }}>
                          novo item
                        </span>
                      )}
                      <span style={{ marginLeft: "auto", fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 13, color: "#012418" }}>
                        {brl(item.preco * item.qtd)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {removidos.map((it) => (
                <div
                  key={chaveItem(it)}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    border: "1px solid #E5E5E5",
                    borderRadius: 8,
                    padding: 12,
                    opacity: 0.6,
                  }}
                >
                  <div style={{ width: 56, height: 56, flex: "none", borderRadius: 8, overflow: "hidden", background: "#F8F8F8" }}>
                    <Placeholder label={it.nome} fontSize={9} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 600, fontSize: 13, color: "#012418" }}>
                      {it.nome}
                    </span>
                    <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, color: "#999999" }}>
                      {it.variacao}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, color: "#012418", textDecoration: "line-through" }}>
                        {it.qtd}x | {brl(it.preco)}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-manrope), sans-serif",
                          fontWeight: 700,
                          fontSize: 10,
                          color: "#FFFFFF",
                          background: "#E63946",
                          borderRadius: 4,
                          padding: "2px 6px",
                        }}
                      >
                        REMOVIDO
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 20, paddingTop: 16, borderTop: "1px solid #E5E5E5" }}>
              <Line
                label="Subtotal"
                value={subtotalAnterior !== subtotal ? `era ${brl(subtotalAnterior)} · ${brl(subtotal)}` : brl(subtotal)}
                bold
                border
              />
              <Line label="Frete" value={pedido.frete > 0 ? brl(pedido.frete) : "Grátis"} color={pedido.frete > 0 ? undefined : "#00B20B"} bold />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 8,
                  padding: "12px 16px",
                  background: "#F3FBF4",
                  borderRadius: 8,
                }}
              >
                <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 16, color: "#012418" }}>Total</span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                  <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 16, color: diff < 0 ? "#00B20B" : diff > 0 ? "#E63946" : "#012418" }}>
                    {brl(total)}
                  </span>
                  {diff !== 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, color: "#999999", textDecoration: "line-through" }}>
                        era {brl(totalAnterior)}
                      </span>
                      <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 700, fontSize: 12, color: diff < 0 ? "#00D97E" : "#E63946" }}>
                        {diff < 0 ? "-" : "+"}
                        {brl(Math.abs(diff))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Histórico */}
          <div
            style={{
              background: "#F8F8F8",
              border: "1px solid #E5E5E5",
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
            }}
          >
            <SectionHeading>Histórico do Pedido</SectionHeading>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {pedido.historico.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 + i * 0.08, ease: EASE_OUT }}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: i === pedido.historico.length - 1 ? "none" : "1px solid #E5E5E5",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-manrope), sans-serif",
                      fontSize: 13,
                      color: "#012418",
                    }}
                  >
                    {h.tipo === "edicao" ? "Itens revisados" : ESTADO_LABEL[h.estado as PedidoEstado] ?? h.estado}
                    {h.observacao ? ` — ${h.observacao}` : ""}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-manrope), sans-serif",
                      fontWeight: 600,
                      fontSize: 12,
                      color: "#999999",
                      flex: "none",
                    }}
                  >
                    {formatDateTime(h.quando)}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E5E5",
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
            }}
          >
            <SectionHeading marginBottom={16}>Detalhes do Pedido</SectionHeading>
            <div className="confirm-grid">
              <DetailField label="Nº Pedido" value={pedido.numero} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <DetailCaption>Status</DetailCaption>
                <span
                  style={{
                    display: "inline-block",
                    width: "fit-content",
                    fontFamily: "var(--font-manrope), sans-serif",
                    fontWeight: 600,
                    fontSize: 11,
                    padding: "4px 10px",
                    borderRadius: 4,
                    background: "#E8F5E9",
                    color: "#00B20B",
                  }}
                >
                  {ESTADO_LABEL[pedido.estado]}
                </span>
              </div>
              <DetailField label="Última Atualização" value={formatDateTime(ultima?.quando)} />
              <DetailField label="Endereço Entrega" value={pedido.endereco || "-"} />
              <DetailField label="Total" value={brl(total)} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <motion.button
              onClick={() => router.push(`/pedidos/${pedido.id}`)}
              whileHover={{ y: -1, backgroundColor: "#009208", boxShadow: "0 2px 8px rgba(0,178,11,.2)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              style={{
                height: 48,
                background: "#00B20B",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 8,
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Icon name="arrowRight" size={18} color="#FFFFFF" />
              Ver Detalhes do Pedido
            </motion.button>
            <OutlineInfo onClick={() => router.push("/produtos")}>Continuar Comprando</OutlineInfo>
          </div>
        </motion.div>
      </div>
    </Shell>
  );
}

function SectionHeading({
  children,
  marginBottom = 20,
}: {
  children: React.ReactNode;
  marginBottom?: number;
}) {
  return (
    <div
      style={{
        fontFamily: "var(--font-archivo), sans-serif",
        fontWeight: 700,
        fontSize: 16,
        color: "#012418",
        marginBottom,
      }}
    >
      {children}
    </div>
  );
}

function Line({
  label,
  value,
  color = "#012418",
  bold,
  border,
}: {
  label: string;
  value: string;
  color?: string;
  bold?: boolean;
  border?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: border ? "1px solid #E5E5E5" : "none",
        fontFamily: "var(--font-manrope), sans-serif",
        fontSize: 13,
      }}
    >
      <span style={{ color: "#012418" }}>{label}</span>
      <span style={{ color, fontWeight: bold ? 600 : 400 }}>{value}</span>
    </div>
  );
}

function DetailCaption({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-manrope), sans-serif",
        fontWeight: 600,
        fontSize: 11,
        color: "#999999",
      }}
    >
      {children}
    </span>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <DetailCaption>{label}</DetailCaption>
      <span
        style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#012418" }}
      >
        {value}
      </span>
    </div>
  );
}

function OutlineInfo({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      style={{
        height: 48,
        background: hover ? "#F0F7FB" : "#FFFFFF",
        border: "2px solid #0088B7",
        color: "#0088B7",
        borderRadius: 8,
        fontFamily: "var(--font-archivo), sans-serif",
        fontWeight: 700,
        fontSize: 14,
        cursor: "pointer",
        transition: "background 200ms var(--ease-out)",
      }}
    >
      {children}
    </motion.button>
  );
}
