"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Shell } from "@/components/Shell";
import { Modal } from "@/components/Modal";
import { Placeholder } from "@/components/Placeholder";
import { Icon } from "@/components/Icon";
import { EASE_OUT } from "@/components/ui";
import { subscribePedido, cancelarPedido } from "@/lib/pedidos";
import { useWhatsapp } from "@/lib/hooks";
import { useAuth } from "@/lib/auth";
import { brl } from "@/lib/store";
import type { Pedido } from "@/lib/types";

/** Screen 17 — Pedido em Negociação. */
export default function NegociacaoPage() {
  return (
    <Suspense fallback={<Shell>{null}</Shell>}>
      <Negociacao />
    </Suspense>
  );
}

function Negociacao() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  const whatsapp = useWhatsapp();
  const { cliente } = useAuth();

  const [pedido, setPedido] = useState<Pedido | null | undefined>(undefined);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (id !== loadedId) {
    setLoadedId(id);
    setPedido(id ? undefined : null);
  }

  useEffect(() => {
    if (!id) return;
    return subscribePedido(id, setPedido);
  }, [id]);

  useEffect(() => {
    if (pedido && pedido.estado !== "em_negociacao") {
      router.replace(`/pedidos/${pedido.id}`);
    }
  }, [pedido, router]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function showToast(text: string) {
    setToast(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3000);
  }

  const waHref = whatsapp?.numero
    ? `https://wa.me/${whatsapp.numero.replace(/\D/g, "")}?text=${encodeURIComponent(whatsapp.mensagem || "")}`
    : undefined;

  if (!id || pedido === null) {
    return (
      <Shell>
        <div style={{ padding: "120px 0", textAlign: "center", fontFamily: "var(--font-manrope), sans-serif", color: "#999999" }}>
          Pedido não encontrado.
        </div>
      </Shell>
    );
  }

  if (pedido === undefined || pedido.estado !== "em_negociacao") {
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

  return (
    <Shell>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 800 }}>
          {/* Negotiation banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            style={{
              background: "#FFF8E5",
              border: "1px solid #FFE5A0",
              borderLeft: "4px solid #FFB703",
              borderRadius: 12,
              padding: 20,
              marginBottom: 32,
              display: "flex",
              gap: 16,
              alignItems: "flex-start",
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              style={{ flex: "none", display: "grid" }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFB703" strokeWidth="1.6">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3.5 2" />
              </svg>
            </motion.span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#FFB703",
                }}
              >
                Pedido em Negociação
              </div>
              <p
                style={{
                  margin: "8px 0 0",
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontSize: 14,
                  color: "#012418",
                }}
              >
                Este pedido está aguardando confirmação. Nossa equipe entrará em contato em breve.
              </p>
            </div>
          </motion.div>

          {/* Order card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08, ease: EASE_OUT }}
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
                marginBottom: 20,
                borderBottom: "1px solid #E5E5E5",
                paddingBottom: 16,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span
                  style={{
                    fontFamily: "var(--font-archivo), sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                    color: "#012418",
                  }}
                >
                  Pedido {pedido.numero}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-manrope), sans-serif",
                    fontSize: 12,
                    color: "#FFB703",
                  }}
                >
                  Em Negociação
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                marginBottom: 20,
                paddingBottom: 20,
                borderBottom: "1px solid #E5E5E5",
              }}
            >
              {pedido.itens.map((it, i) => (
                <motion.div
                  key={`${it.produtoId}::${it.variacao}::${i}`}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: EASE_OUT }}
                  style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      flex: "none",
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "#F8F8F8",
                    }}
                  >
                    <Placeholder label={it.nome} fontSize={9} />
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-manrope), sans-serif",
                        fontWeight: 600,
                        fontSize: 13,
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
                      Qtd: {it.qtd}x | {brl(it.preco * it.qtd)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", marginBottom: 20 }}>
              <Line label="Subtotal" value={brl(subtotal)} bold border />
              <Line label="Frete" value={pedido.frete > 0 ? brl(pedido.frete) : "Grátis"} color={pedido.frete > 0 ? undefined : "#2E9222"} bold />
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
                <span
                  style={{
                    fontFamily: "var(--font-archivo), sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#2E9222",
                  }}
                >
                  Total
                </span>
                <motion.span
                  key={total}
                  initial={{ scale: 0.94 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                  style={{
                    fontFamily: "var(--font-archivo), sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#2E9222",
                  }}
                >
                  {brl(total)}
                </motion.span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <OutlineDanger onClick={() => setShowCancel(true)}>
                <Icon name="x" size={18} color="#E63946" />
                Cancelar Pedido
              </OutlineDanger>
            </div>
          </motion.div>

          {/* Address */}
          <div
            style={{
              background: "#F8F8F8",
              border: "1px solid #E5E5E5",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: "#012418",
                marginBottom: 12,
              }}
            >
              Endereço de Entrega
            </div>
            <div
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 12,
                color: "#012418",
              }}
            >
              {pedido.endereco || "Endereço não informado"}
            </div>
          </div>

          {/* Help */}
          <div
            style={{ background: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: 12, padding: 16 }}
          >
            <div
              style={{
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: "#012418",
                marginBottom: 12,
              }}
            >
              Precisa de Ajuda?
            </div>
            <p
              style={{
                margin: "0 0 12px",
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 12,
                color: "#999999",
              }}
            >
              Se tiver dúvidas sobre seu pedido, entre em contato conosco por WhatsApp ou email.
            </p>
            {waHref && (
              <a href={waHref} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
                <HelpButton bg="#25D366" hoverBg="#1BAE4D" color="#FFFFFF">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#FFFFFF">
                    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-1.3-.6-2.2-1.1-3.1-2.6-.2-.3 0-.5.1-.6.2-.2.4-.5.5-.7.1-.2.1-.4 0-.5-.1-.2-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.1 0 1.3 1 2.5 1.1 2.7.1.2 1.8 2.8 4.4 3.8 2.1.8 2.5.6 3 .6.4 0 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.1-.4-.2z" />
                  </svg>
                  Enviar WhatsApp
                </HelpButton>
              </a>
            )}
            <div style={{ marginTop: 8 }}>
              <HelpButton outline color="#012418">
                <Icon name="mail" size={15} color="#012418" />
                Enviar Email
              </HelpButton>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel modal */}
      <AnimatePresence>
        {showCancel && (
          <Modal onClose={() => setShowCancel(false)} label="Cancelar pedido">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E63946"
              strokeWidth="1.6"
              style={{ margin: "0 auto 16px", display: "block" }}
            >
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="8" x2="12" y2="13" />
              <circle cx="12" cy="16.5" r="0.6" fill="#E63946" />
            </svg>
            <p
              style={{
                margin: "0 0 8px",
                fontFamily: "var(--font-manrope), sans-serif",
                fontWeight: 600,
                fontSize: 15,
                color: "#012418",
                textAlign: "center",
              }}
            >
              Deseja realmente cancelar este pedido?
            </p>
            <p
              style={{
                margin: "0 0 24px",
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 12,
                color: "#999999",
                textAlign: "center",
              }}
            >
              Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <DialogBtn variant="ghost" onClick={() => setShowCancel(false)}>
                Não, manter
              </DialogBtn>
              <DialogBtn
                variant="danger"
                disabled={cancelando}
                onClick={async () => {
                  setCancelando(true);
                  try {
                    await cancelarPedido(pedido.id, cliente?.nome ?? "Cliente");
                    setShowCancel(false);
                    showToast("Pedido cancelado.");
                    router.push("/pedidos");
                  } catch {
                    setCancelando(false);
                    showToast("Não deu para cancelar. Tente de novo.");
                  }
                }}
              >
                {cancelando ? "Cancelando..." : "Sim, cancelar"}
              </DialogBtn>
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

function OutlineDanger({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
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
        background: hover ? "#FFEBEE" : "#FFFFFF",
        border: "2px solid #E63946",
        color: "#E63946",
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

function HelpButton({
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
        width: "100%",
        height: 40,
        background: outline ? (hover ? "#F8F8F8" : "#FFFFFF") : hover ? hoverBg : bg,
        border: outline ? `1px solid ${hover ? "#999999" : "#E5E5E5"}` : "none",
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
        boxSizing: "border-box",
        transition: "all 200ms var(--ease-out)",
      }}
    >
      {children}
    </motion.button>
  );
}

function DialogBtn({
  children,
  onClick,
  variant,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant: "ghost" | "danger";
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const styles = {
    ghost: {
      background: "#FFFFFF",
      border: `2px solid ${hover ? "#2E9222" : "#E5E5E5"}`,
      color: "#012418",
    },
    danger: { background: hover ? "#CC2E36" : "#E63946", border: "none", color: "#FFFFFF" },
  }[variant];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileTap={{ scale: 0.97 }}
      style={{
        flex: 1,
        height: 44,
        borderRadius: 8,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "var(--font-archivo), sans-serif",
        fontWeight: 700,
        fontSize: 14,
        transition: "all 200ms var(--ease-out)",
        ...styles,
      }}
    >
      {children}
    </motion.button>
  );
}
