"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shell } from "@/components/Shell";
import { Placeholder } from "@/components/Placeholder";
import { Icon } from "@/components/Icon";
import { EASE_OUT, PrimaryButton, QtyStepper, SecondaryButton } from "@/components/ui";
import { brl, useStore, type CartLine } from "@/lib/store";
import { buscarCupomValido } from "@/lib/cupons";
import type { Cupom } from "@/lib/types";

/** Screen 3 — Carrinho. */
export default function CarrinhoPage() {
  const router = useRouter();
  const { items, setQty, removeItem, resetCart, subtotal } = useStore();
  const [coupon, setCoupon] = useState<Cupom | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponFocused, setCouponFocused] = useState(false);
  const [couponError, setCouponError] = useState(false);
  const [applying, setApplying] = useState(false);

  const discount = coupon
    ? coupon.tipo === "%"
      ? subtotal * (coupon.valor / 100)
      : Math.min(coupon.valor, subtotal)
    : 0;
  const total = Math.max(0, subtotal - discount);

  async function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code || applying) return;
    setApplying(true);
    const cupom = await buscarCupomValido(code);
    setApplying(false);
    if (cupom) {
      setCoupon(cupom);
      setCouponInput("");
      setCouponError(false);
    } else {
      setCouponError(true);
    }
  }

  return (
    <Shell breadcrumb={[{ label: "Início", href: "/" }, { label: "Carrinho" }]}>
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            padding: "100px 24px",
            textAlign: "center",
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#CCCCCC"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 5h2l2.2 10h9.2l2.1-7H7" />
            <circle cx="10" cy="19" r="1.4" />
            <circle cx="17" cy="19" r="1.4" />
          </svg>
          <h2
            style={{
              margin: "8px 0 0",
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 700,
              fontSize: 24,
              color: "#012418",
            }}
          >
            Seu carrinho está vazio
          </h2>
          <p
            style={{
              margin: "0 0 12px",
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 14,
              color: "#999999",
            }}
          >
            Explore nossos produtos e adicione algo ao carrinho.
          </p>
          <div style={{ maxWidth: 300, width: "100%" }}>
            <PrimaryButton onClick={resetCart}>Continuar Comprando</PrimaryButton>
          </div>
        </motion.div>
      ) : (
        <div className="cart-split">
          <div>
            <div
              className="cart-row cart-head"
              style={{
                borderBottom: "2px solid #E5E5E5",
                paddingBottom: 12,
                marginBottom: 8,
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 12,
                color: "#999999",
                textTransform: "uppercase",
                letterSpacing: ".04em",
              }}
            >
              <span>Produto</span>
              <span>Preço</span>
              <span>Quantidade</span>
              <span>Total</span>
            </div>

            <AnimatePresence initial={false}>
              {items.map((it) => (
                <motion.div
                  key={`${it.produtoId}::${it.variacao}`}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0, x: -24 }}
                  transition={{ duration: 0.25, ease: EASE_OUT }}
                  style={{ overflow: "hidden" }}
                >
                  <CartRow
                    line={it}
                    onQty={(n) => setQty(it.produtoId, it.variacao, n)}
                    onRemove={() => removeItem(it.produtoId, it.variacao)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            <Link
              href="/produtos"
              style={{
                display: "inline-block",
                marginTop: 24,
                fontFamily: "var(--font-manrope), sans-serif",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              ← Continuar Comprando
            </Link>
          </div>

          {/* Summary */}
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
                margin: "0 0 20px",
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 18,
                color: "#012418",
              }}
            >
              Resumo do Pedido
            </h3>

            <SummaryRow label="Subtotal" value={brl(subtotal)} />

            <AnimatePresence>
              {coupon && (
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
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom: "1px solid #E5E5E5",
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#666666" }}>
                      Cupom {coupon?.codigo}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          fontFamily: "var(--font-manrope), sans-serif",
                          fontWeight: 600,
                          fontSize: 13,
                          color: "#2E9222",
                        }}
                      >
                        -{brl(discount)}
                      </span>
                      <RemoveCouponButton onClick={() => setCoupon(null)} />
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
              }}
            >
              <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#666666" }}>
                Impostos
              </span>
              <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, color: "#999999" }}>
                Calculado no checkout
              </span>
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
                  fontSize: 14,
                  color: "#012418",
                  textTransform: "uppercase",
                }}
              >
                Total
              </span>
              <motion.span
                key={total}
                initial={{ scale: 0.94, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                style={{
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 800,
                  fontSize: 20,
                  color: "#2E9222",
                }}
              >
                {brl(total)}
              </motion.span>
            </div>

            {!coupon && (
              <div style={{ margin: "16px 0", display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      setCouponError(false);
                    }}
                    onFocus={() => setCouponFocused(true)}
                    onBlur={() => setCouponFocused(false)}
                    placeholder="Código do cupom"
                    aria-label="Código do cupom"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      height: 40,
                      boxSizing: "border-box",
                      padding: "8px 12px",
                      border: `2px solid ${couponError ? "#E63946" : couponFocused ? "#2E9222" : "#E5E5E5"}`,
                      borderRadius: 8,
                      fontFamily: "var(--font-manrope), sans-serif",
                      fontSize: 13,
                      color: "#012418",
                      background: "#FFFFFF",
                      outline: "none",
                      transition: "all 200ms var(--ease-out)",
                    }}
                  />
                  <motion.button
                    onClick={applyCoupon}
                    disabled={applying}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.2, ease: EASE_OUT }}
                    style={{
                      height: 40,
                      padding: "0 16px",
                      background: "#2E9222",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: 8,
                      fontFamily: "var(--font-archivo), sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: applying ? "not-allowed" : "pointer",
                      opacity: applying ? 0.6 : 1,
                      flex: "none",
                    }}
                  >
                    {applying ? "..." : "Aplicar"}
                  </motion.button>
                </div>
                <AnimatePresence>
                  {couponError && (
                    <motion.span
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        fontFamily: "var(--font-manrope), sans-serif",
                        fontSize: 11,
                        color: "#E63946",
                      }}
                    >
                      Cupom inválido ou expirado.
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <PrimaryButton onClick={() => router.push("/checkout")}>Finalizar Compra</PrimaryButton>
            </div>
            <div style={{ marginTop: 12 }}>
              <SecondaryButton
                height={44}
                borderColor="#E5E5E5"
                color="#012418"
                onClick={() => router.push("/produtos")}
              >
                Continuar Comprando
              </SecondaryButton>
            </div>
          </aside>
        </div>
      )}
    </Shell>
  );
}

function SummaryRow({
  label,
  value,
  valueColor = "#012418",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: 12,
        paddingTop: label === "Subtotal" ? 0 : 12,
        borderBottom: "1px solid #E5E5E5",
      }}
    >
      <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#666666" }}>
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-manrope), sans-serif",
          fontWeight: 600,
          fontSize: 13,
          color: valueColor,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function RemoveCouponButton({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label="Remover cupom"
      style={{
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: 0,
        color: hover ? "#E63946" : "#999999",
        fontSize: 12,
        lineHeight: 1,
        transition: "color 200ms var(--ease-out)",
      }}
    >
      ✕
    </button>
  );
}

function CartRow({
  line,
  onQty,
  onRemove,
}: {
  line: CartLine;
  onQty: (n: number) => void;
  onRemove: () => void;
}) {
  const [hover, setHover] = useState(false);
  const [removeHover, setRemoveHover] = useState(false);

  return (
    <div
      className="cart-row"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        alignItems: "center",
        padding: "16px 0",
        borderBottom: "1px solid #E5E5E5",
        background: hover ? "#F5F5F5" : "transparent",
        transition: "background 200ms var(--ease-out)",
      }}
    >
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ width: 80, height: 80, flex: "none", borderRadius: 8, overflow: "hidden", background: "#F5F5F5" }}>
          {line.shotUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={line.shotUrl} alt={line.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Placeholder label={line.shot} fontSize={9} />
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <span
            style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 600,
              fontSize: 13,
              color: "#012418",
            }}
          >
            {line.title}
          </span>
          <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, color: "#999999" }}>
            {line.specs}
          </span>
          <Link
            href={`/produto/${line.produtoId}`}
            style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 500, fontSize: 11 }}
          >
            Editar
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {line.oldPrice && (
          <span
            style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 11,
              color: "#999999",
              textDecoration: "line-through",
            }}
          >
            {brl(line.oldPrice)}
          </span>
        )}
        <span
          style={{
            fontFamily: "var(--font-archivo), sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: "#2E9222",
          }}
        >
          {brl(line.price)}
        </span>
      </div>

      <QtyStepper qty={line.qty} onChange={onQty} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <motion.span
          key={line.price * line.qty}
          initial={{ scale: 0.94 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          style={{
            fontFamily: "var(--font-archivo), sans-serif",
            fontWeight: 800,
            fontSize: 14,
            color: "#2E9222",
          }}
        >
          {brl(line.price * line.qty)}
        </motion.span>
        <motion.button
          onClick={onRemove}
          onMouseEnter={() => setRemoveHover(true)}
          onMouseLeave={() => setRemoveHover(false)}
          whileTap={{ scale: 0.85 }}
          aria-label={`Remover ${line.title}`}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: 4,
            display: "grid",
            placeItems: "center",
            color: removeHover ? "#CC2E36" : "#E63946",
            transition: "color 200ms var(--ease-out)",
          }}
        >
          <Icon name="trash" size={18} color="currentColor" />
        </motion.button>
      </div>
    </div>
  );
}
