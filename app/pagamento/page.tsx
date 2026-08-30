"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Shell } from "@/components/Shell";
import { Steps } from "@/components/Steps";
import { EASE_OUT, SecondaryButton } from "@/components/ui";
import { brl, useStore } from "@/lib/store";
import { usePagamento } from "@/lib/hooks";

type CheckoutData = { endereco: string; frete: number; enderecoMudou: boolean };

/** Screen 5 — Pagamento PIX. */
export default function PagamentoPage() {
  return (
    <Suspense fallback={<Shell>{null}</Shell>}>
      <Pagamento />
    </Suspense>
  );
}

function Pagamento() {
  const router = useRouter();
  const params = useSearchParams();
  const pedidoId = params.get("id");
  const { items, subtotal } = useStore();
  const pagamento = usePagamento();
  const [tab, setTab] = useState<"qr" | "copy">("qr");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [toast, setToast] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function readCheckoutData() {
      try {
        const raw = sessionStorage.getItem("net_checkout");
        return raw ? (JSON.parse(raw) as CheckoutData) : null;
      } catch {
        // sessionStorage indisponível — segue sem dados de checkout
        return null;
      }
    }
    // Lido via microtask (callback), seguindo o padrão "subscribe/callback"
    // recomendado pela regra react-hooks/set-state-in-effect.
    Promise.resolve(readCheckoutData()).then((data) => {
      if (data) setCheckoutData(data);
    });
  }, []);

  const prazoHoras = pagamento?.pix_prazo_horas;
  useEffect(() => {
    if (prazoHoras) {
      Promise.resolve(Math.round(prazoHoras * 3600)).then(setSecondsLeft);
    }
  }, [prazoHoras]);

  // Live expiry countdown, as in the design.
  useEffect(() => {
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const totalSeconds = secondsLeft;
  const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  const expired = pagamento ? secondsLeft === 0 : false;

  const freteValor = checkoutData?.frete ?? 0;
  const total = subtotal + freteValor;

  function copyKey() {
    if (!pagamento?.pix_chave) return;
    navigator.clipboard?.writeText(pagamento.pix_chave).catch(() => {});
    setToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(false), 2000);
  }

  return (
    <Shell>
      <Steps current={2} />

      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 24,
          fontFamily: "var(--font-manrope), sans-serif",
          fontSize: 12,
          flexWrap: "wrap",
        }}
      >
        <Link href="/">Início</Link>
        <span style={{ color: "#999999" }}>/</span>
        <Link href="/carrinho">Carrinho</Link>
        <span style={{ color: "#999999" }}>/</span>
        <Link href="/checkout">Checkout</Link>
        <span style={{ color: "#999999" }}>/</span>
        <span style={{ color: "#012418" }}>Pagamento</span>
      </nav>

      <div className="pix-split">
        <div>
          <h2
            style={{
              margin: "0 0 4px",
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 700,
              fontSize: 20,
              color: "#012418",
            }}
          >
            Pagamento via PIX
          </h2>
          <p
            style={{
              margin: "0 0 24px",
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 13,
              color: "#666666",
            }}
          >
            Digitalize o QR code ou copie a chave PIX
          </p>

          {/* Expiry banner — pulses red once expired. */}
          <motion.div
            animate={expired ? { borderColor: "#E63946" } : {}}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: expired ? "#FFE8E8" : "#FFF8E5",
              border: `1px solid ${expired ? "#E63946" : "#FFB703"}`,
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 24,
              transition: "background 300ms var(--ease-out)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={expired ? "#E63946" : "#FFB703"}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flex: "none" }}
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3.5 2" />
            </svg>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontWeight: 500,
                  fontSize: 13,
                  color: expired ? "#E63946" : "#FFB703",
                }}
              >
                {expired ? "QR code expirado." : "Este QR code e chave PIX expiram em: "}
                {!expired && (
                  <strong style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 16 }}>
                    {hh}:{mm}:{ss}
                  </strong>
                )}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontSize: 11,
                  color: expired ? "#E63946" : "#FFB703",
                }}
              >
                Gere um novo se necessário
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #E5E5E5", marginBottom: 24 }}>
            <TabButton active={tab === "qr"} onClick={() => setTab("qr")}>
              QR Code
            </TabButton>
            <TabButton active={tab === "copy"} onClick={() => setTab("copy")}>
              Copiar PIX
            </TabButton>
          </div>

          <AnimatePresence mode="wait">
            {tab === "qr" ? (
              <motion.div
                key="qr"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: 24,
                  background: "#F5F5F5",
                  borderRadius: 12,
                }}
              >
                {pagamento?.pix_qr_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pagamento.pix_qr_url}
                    alt="QR code PIX"
                    style={{
                      width: 240,
                      height: 240,
                      maxWidth: "100%",
                      border: "2px solid #E5E5E5",
                      borderRadius: 8,
                      objectFit: "contain",
                      opacity: expired ? 0.35 : 1,
                      transition: "opacity 300ms var(--ease-out)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 240,
                      height: 240,
                      maxWidth: "100%",
                      border: "2px solid #E5E5E5",
                      background:
                        "#FFFFFF repeating-conic-gradient(#012418 0% 25%, #FFFFFF 0% 50%) 0 0/16px 16px",
                      borderRadius: 8,
                      opacity: expired ? 0.35 : 1,
                      transition: "opacity 300ms var(--ease-out)",
                    }}
                  />
                )}
                <p
                  style={{
                    margin: "16px 0 0",
                    fontFamily: "var(--font-manrope), sans-serif",
                    fontSize: 13,
                    color: "#666666",
                    textAlign: "center",
                  }}
                >
                  Abra seu app de banco e digitalize este QR code
                </p>
                <div style={{ marginTop: 16, maxWidth: 200, width: "100%" }}>
                  <SecondaryButton height={40}>Baixar QR Code</SecondaryButton>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                style={{ padding: 24, background: "#F5F5F5", borderRadius: 12 }}
              >
                <p
                  style={{
                    margin: "0 0 16px",
                    fontFamily: "var(--font-manrope), sans-serif",
                    fontWeight: 500,
                    fontSize: 13,
                    color: "#666666",
                  }}
                >
                  Copie a chave PIX abaixo e cole no seu app de banco
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "#FFFFFF",
                    border: "2px solid #2E9222",
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      fontFamily: "ui-monospace, Menlo, monospace",
                      fontWeight: 600,
                      fontSize: 12,
                      color: "#012418",
                      wordBreak: "break-all",
                      userSelect: "all",
                    }}
                  >
                    {pagamento?.pix_chave ?? "Carregando..."}
                  </span>
                  <motion.button
                    onClick={copyKey}
                    whileHover={{ scale: 1.06, backgroundColor: "#24741B" }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ duration: 0.2, ease: EASE_OUT }}
                    aria-label="Copiar chave PIX"
                    style={{
                      width: 40,
                      height: 40,
                      flex: "none",
                      background: "#2E9222",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="9" y="9" width="11" height="11" rx="2" />
                      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                    </svg>
                  </motion.button>
                </div>
                <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, color: "#999999" }}>
                  {pagamento ? `Tipo: ${pagamento.pix_tipo}` : ""}
                  {pagamento?.pix_recebedor ? ` · Recebedor: ${pagamento.pix_recebedor}` : ""}
                </span>
                {pagamento?.pix_instrucoes && (
                  <p
                    style={{
                      margin: "12px 0 0",
                      fontFamily: "var(--font-manrope), sans-serif",
                      fontSize: 12,
                      color: "#666666",
                      lineHeight: 1.5,
                    }}
                  >
                    {pagamento.pix_instrucoes}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                style={{
                  marginTop: 12,
                  display: "inline-block",
                  background: "#012418",
                  color: "#FFFFFF",
                  padding: "8px 16px",
                  borderRadius: 6,
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                Copiado!
              </motion.div>
            )}
          </AnimatePresence>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: 20,
              background: "#E8F5E9",
              border: "1px solid #2E9222",
              borderRadius: 8,
              marginTop: 24,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontWeight: 500,
                fontSize: 12,
                color: "#2E9222",
              }}
            >
              Valor a pagar:
            </span>
            <span
              style={{
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 800,
                fontSize: 28,
                color: "#2E9222",
              }}
            >
              {brl(total)}
            </span>
          </div>

          <div style={{ marginTop: 24 }}>
            <SecondaryButton
              borderColor="#0088B7"
              color="#0088B7"
              onClick={() => router.push(pedidoId ? `/comprovante/enviar?id=${pedidoId}` : "/comprovante/enviar")}
            >
              Já enviei o comprovante
            </SecondaryButton>
          </div>
        </div>

        <aside
          className="unstick-mobile"
          style={{
            position: "sticky",
            top: 88,
            background: "#F5F5F5",
            border: "1px solid #E5E5E5",
            borderRadius: 12,
            padding: 24,
            maxHeight: "calc(100vh - 120px)",
            overflow: "auto",
          }}
        >
          <h3
            style={{
              margin: "0 0 16px",
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: "#012418",
            }}
          >
            Resumo do Pedido
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              borderBottom: "1px solid #E5E5E5",
              paddingBottom: 16,
              marginBottom: 16,
            }}
          >
            {items.map((i) => (
              <div key={`${i.produtoId}::${i.variacao}`} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span
                  style={{
                    fontFamily: "var(--font-manrope), sans-serif",
                    fontWeight: 600,
                    fontSize: 12,
                    color: "#012418",
                  }}
                >
                  {i.title} x{i.qty}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-manrope), sans-serif",
                    fontWeight: 600,
                    fontSize: 12,
                    color: "#2E9222",
                    flex: "none",
                  }}
                >
                  {brl(i.price * i.qty)}
                </span>
              </div>
            ))}
          </div>

          <div style={{ borderBottom: "1px solid #E5E5E5", paddingBottom: 16, marginBottom: 16 }}>
            <div
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontWeight: 500,
                fontSize: 11,
                color: "#999999",
                marginBottom: 4,
              }}
            >
              Entregando em:
            </div>
            <div
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontWeight: 600,
                fontSize: 12,
                color: "#012418",
              }}
            >
              {checkoutData?.endereco || "Endereço não informado"}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SmallRow label="Subtotal" value={brl(subtotal)} border />
            <SmallRow
              label="Frete"
              value={freteValor > 0 ? brl(freteValor) : "Grátis"}
              valueColor={freteValor > 0 ? "#012418" : "#2E9222"}
              border
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, color: "#666666" }}>
                Impostos
              </span>
              <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, color: "#999999" }}>
                Calculado no pagamento
              </span>
            </div>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              border: "2px solid #2E9222",
              borderRadius: 8,
              padding: 16,
              margin: "16px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: "#012418",
                textTransform: "uppercase",
              }}
            >
              Total
            </span>
            <span
              style={{
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 800,
                fontSize: 18,
                color: "#2E9222",
              }}
            >
              {brl(total)}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              background: "#F0F4FF",
              border: "1px solid #0088B7",
              borderRadius: 8,
              padding: "12px 16px",
              marginTop: 16,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0088B7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flex: "none", marginTop: 1 }}
            >
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="10" x2="12" y2="16" />
              <circle cx="12" cy="7.5" r="0.6" fill="#0088B7" />
            </svg>
            <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, color: "#0088B7" }}>
              Ao confirmar o pagamento, você receberá um email de confirmação
            </span>
          </div>
        </aside>
      </div>
    </Shell>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "12px 24px",
        fontFamily: "var(--font-archivo), sans-serif",
        fontWeight: 700,
        fontSize: 14,
        color: active ? "#2E9222" : "#999999",
        borderBottom: `3px solid ${active ? "#2E9222" : "transparent"}`,
        cursor: "pointer",
        marginBottom: -2,
        transition: "color 200ms var(--ease-out), border-color 200ms var(--ease-out)",
        background: "transparent",
        border: "none",
        borderBottomStyle: "solid",
      }}
    >
      {children}
    </button>
  );
}

function SmallRow({
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
        paddingBottom: border ? 12 : 0,
        borderBottom: border ? "1px solid #E5E5E5" : "none",
      }}
    >
      <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, color: "#666666" }}>
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-manrope), sans-serif",
          fontWeight: 600,
          fontSize: 12,
          color: valueColor,
        }}
      >
        {value}
      </span>
    </div>
  );
}
