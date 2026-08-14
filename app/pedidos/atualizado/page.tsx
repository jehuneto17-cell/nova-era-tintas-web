"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Shell } from "@/components/Shell";
import { Icon } from "@/components/Icon";
import { EASE_OUT } from "@/components/ui";
import { subscribePedido } from "@/lib/pedidos";
import { brl } from "@/lib/store";
import type { Pedido, PedidoEstado } from "@/lib/types";

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

  const subtotal = pedido.itens.reduce((s, i) => s + i.preco * i.qtd, 0);
  const total = subtotal + pedido.frete;
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

          {/* Changes / histórico */}
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
                    {ESTADO_LABEL[h.estado as PedidoEstado] ?? h.estado}
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
