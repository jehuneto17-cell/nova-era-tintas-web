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

const STEPS = [
  "Nossa equipe está validando seu comprovante",
  "Você receberá uma atualização quando confirmado",
  "Se aprovado, seu pedido seguirá para separação",
  "Em caso de rejeição, você pode enviar novamente",
];

function pedidoTotal(p: Pedido) {
  return p.itens.reduce((s, i) => s + i.preco * i.qtd, 0) + p.frete;
}

function formatDateTime(iso: string | undefined) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/** Screen 20 — Aguardando Confirmação. */
export default function AguardandoPage() {
  return (
    <Suspense fallback={<Shell>{null}</Shell>}>
      <Aguardando />
    </Suspense>
  );
}

function Aguardando() {
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
  const isConfirmed = pedido.estado !== "aguardando_confirmacao";
  const stages = [
    { title: "Comprovante enviado", time: formatDateTime(pedido.comprovanteEnviadoEm), state: "done" as const },
    {
      title: isConfirmed ? "Comprovante validado" : "Validando comprovante...",
      time: isConfirmed ? formatDateTime(pedido.historico[pedido.historico.length - 1]?.quando) : "Em andamento...",
      state: isConfirmed ? ("done" as const) : ("current" as const),
    },
    { title: "Pagamento confirmado", time: isConfirmed ? "" : "-", state: isConfirmed ? ("done" as const) : ("future" as const) },
  ];

  return (
    <Shell>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
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
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 80,
                height: 80,
                background: "#FFF8E5",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <motion.svg
                animate={{ rotate: [0, 180, 180, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFB703"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9" />
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
              Comprovante em Validação
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
              Enviamos seu comprovante para validação. Você será avisado assim que for confirmado.
            </p>
            <motion.span
              animate={{ opacity: [1, 0.55, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontWeight: 600,
                fontSize: 13,
                color: "#FFB703",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ⏱ Aguardando confirmação da loja...
            </motion.span>
          </div>

          {/* Timeline */}
          <div
            style={{
              background: "#F8F8F8",
              border: "1px solid #E5E5E5",
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
              {stages.map((st, i) => {
                const done = st.state === "done";
                const current = st.state === "current";
                return (
                  <motion.div
                    key={st.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1, ease: EASE_OUT }}
                    style={{ display: "flex", gap: 12, alignItems: "flex-start", position: "relative" }}
                  >
                    {i > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          left: 17,
                          top: -16,
                          width: 2,
                          height: 16,
                          background: i <= 1 ? "#2E9222" : "#E5E5E5",
                        }}
                      />
                    )}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        flex: "0 0 36px",
                        background: done ? "#2E9222" : "transparent",
                        border: done ? "none" : current ? "2px solid #FFB703" : "2px solid #E5E5E5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxSizing: "border-box",
                      }}
                    >
                      {done && (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="4 12 9 17 20 6" />
                        </svg>
                      )}
                      {current && (
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                          style={{
                            width: 20,
                            height: 20,
                            border: "2px solid rgba(255,183,3,.3)",
                            borderTopColor: "#FFB703",
                            borderRadius: "50%",
                            display: "block",
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        flex: 1,
                        paddingTop: 6,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-manrope), sans-serif",
                          fontWeight: 600,
                          fontSize: 13,
                          color: done ? "#012418" : current ? "#FFB703" : "#999999",
                        }}
                      >
                        {st.title}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-manrope), sans-serif",
                          fontSize: 11,
                          color: "#999999",
                        }}
                      >
                        {st.time}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

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
            <Fact label="Valor" value={brl(total)} color="#2E9222" />
            <Fact label="Comprovante" value={`Enviado em ${formatDateTime(pedido.comprovanteEnviadoEm)}`} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <FactCaption>Status</FactCaption>
              <span
                style={{
                  display: "inline-block",
                  width: "fit-content",
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontWeight: 600,
                  fontSize: 11,
                  padding: "4px 10px",
                  borderRadius: 4,
                  background: "#FFF8E5",
                  color: "#FFB703",
                }}
              >
                Aguardando Confirmação
              </span>
            </div>
          </div>

          {/* Next steps */}
          <div
            style={{
              background: "#F0F7FB",
              border: "1px solid #D4E8F4",
              borderLeft: "4px solid #0088B7",
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
              stroke="#0088B7"
              strokeWidth="1.6"
              style={{ flex: "none" }}
            >
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="11" x2="12" y2="16" />
              <circle cx="12" cy="8" r="0.6" fill="#0088B7" />
            </svg>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#0088B7",
                  marginBottom: 12,
                }}
              >
                O que acontece agora?
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {STEPS.map((text, i) => (
                  <motion.div
                    key={text}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: 0.2 + i * 0.06, ease: EASE_OUT }}
                    style={{ display: "flex", gap: 8 }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        color: "#0088B7",
                        fontFamily: "var(--font-manrope), sans-serif",
                        fontSize: 12,
                      }}
                    >
                      {i + 1}.
                    </span>
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
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <motion.button
              onClick={() => router.push(`/pedidos/${pedido.id}`)}
              whileHover={{ y: -1, backgroundColor: "#24741B", boxShadow: "0 2px 8px rgba(46,146,34,.2)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              style={{
                height: 48,
                background: "#2E9222",
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
            <SupportButton />
          </div>
        </motion.div>
      </div>
    </Shell>
  );
}

function FactCaption({ children }: { children: React.ReactNode }) {
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

function Fact({ label, value, color = "#012418" }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <FactCaption>{label}</FactCaption>
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

function SupportButton() {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0088B7" strokeWidth="1.8">
        <path d="M21 11.5a8.4 8.4 0 0 1-8.4 8.4 8.5 8.5 0 0 1-3.9-.9L3 20l1-5.7a8.4 8.4 0 1 1 17-2.8z" />
      </svg>
      Fale com Suporte
    </motion.button>
  );
}
