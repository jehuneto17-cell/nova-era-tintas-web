"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Shell } from "@/components/Shell";
import { Steps } from "@/components/Steps";
import { EASE_OUT, PrimaryButton } from "@/components/ui";
import { brl, useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { useFrete, useLoja } from "@/lib/hooks";

const PICKUP_COST = 0;

/** Screen 4 — Checkout. */
export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal } = useStore();
  const { cliente } = useAuth();
  const frete = useFrete();
  const loja = useLoja();

  const enderecos = cliente?.enderecos ?? [];
  const principal = enderecos.find((e) => e.principal) ?? enderecos[0] ?? null;

  const [shipKey, setShipKey] = useState<"entrega" | "pickup">("entrega");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const addressId = selectedAddressId ?? principal?.id ?? null;

  const freteValor = frete?.valor ?? 0;
  const freteGratisAcima = frete?.gratis_acima ?? Infinity;
  const shipCost = shipKey === "pickup" ? PICKUP_COST : subtotal >= freteGratisAcima ? 0 : freteValor;
  const total = subtotal + shipCost;

  const selectedAddress = enderecos.find((e) => e.id === addressId) ?? null;
  const canSubmit = items.length > 0 && (shipKey === "pickup" || !!selectedAddress) && !submitting;

  function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    const enderecoTexto =
      shipKey === "pickup"
        ? `Retirada na loja — ${loja?.nome ?? ""}, ${loja?.endereco ?? ""}, ${loja?.cidade ?? ""}`.trim()
        : selectedAddress?.texto ?? "";
    try {
      sessionStorage.setItem(
        "net_checkout",
        JSON.stringify({ endereco: enderecoTexto, frete: shipCost, enderecoMudou: false }),
      );
    } catch {
      // sessionStorage indisponível — segue mesmo assim
    }
    setTimeout(() => router.push("/pagamento"), 400);
  }

  return (
    <Shell>
      <Steps current={1} />

      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 20,
          fontFamily: "var(--font-manrope), sans-serif",
          fontSize: 12,
        }}
      >
        <Link href="/">Início</Link>
        <span style={{ color: "#999999" }}>/</span>
        <Link href="/carrinho">Carrinho</Link>
        <span style={{ color: "#999999" }}>/</span>
        <span style={{ color: "#012418" }}>Checkout</span>
      </nav>

      <div className="checkout-split">
        <div>
          <h2
            style={{
              margin: "0 0 20px",
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 700,
              fontSize: 20,
              color: "#012418",
            }}
          >
            Endereço de Entrega
          </h2>

          {shipKey === "entrega" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {enderecos.length === 0 ? (
                <div
                  style={{
                    padding: 16,
                    background: "#FFF8E5",
                    border: "1px solid #FFE5A0",
                    borderRadius: 8,
                    fontFamily: "var(--font-manrope), sans-serif",
                    fontSize: 13,
                    color: "#012418",
                  }}
                >
                  Você ainda não tem um endereço salvo.{" "}
                  <Link href="/perfil" style={{ fontWeight: 600, color: "#0088B7" }}>
                    Adicionar endereço
                  </Link>
                </div>
              ) : (
                enderecos.map((end) => {
                  const on = end.id === addressId;
                  return (
                    <motion.button
                      key={end.id}
                      onClick={() => setSelectedAddressId(end.id)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.2, ease: EASE_OUT }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "12px 16px",
                        border: on ? "2px solid #00B20B" : "1px solid #E5E5E5",
                        background: on ? "#F3FBF4" : "#FFFFFF",
                        borderRadius: 8,
                        cursor: "pointer",
                        transition: "all 200ms var(--ease-out)",
                        textAlign: "left",
                        width: "100%",
                        gap: 12,
                      }}
                    >
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          border: `2px solid ${on ? "#00B20B" : "#E5E5E5"}`,
                          background: on ? "#00B20B" : "#FFFFFF",
                          flex: "none",
                          boxShadow: on ? "inset 0 0 0 3px #FFFFFF" : "none",
                          transition: "all 200ms var(--ease-out)",
                          display: "block",
                        }}
                      />
                      <span>
                        <span
                          style={{
                            display: "block",
                            fontFamily: "var(--font-manrope), sans-serif",
                            fontWeight: 600,
                            fontSize: 13,
                            color: "#012418",
                          }}
                        >
                          {end.rotulo}
                        </span>
                        <span
                          style={{
                            display: "block",
                            fontFamily: "var(--font-manrope), sans-serif",
                            fontSize: 12,
                            color: "#999999",
                          }}
                        >
                          {end.texto}
                        </span>
                      </span>
                    </motion.button>
                  );
                })
              )}
              <Link
                href="/perfil"
                style={{
                  alignSelf: "flex-start",
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontWeight: 600,
                  fontSize: 12,
                  color: "#0088B7",
                }}
              >
                + Adicionar novo endereço
              </Link>
            </div>
          )}

          <h3
            style={{
              margin: "0 0 16px",
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: "#012418",
            }}
          >
            Método de Entrega
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
            {(
              [
                {
                  key: "entrega" as const,
                  label: "Entrega",
                  info:
                    subtotal >= freteGratisAcima
                      ? "Grátis acima do valor mínimo"
                      : freteValor > 0
                        ? "Frete calculado no endereço selecionado"
                        : "Grátis",
                  cost: subtotal >= freteGratisAcima ? 0 : freteValor,
                },
                {
                  key: "pickup" as const,
                  label: "Retirada na Loja",
                  info: `Buscar em ${loja?.cidade ?? loja?.nome ?? "nossa loja"}`,
                  cost: PICKUP_COST,
                },
              ]
            ).map((opt) => {
              const on = opt.key === shipKey;
              return (
                <motion.button
                  key={opt.key}
                  onClick={() => setShipKey(opt.key)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    border: on ? "2px solid #00B20B" : "1px solid #E5E5E5",
                    background: on ? "#F3FBF4" : "#FFFFFF",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 200ms var(--ease-out)",
                    textAlign: "left",
                    width: "100%",
                    gap: 12,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: `2px solid ${on ? "#00B20B" : "#E5E5E5"}`,
                        background: on ? "#00B20B" : "#FFFFFF",
                        flex: "none",
                        boxShadow: on ? "inset 0 0 0 3px #FFFFFF" : "none",
                        transition: "all 200ms var(--ease-out)",
                        display: "block",
                      }}
                    />
                    <span>
                      <span
                        style={{
                          display: "block",
                          fontFamily: "var(--font-manrope), sans-serif",
                          fontWeight: 600,
                          fontSize: 13,
                          color: "#012418",
                        }}
                      >
                        {opt.label}
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontFamily: "var(--font-manrope), sans-serif",
                          fontSize: 12,
                          color: "#999999",
                        }}
                      >
                        {opt.info}
                      </span>
                    </span>
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-manrope), sans-serif",
                      fontWeight: 600,
                      fontSize: 12,
                      color: opt.cost > 0 ? "#E63946" : "#00B20B",
                    }}
                  >
                    {opt.cost > 0 ? brl(opt.cost) : "Grátis"}
                  </span>
                </motion.button>
              );
            })}
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
                    color: "#00B20B",
                    flex: "none",
                  }}
                >
                  {brl(i.price * i.qty)}
                </span>
              </div>
            ))}
            <Link href="/carrinho" style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 500, fontSize: 12 }}>
              Ver Carrinho
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Row label="Subtotal" value={brl(subtotal)} border />
            <Row
              label="Frete"
              value={shipCost > 0 ? brl(shipCost) : "Grátis"}
              valueColor={shipCost > 0 ? "#012418" : "#00B20B"}
              border
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#666666" }}>
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
              border: "2px solid #00B20B",
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
            <motion.span
              key={total}
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              style={{
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 800,
                fontSize: 18,
                color: "#00B20B",
              }}
            >
              {brl(total)}
            </motion.span>
          </div>

          <div style={{ marginTop: 16 }}>
            <PrimaryButton onClick={submit} loading={submitting} disabled={!canSubmit}>
              {submitting ? "Processando..." : "Continuar para Pagamento"}
            </PrimaryButton>
          </div>
          <Link
            href="/carrinho"
            style={{
              display: "block",
              textAlign: "center",
              marginTop: 12,
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 500,
              fontSize: 12,
            }}
          >
            Voltar para Carrinho
          </Link>
        </aside>
      </div>
    </Shell>
  );
}

function Row({
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
