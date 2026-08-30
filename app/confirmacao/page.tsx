"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shell } from "@/components/Shell";
import { Placeholder } from "@/components/Placeholder";
import { Icon, type IconName } from "@/components/Icon";
import { EASE_OUT, PrimaryButton, SecondaryButton } from "@/components/ui";
import { brl, useStore, type CartLine } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { criarPedido } from "@/lib/pedidos";
import type { PedidoItem } from "@/lib/types";

const STAGES: { title: string; desc: string; state: "done" | "current" | "pending"; ic: IconName }[] = [
  { title: "Pedido Recebido", desc: "Agora", state: "done", ic: "check" },
  { title: "Aguardando Pagamento", desc: "Pague via PIX para avançar", state: "current", ic: "package" },
  { title: "Enviado", desc: "Você receberá um link de rastreamento", state: "pending", ic: "arrowRight" },
  { title: "Entregue", desc: "Seu pedido chegará na sua casa", state: "pending", ic: "home" },
];

const PERKS: { icon: IconName; title: string; desc: string }[] = [
  { icon: "eye", title: "Acompanhe Online", desc: "Veja o status do seu pedido em tempo real" },
  { icon: "mail", title: "Receba Notificações", desc: "Você será avisado de cada atualização" },
  { icon: "phone", title: "Entre em Contato", desc: "Tem dúvidas? Estamos aqui para ajudar" },
];

type CheckoutData = { endereco: string; frete: number; enderecoMudou: boolean };

function gerarNumero() {
  return `#PED${Math.floor(100000 + Math.random() * 900000)}`;
}

/**
 * Screen 6 — Confirmação do Pedido.
 * criarPedido() is called exactly once here, on mount, using the cart and
 * the address/frete chosen at checkout (passed via sessionStorage).
 */
export default function ConfirmacaoPage() {
  const router = useRouter();
  const { items, subtotal, resetCart } = useStore();
  const { user, cliente, loading: authLoading } = useAuth();
  const [toast, setToast] = useState(false);
  const [status, setStatus] = useState<"creating" | "done" | "error">("creating");
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [numero, setNumero] = useState<string>("");
  const [frete, setFrete] = useState(0);
  const [confirmedItems, setConfirmedItems] = useState<CartLine[]>([]);
  const [confirmedSubtotal, setConfirmedSubtotal] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const started = useRef(false);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (started.current) return;
    if (authLoading) return;
    started.current = true;

    if (!user || !cliente) {
      router.replace("/login");
      return;
    }
    if (items.length === 0) {
      router.replace("/carrinho");
      return;
    }

    let checkoutData: CheckoutData | null = null;
    try {
      const raw = sessionStorage.getItem("net_checkout");
      if (raw) checkoutData = JSON.parse(raw);
    } catch {
      // sessionStorage indisponível
    }

    const itensPedido: PedidoItem[] = items.map((i) => ({
      produtoId: i.produtoId,
      nome: i.title,
      variacao: i.variacao,
      qtd: i.qty,
      preco: i.price,
    }));
    const numeroPedido = gerarNumero();
    const freteValor = checkoutData?.frete ?? 0;

    criarPedido({
      numero: numeroPedido,
      clienteId: cliente.id,
      cliente: cliente.nome,
      telefone: cliente.telefone,
      itens: itensPedido,
      frete: freteValor,
      endereco: checkoutData?.endereco ?? "",
      enderecoMudou: checkoutData?.enderecoMudou ?? false,
    })
      .then((id) => {
        setPedidoId(id);
        setNumero(numeroPedido);
        setFrete(freteValor);
        setConfirmedItems(items);
        setConfirmedSubtotal(subtotal);
        setStatus("done");
        resetCart();
        try {
          sessionStorage.removeItem("net_checkout");
        } catch {
          // ignore
        }
      })
      .catch(() => setStatus("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  function copyOrder() {
    if (!numero) return;
    navigator.clipboard?.writeText(numero).catch(() => {});
    setToast(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(false), 2000);
  }

  if (status === "creating") {
    return (
      <Shell>
        <div style={{ padding: "120px 0", textAlign: "center", fontFamily: "var(--font-manrope), sans-serif", color: "#999999" }}>
          Confirmando seu pedido...
        </div>
      </Shell>
    );
  }

  if (status === "error") {
    return (
      <Shell>
        <div style={{ padding: "120px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 22, color: "#E63946" }}>
            Não foi possível confirmar seu pedido
          </h2>
          <p style={{ margin: 0, fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#999999" }}>
            Tente novamente ou volte ao carrinho.
          </p>
          <div style={{ maxWidth: 260, width: "100%", marginTop: 8 }}>
            <PrimaryButton onClick={() => router.push("/carrinho")}>Voltar ao Carrinho</PrimaryButton>
          </div>
        </div>
      </Shell>
    );
  }

  const total = confirmedSubtotal + frete;

  return (
    <Shell>
      <div style={{ paddingBottom: 56 }}>
        {/* Hero */}
        <div
          style={{
            maxWidth: 600,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "40px 0",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#2E9222",
              display: "grid",
              placeItems: "center",
              marginBottom: 24,
            }}
          >
            <motion.svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.polyline
                points="4 12 9 17 20 6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.2, ease: EASE_OUT }}
              />
            </motion.svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15, ease: EASE_OUT }}
            style={{
              margin: "0 0 8px",
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 800,
              fontSize: 36,
              color: "#2E9222",
            }}
          >
            Obrigado!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.22, ease: EASE_OUT }}
            style={{ margin: "0 0 8px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 16, color: "#666666" }}
          >
            Seu pedido foi registrado com sucesso!
          </motion.p>
          {cliente?.email && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.28, ease: EASE_OUT }}
              style={{ margin: 0, fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#999999" }}
            >
              Você receberá atualizações em:{" "}
              <span
                style={{
                  fontFamily: "ui-monospace, Menlo, monospace",
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#012418",
                }}
              >
                {cliente.email}
              </span>
            </motion.p>
          )}
        </div>

        {/* Summary card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.32, ease: EASE_OUT }}
          className="confirm-grid"
          style={{
            maxWidth: 600,
            margin: "32px auto",
            padding: 24,
            background: "#F5F5F5",
            border: "1px solid #E5E5E5",
            borderRadius: 12,
          }}
        >
          <div>
            <FieldLabel>Número do Pedido</FieldLabel>
            <button
              onClick={copyOrder}
              style={{
                fontFamily: "ui-monospace, Menlo, monospace",
                fontWeight: 800,
                fontSize: 18,
                color: "#2E9222",
                userSelect: "all",
                cursor: "pointer",
                background: "transparent",
                border: "none",
                padding: 0,
              }}
            >
              {numero}
            </button>
          </div>
          <div>
            <FieldLabel>Data do Pedido</FieldLabel>
            <Value>{new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</Value>
          </div>
          <div>
            <FieldLabel>Total</FieldLabel>
            <div
              style={{
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 800,
                fontSize: 18,
                color: "#2E9222",
              }}
            >
              {brl(total)}
            </div>
          </div>
          <div>
            <FieldLabel>Frete</FieldLabel>
            <Value>{frete > 0 ? brl(frete) : "Grátis"}</Value>
          </div>
        </motion.div>

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                maxWidth: 600,
                margin: "-16px auto 16px",
                textAlign: "center",
                fontFamily: "var(--font-manrope), sans-serif",
                fontWeight: 600,
                fontSize: 12,
                color: "#2E9222",
              }}
            >
              Número copiado!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline */}
        <div style={{ maxWidth: 600, margin: "40px auto" }}>
          <h3
            style={{
              margin: "0 0 24px",
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 700,
              fontSize: 18,
              color: "#012418",
            }}
          >
            Status do Pedido
          </h3>
          {STAGES.map((st, i) => {
            const color = st.state === "done" ? "#2E9222" : st.state === "current" ? "#FFB703" : "#CCCCCC";
            const iconColor = st.state === "pending" ? "#666666" : "#FFFFFF";
            return (
              <motion.div
                key={st.title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + i * 0.1, ease: EASE_OUT }}
                style={{ display: "flex", gap: 16 }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <motion.div
                    animate={st.state === "current" ? { scale: [1, 1.12, 1] } : {}}
                    transition={{ duration: 1.8, repeat: st.state === "current" ? Infinity : 0, ease: "easeInOut" }}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: color,
                      display: "grid",
                      placeItems: "center",
                      flex: "none",
                    }}
                  >
                    <Icon name={st.ic} size={14} color={iconColor} strokeWidth={2} />
                  </motion.div>
                  {i < STAGES.length - 1 && (
                    <div style={{ width: 2, flex: 1, minHeight: 20, background: color, marginTop: 4 }} />
                  )}
                </div>
                <div style={{ paddingBottom: i < STAGES.length - 1 ? 8 : 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-manrope), sans-serif",
                      fontWeight: 600,
                      fontSize: 13,
                      color: st.state === "pending" ? "#999999" : "#012418",
                    }}
                  >
                    {st.title}
                  </div>
                  <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, color: "#999999" }}>
                    {st.desc}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Items */}
        <div style={{ maxWidth: 600, margin: "40px auto" }}>
          <h3
            style={{
              margin: "0 0 16px",
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 700,
              fontSize: 18,
              color: "#012418",
            }}
          >
            Itens do Pedido
          </h3>
          {confirmedItems.map((it, i) => (
            <div
              key={`${it.produtoId}::${it.variacao}`}
              style={{
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                padding: "16px 0",
                borderBottom: i < confirmedItems.length - 1 ? "1px solid #E5E5E5" : "none",
              }}
            >
              <div style={{ width: 80, height: 80, flex: "none", borderRadius: 8, overflow: "hidden", background: "#F5F5F5" }}>
                {it.shotUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.shotUrl} alt={it.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Placeholder label={it.shot} fontSize={9} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--font-manrope), sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                    color: "#012418",
                    marginBottom: 4,
                  }}
                >
                  {it.title}
                </div>
                <div
                  style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, color: "#999999", marginBottom: 8 }}
                >
                  {it.specs}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-manrope), sans-serif",
                    fontWeight: 500,
                    fontSize: 12,
                    color: "#012418",
                  }}
                >
                  Quantidade: {it.qty}
                </div>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 800,
                  fontSize: 14,
                  color: "#2E9222",
                }}
              >
                {brl(it.price * it.qty)}
              </div>
            </div>
          ))}
        </div>

        {/* Perks */}
        <div className="perks-grid" style={{ maxWidth: 600, margin: "40px auto" }}>
          {PERKS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08, ease: EASE_OUT }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 6,
              }}
            >
              <Icon name={p.icon} size={32} color="#0088B7" strokeWidth={1.6} />
              <div
                style={{
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#012418",
                }}
              >
                {p.title}
              </div>
              <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, color: "#999999" }}>
                {p.desc}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ maxWidth: 400, margin: "40px auto 0", display: "flex", flexDirection: "column", gap: 12 }}>
          <PrimaryButton onClick={() => router.push(pedidoId ? `/pagamento?id=${pedidoId}` : "/pagamento")}>
            Pagar Agora
          </PrimaryButton>
          {pedidoId && (
            <SecondaryButton borderColor="#0088B7" color="#0088B7" onClick={() => router.push(`/pedidos/${pedidoId}`)}>
              Acompanhar Pedido
            </SecondaryButton>
          )}
          <SecondaryButton borderColor="#E5E5E5" color="#012418" onClick={() => router.push("/produtos")}>
            Continuar Comprando
          </SecondaryButton>
          <Link
            href="/avaliar"
            style={{
              display: "block",
              textAlign: "center",
              marginTop: 12,
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Avaliar Compra
          </Link>
        </div>
      </div>
    </Shell>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-archivo), sans-serif",
        fontWeight: 700,
        fontSize: 12,
        color: "#999999",
        textTransform: "uppercase",
        marginBottom: 4,
      }}
    >
      {children}
    </div>
  );
}

function Value({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-manrope), sans-serif",
        fontWeight: 600,
        fontSize: 14,
        color: "#012418",
      }}
    >
      {children}
    </div>
  );
}
