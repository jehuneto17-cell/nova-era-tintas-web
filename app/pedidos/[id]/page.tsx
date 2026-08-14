"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shell } from "@/components/Shell";
import { Modal } from "@/components/Modal";
import { Placeholder } from "@/components/Placeholder";
import { Icon } from "@/components/Icon";
import { EASE_OUT } from "@/components/ui";
import { subscribePedido } from "@/lib/pedidos";
import { useWhatsapp } from "@/lib/hooks";
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

const STAGE_LABELS = ["Confirmado", "Pagamento Confirmado", "Separação", "Enviado", "Entregue"];
const STATUS_TO_STAGE: Record<PedidoEstado, number> = {
  em_negociacao: 0,
  aguardando_pagamento: 1,
  aguardando_confirmacao: 1,
  pago: 1,
  separacao: 2,
  enviado: 3,
  entregue: 4,
  cancelado: 0,
  expirado: 0,
};

function formatDateTime(iso: string | undefined) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR") + ", " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Screens 16, 17 & 18 — Detalhes do Pedido.
 * The same layout renders every stage of the order lifecycle; the estado
 * drives the timeline, the action buttons and the negotiation banner.
 */
export default function PedidoDetalhePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const whatsapp = useWhatsapp();
  const [pedido, setPedido] = useState<Pedido | null | undefined>(undefined);
  const [loadedId, setLoadedId] = useState<string | null>(null);

  const [showCancel, setShowCancel] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (params.id !== loadedId) {
    setLoadedId(params.id);
    setPedido(undefined);
  }

  useEffect(() => {
    return subscribePedido(params.id, setPedido);
  }, [params.id]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function showToast(text: string) {
    setToast(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3000);
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

  if (pedido === null) {
    return (
      <Shell>
        <div style={{ padding: "120px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 22, color: "#012418" }}>
            Pedido não encontrado
          </h2>
          <BackLink onClick={() => router.push("/pedidos")} label="Voltar para Meus Pedidos" />
        </div>
      </Shell>
    );
  }

  const estado = pedido.estado;
  const currentStage = STATUS_TO_STAGE[estado];
  const allDone = estado === "entregue";
  const style = ESTADO_STYLE[estado];

  const subtotal = pedido.itens.reduce((s, i) => s + i.preco * i.qtd, 0);
  const total = subtotal + pedido.frete;

  const showPagar = estado === "em_negociacao" || estado === "aguardando_pagamento";
  const showRastrear = estado === "pago" || estado === "separacao" || estado === "enviado";
  const showAvaliar = estado === "entregue";

  const waHref = whatsapp?.numero
    ? `https://wa.me/${whatsapp.numero.replace(/\D/g, "")}?text=${encodeURIComponent(
        whatsapp.mensagem || `Olá, gostaria de falar sobre o pedido ${pedido.numero}`,
      )}`
    : undefined;

  return (
    <Shell>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 1000 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
            <BackLink onClick={() => router.push("/pedidos")} />
            <nav style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#999999" }}>
              <Link href="/pedidos">Meus Pedidos</Link>
              {" > "}
              <span style={{ color: "#012418" }}>Detalhes</span>
              {" > "}
              <span style={{ color: "#012418" }}>{pedido.numero}</span>
            </nav>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 12,
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
              Pedido {pedido.numero}
            </h1>
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
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
              {ESTADO_LABEL[estado]}
            </motion.span>
          </div>

          <AnimatePresence>
            {estado === "em_negociacao" && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  background: "#FFF8E5",
                  border: "1px solid #FFB703",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 24,
                }}
              >
                <motion.span
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ display: "grid", placeItems: "center", flex: "none" }}
                >
                  <Icon name="chat" size={22} color="#FFB703" />
                </motion.span>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-archivo), sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#FFB703",
                      marginBottom: 4,
                    }}
                  >
                    Pedido em negociação
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-manrope), sans-serif",
                      fontSize: 13,
                      color: "#012418",
                      lineHeight: 1.5,
                    }}
                  >
                    Nossa equipe está revisando valores e prazos. Assim que houver uma proposta, você
                    será avisado por email e WhatsApp.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {estado === "enviado" && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  background: "#F0F7FB",
                  border: "1px solid #0088B7",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 24,
                }}
              >
                <Icon name="truck" size={22} color="#0088B7" style={{ flex: "none" }} />
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-archivo), sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#0088B7",
                      marginBottom: 4,
                    }}
                  >
                    Pedido atualizado — a caminho!
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-manrope), sans-serif",
                      fontSize: 13,
                      color: "#012418",
                      lineHeight: 1.5,
                    }}
                  >
                    Seu pedido saiu para entrega.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timeline */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E5E5",
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
              overflowX: "auto",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: "#012418",
                marginBottom: 20,
              }}
            >
              Status do Pedido
            </div>
            <div style={{ display: "flex", position: "relative", minWidth: 560 }}>
              {STAGE_LABELS.map((label, i) => {
                const done = allDone || i < currentStage;
                const isCurrent = !allDone && i === currentStage;
                const circleBg = done ? "#00B20B" : isCurrent ? "#FFB703" : "#E5E5E5";
                const lineDone = allDone || i - 1 < currentStage;

                return (
                  <div
                    key={label}
                    style={{
                      position: "relative",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    {i > 0 && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.4, delay: i * 0.1, ease: EASE_OUT }}
                        style={{
                          position: "absolute",
                          top: 19,
                          left: "-50%",
                          width: "100%",
                          height: 2,
                          background: lineDone ? "#00B20B" : "#E5E5E5",
                          zIndex: 0,
                          transformOrigin: "left",
                        }}
                      />
                    )}
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.1, ease: EASE_OUT }}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: circleBg,
                        border: `2px solid ${circleBg}`,
                        display: "grid",
                        placeItems: "center",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      {done && (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="4 12 9 17 20 6" />
                        </svg>
                      )}
                      {isCurrent && (
                        <motion.div
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                          style={{ width: 12, height: 12, borderRadius: "50%", background: "#FFFFFF" }}
                        />
                      )}
                    </motion.div>
                    <span
                      style={{
                        marginTop: 12,
                        textAlign: "center",
                        fontFamily: "var(--font-manrope), sans-serif",
                        fontSize: 12,
                        color: done || isCurrent ? "#012418" : "#999999",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="detail-split">
            <div>
              {/* Items */}
              <Panel title="Itens do Pedido">
                {pedido.itens.map((it, i) => (
                  <div
                    key={`${it.produtoId}::${it.variacao}::${i}`}
                    style={{
                      display: "flex",
                      gap: 16,
                      alignItems: "flex-start",
                      padding: "16px 0",
                      borderBottom: `1px solid ${i === pedido.itens.length - 1 ? "transparent" : "#E5E5E5"}`,
                    }}
                  >
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        flex: "none",
                        borderRadius: 8,
                        overflow: "hidden",
                        background: "#F8F8F8",
                      }}
                    >
                      <Placeholder label={it.nome} fontSize={9} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          fontFamily: "var(--font-manrope), sans-serif",
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#012418",
                        }}
                      >
                        {it.nome}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-manrope), sans-serif",
                          fontSize: 12,
                          color: "#999999",
                        }}
                      >
                        {it.variacao}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-manrope), sans-serif",
                          fontSize: 12,
                          color: "#012418",
                        }}
                      >
                        Qtd: {it.qtd}x
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        alignItems: "flex-end",
                        textAlign: "right",
                        flex: "none",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-manrope), sans-serif",
                          fontSize: 12,
                          color: "#999999",
                        }}
                      >
                        {brl(it.preco)}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-manrope), sans-serif",
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#00B20B",
                        }}
                      >
                        {brl(it.preco * it.qtd)}
                      </span>
                    </div>
                  </div>
                ))}
              </Panel>

              {/* Address */}
              <Panel title="Endereço de Entrega">
                <div
                  style={{
                    fontFamily: "var(--font-manrope), sans-serif",
                    fontSize: 13,
                    color: "#012418",
                    lineHeight: 1.6,
                  }}
                >
                  {pedido.endereco || "Endereço não informado"}
                </div>
                {pedido.enderecoMudou && (
                  <div
                    style={{
                      marginTop: 8,
                      fontFamily: "var(--font-manrope), sans-serif",
                      fontSize: 11,
                      color: "#FFB703",
                    }}
                  >
                    Este endereço foi alterado após a criação do pedido.
                  </div>
                )}
              </Panel>

              {/* Histórico */}
              {pedido.historico.length > 0 && (
                <Panel title="Histórico">
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {pedido.historico.map((h, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          padding: "10px 0",
                          borderBottom: i === pedido.historico.length - 1 ? "none" : "1px solid #E5E5E5",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontFamily: "var(--font-manrope), sans-serif",
                              fontWeight: 600,
                              fontSize: 13,
                              color: "#012418",
                            }}
                          >
                            {ESTADO_LABEL[h.estado as PedidoEstado] ?? h.estado}
                          </div>
                          {h.observacao && (
                            <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, color: "#999999" }}>
                              {h.observacao}
                            </div>
                          )}
                        </div>
                        <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, color: "#999999", flex: "none" }}>
                          {formatDateTime(h.quando)}
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}
            </div>

            <aside>
              <div
                className="unstick-mobile"
                style={{ position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div
                  style={{
                    background: "#F8F8F8",
                    border: "1px solid #E5E5E5",
                    borderRadius: 12,
                    padding: 20,
                  }}
                >
                  <SummaryLine label="Subtotal" value={brl(subtotal)} border />
                  <SummaryLine label="Frete" value={pedido.frete > 0 ? brl(pedido.frete) : "Grátis"} valueColor={pedido.frete > 0 ? "#012418" : "#00B20B"} />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 12,
                      padding: 12,
                      background: "#F3FBF4",
                      borderRadius: 8,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-archivo), sans-serif",
                        fontWeight: 700,
                        fontSize: 16,
                        color: "#00B20B",
                      }}
                    >
                      Total
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-archivo), sans-serif",
                        fontWeight: 700,
                        fontSize: 16,
                        color: "#00B20B",
                      }}
                    >
                      {brl(total)}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E5E5E5",
                    borderRadius: 12,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {showPagar && (
                    <>
                      <ActionBtn bg="#00B20B" hoverBg="#009208" onClick={() => router.push(`/pagamento?id=${pedido.id}`)}>
                        Pagar Agora
                      </ActionBtn>
                      <ActionBtn outline color="#E63946" hoverBg="#FFEBEE" onClick={() => setShowCancel(true)}>
                        Cancelar Pedido
                      </ActionBtn>
                    </>
                  )}
                  {showRastrear && (
                    <ActionBtn outline color="#0088B7" hoverBg="#F0F7FB" onClick={() => {}}>
                      Fale com Suporte
                    </ActionBtn>
                  )}
                  {showAvaliar && (
                    <>
                      <ActionBtn bg="#FFB703" hoverBg="#E6A503" onClick={() => router.push("/avaliar")}>
                        Avaliar Compra
                      </ActionBtn>
                    </>
                  )}
                </div>

                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E5E5E5",
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-archivo), sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#012418",
                      marginBottom: 12,
                    }}
                  >
                    Precisa de Ajuda?
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {waHref ? (
                      <a href={waHref} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
                        <ActionBtn bg="#25D366" hoverBg="#1BAE4D" onClick={() => {}} height={44}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF">
                            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-1.3-.6-2.2-1.1-3.1-2.6-.2-.3 0-.5.1-.6.2-.2.4-.5.5-.7.1-.2.1-.4 0-.5-.1-.2-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.1 0 1.3 1 2.5 1.1 2.7.1.2 1.8 2.8 4.4 3.8 2.1.8 2.5.6 3 .6.4 0 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.1-.4-.2z" />
                          </svg>
                          Enviar WhatsApp
                        </ActionBtn>
                      </a>
                    ) : null}
                    <ActionBtn outline color="#012418" hoverBg="#F8F8F8" onClick={() => {}} height={44}>
                      <Icon name="mail" size={16} color="#012418" />
                      Enviar Email
                    </ActionBtn>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCancel && (
          <Modal onClose={() => setShowCancel(false)} label="Cancelar pedido">
            <p
              style={{
                margin: "0 0 24px",
                fontFamily: "var(--font-manrope), sans-serif",
                fontWeight: 600,
                fontSize: 15,
                color: "#012418",
                textAlign: "center",
              }}
            >
              Deseja cancelar este pedido?
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <ModalBtn variant="ghost" onClick={() => setShowCancel(false)}>
                Não, manter
              </ModalBtn>
              <ModalBtn
                variant="danger"
                onClick={() => {
                  setShowCancel(false);
                  showToast("Solicitação de cancelamento enviada.");
                }}
              >
                Sim, cancelar
              </ModalBtn>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            role="status"
            style={{
              position: "fixed",
              top: 20,
              right: 20,
              background: "#012418",
              color: "#FFFFFF",
              padding: "14px 20px",
              borderRadius: 8,
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 600,
              fontSize: 13,
              boxShadow: "0 4px 16px rgba(0,0,0,.2)",
              zIndex: 300,
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E5E5",
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: action ? 16 : 20,
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-archivo), sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: "#012418",
          }}
        >
          {title}
        </span>
        {action}
      </div>
      {children}
    </motion.div>
  );
}

function SummaryLine({
  label,
  value,
  valueColor = "#012418",
  border,
}: {
  label: string;
  value: string;
  valueColor?: string;
  border?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: border ? "1px solid #E5E5E5" : "none",
        fontFamily: "var(--font-manrope), sans-serif",
        fontSize: 13,
      }}
    >
      <span style={{ color: "#012418" }}>{label}</span>
      <span style={{ color: valueColor }}>{value}</span>
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  bg,
  hoverBg,
  outline,
  color,
  height = 44,
}: {
  children: React.ReactNode;
  onClick: () => void;
  bg?: string;
  hoverBg: string;
  outline?: boolean;
  color?: string;
  height?: number;
}) {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      style={{
        height,
        background: outline ? (hover ? hoverBg : "#FFFFFF") : hover ? hoverBg : bg,
        border: outline ? `2px solid ${color}` : "none",
        color: outline ? color : "#FFFFFF",
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
        width: "100%",
      }}
    >
      {children}
    </motion.button>
  );
}

function BackLink({ onClick, label = "Voltar" }: { onClick: () => void; label?: string }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={label}
      title={label}
      style={{
        color: hover ? "#00B20B" : "#012418",
        display: "flex",
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        transition: "color 200ms var(--ease-out)",
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
    </button>
  );
}

function ModalBtn({
  children,
  onClick,
  variant,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant: "ghost" | "danger";
}) {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileTap={{ scale: 0.97 }}
      style={{
        flex: 1,
        height: 44,
        background: variant === "danger" ? (hover ? "#CC2E36" : "#E63946") : "#FFFFFF",
        border: variant === "danger" ? "none" : `2px solid ${hover ? "#00B20B" : "#E5E5E5"}`,
        color: variant === "danger" ? "#FFFFFF" : "#012418",
        borderRadius: 8,
        fontFamily: "var(--font-archivo), sans-serif",
        fontWeight: 700,
        fontSize: 14,
        cursor: "pointer",
        transition: "all 200ms var(--ease-out)",
      }}
    >
      {children}
    </motion.button>
  );
}
