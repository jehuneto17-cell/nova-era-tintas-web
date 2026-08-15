"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Shell } from "@/components/Shell";
import { Icon } from "@/components/Icon";
import { EASE_OUT } from "@/components/ui";
import { subscribePedido } from "@/lib/pedidos";
import { brl } from "@/lib/store";
import type { Pedido } from "@/lib/types";

const PREFIXO_RECUSA = "Comprovante recusado:";

const DICAS = [
  "Tire uma foto ou screenshot clara da tela de confirmação",
  "Certifique-se que está bem iluminada e sem borrão",
  "Evite reflexos ou ângulos muito inclinados",
];

function motivoRecusa(pedido: Pedido): string {
  if (pedido.ultimaRecusa?.motivo) return pedido.ultimaRecusa.motivo;
  const ultima = pedido.historico[pedido.historico.length - 1];
  const obs = ultima?.observacao ?? "";
  if (obs.startsWith(PREFIXO_RECUSA)) {
    return obs.slice(PREFIXO_RECUSA.length).trim();
  }
  return "Não foi possível validar o comprovante enviado.";
}

function pedidoTotal(p: Pedido) {
  return p.itens.reduce((s, i) => s + i.preco * i.qtd, 0) + p.frete;
}

function formatDateTime(iso: string | undefined) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/** Screen 21 — Comprovante Recusado. */
export default function RecusadoPage() {
  return (
    <Suspense fallback={<Shell>{null}</Shell>}>
      <Recusado />
    </Suspense>
  );
}

function Recusado() {
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

  const total = pedidoTotal(pedido);
  const motivo = motivoRecusa(pedido);
  const comprovanteAnterior = pedido.ultimaRecusa?.comprovanteUrl ?? pedido.comprovanteUrl;

  return (
    <Shell>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          style={{ width: "100%", maxWidth: 700 }}
        >
          {/* Hero */}
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
            {/* The design's `wiggle` keyframe: pops in with a shake. */}
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: [0, 1.1, 1, 1], rotate: [0, -6, 4, 0] }}
              transition={{ duration: 0.5, ease: EASE_OUT, times: [0, 0.5, 0.7, 1] }}
              style={{
                width: 80,
                height: 80,
                background: "#FFEBEE",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                stroke="#E63946"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </motion.div>
            <h1
              style={{
                margin: 0,
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 28,
                color: "#E63946",
              }}
            >
              Comprovante Recusado
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
              Desculpe, não conseguimos validar seu comprovante. Veja o motivo abaixo e tente
              novamente.
            </p>
            <span
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 13,
                color: "#999999",
              }}
            >
              Pedido {pedido.numero}
            </span>
          </div>

          {/* Reason */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15, ease: EASE_OUT }}
            style={{
              background: "#FFEBEE",
              border: "1px solid #FFCDD2",
              borderLeft: "4px solid #E63946",
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
              display: "flex",
              gap: 16,
              alignItems: "flex-start",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E63946"
              strokeWidth="1.6"
              style={{ flex: "none" }}
            >
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="8" x2="12" y2="13" />
              <circle cx="12" cy="16.5" r="0.6" fill="#E63946" />
            </svg>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#E63946",
                  marginBottom: 12,
                }}
              >
                Motivo da Recusa
              </div>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontSize: 13,
                  color: "#012418",
                }}
              >
                {motivo}
              </p>
            </div>
          </motion.div>

          {/* How to fix */}
          <div
            style={{
              background: "#F8F8F8",
              border: "1px solid #E5E5E5",
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: "#012418",
                marginBottom: 16,
              }}
            >
              Como Resolver
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {DICAS.map((text, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: 0.22 + i * 0.07, ease: EASE_OUT }}
                  style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "#E8F5E9",
                      color: "#00B20B",
                      fontFamily: "var(--font-manrope), sans-serif",
                      fontWeight: 600,
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: "0 0 24px",
                    }}
                  >
                    {i + 1}
                  </div>
                  <span
                    style={{
                      flex: 1,
                      fontFamily: "var(--font-manrope), sans-serif",
                      fontSize: 12,
                      color: "#012418",
                    }}
                  >
                    {text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Comprovante anterior */}
          {comprovanteAnterior && (
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E5E5",
                borderRadius: 12,
                padding: 20,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#012418",
                  marginBottom: 16,
                }}
              >
                Comprovante Anterior
              </div>
              <div
                style={{
                  width: 200,
                  maxWidth: "100%",
                  height: 150,
                  margin: "0 auto",
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "1px solid #E5E5E5",
                  background: "#F8F8F8",
                  opacity: 0.6,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={comprovanteAnterior} alt="Comprovante recusado" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>
          )}

          {/* Facts */}
          <div
            className="confirm-grid"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E5E5",
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
              gap: 16,
            }}
          >
            <Fact label="Nº Pedido" value={pedido.numero} />
            <Fact label="Valor Total" value={brl(total)} color="#00B20B" />
            <Fact label="Última Atualização" value={formatDateTime(pedido.historico[pedido.historico.length - 1]?.quando)} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            <motion.button
              onClick={() => router.push(`/comprovante/enviar?id=${pedido.id}`)}
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
              <Icon name="refresh" size={18} color="#FFFFFF" />
              Reenviar Comprovante
            </motion.button>
            <OutlineInfo onClick={() => router.push(`/pedidos/${pedido.id}`)}>
              <Icon name="arrowLeft" size={18} color="#0088B7" />
              Ver Detalhes do Pedido
            </OutlineInfo>
          </div>

          {/* Support */}
          <div
            style={{
              background: "#F0F7FB",
              border: "1px solid #D4E8F4",
              borderLeft: "4px solid #0088B7",
              borderRadius: 12,
              padding: 20,
              display: "flex",
              gap: 16,
              alignItems: "flex-start",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0088B7"
              strokeWidth="1.6"
              style={{ flex: "none" }}
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.7-2.5 2-2.5 4" />
              <circle cx="12" cy="17" r="0.6" fill="#0088B7" />
            </svg>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#0088B7",
                  marginBottom: 8,
                }}
              >
                Continua com dúvida?
              </div>
              <p
                style={{
                  margin: "0 0 12px",
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontSize: 12,
                  color: "#012418",
                  lineHeight: 1.5,
                }}
              >
                Entre em contato com nosso suporte. Podemos ajudar a resolver o problema.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <SupportBtn bg="#25D366" hoverBg="#1BAE4D" color="#FFFFFF">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#FFFFFF">
                    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-1.3-.6-2.2-1.1-3.1-2.6-.2-.3 0-.5.1-.6.2-.2.4-.5.5-.7.1-.2.1-.4 0-.5-.1-.2-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.1 0 1.3 1 2.5 1.1 2.7.1.2 1.8 2.8 4.4 3.8 2.1.8 2.5.6 3 .6.4 0 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.1-.4-.2z" />
                  </svg>
                  Fale pelo WhatsApp
                </SupportBtn>
                <SupportBtn outline color="#012418">
                  <Icon name="mail" size={15} color="#012418" />
                  Enviar Email
                </SupportBtn>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Shell>
  );
}

function Fact({ label, value, color = "#012418" }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontFamily: "var(--font-manrope), sans-serif",
          fontWeight: 600,
          fontSize: 11,
          color: "#999999",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-manrope), sans-serif",
          fontWeight: 600,
          fontSize: 13,
          color,
        }}
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "background 200ms var(--ease-out)",
      }}
    >
      {children}
    </motion.button>
  );
}

function SupportBtn({
  children,
  bg,
  hoverBg,
  color,
  outline,
}: {
  children: React.ReactNode;
  bg?: string;
  hoverBg?: string;
  color: string;
  outline?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileTap={{ scale: 0.98 }}
      style={{
        height: 40,
        background: outline ? (hover ? "#F8F8F8" : "#FFFFFF") : hover ? hoverBg : bg,
        border: outline ? "1px solid #E5E5E5" : "none",
        color,
        borderRadius: 8,
        fontFamily: "var(--font-manrope), sans-serif",
        fontWeight: 600,
        fontSize: 12,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        boxShadow: hover && !outline ? "0 2px 6px rgba(37,211,102,.2)" : "none",
        transition: "all 200ms var(--ease-out)",
      }}
    >
      {children}
    </motion.button>
  );
}
