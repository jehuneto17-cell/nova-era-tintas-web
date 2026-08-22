"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { Placeholder } from "./Placeholder";
import { Stars } from "./ui";
import { useStore } from "@/lib/store";
import { toCartLine, toProductCard } from "@/lib/mappers";
import type { Produto } from "@/lib/types";

export type Product = {
  id: string;
  title: string;
  price: string;
  oldPrice?: string | null;
  reviews: number;
  badge?: string | null;
  promo?: string | null;
  shot?: string;
  shotUrl?: string;
  hasStock?: boolean;
};

/**
 * Screen 23 — Product Card.
 * Card lifts 2px with a deeper shadow on hover; the CTA darkens and scales,
 * and confirms with a brief "Adicionado!" state after a click.
 */
export function ProductCard({ produto, index = 0 }: { produto: Produto; index?: number }) {
  const { addItem } = useStore();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const product = toProductCard(produto);

  function add(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (produto.todasCores) {
      router.push(`/produto/${product.id}`);
      return;
    }
    const line = toCartLine(produto);
    if (!line) return;
    addItem(line);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4), ease: [0, 0, 0.2, 1] }}
      whileHover={{ y: -2, boxShadow: "0 4px 16px rgba(0,0,0,.1)" }}
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E5E5",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 1px 8px rgba(0,0,0,.05)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Link href={`/produto/${product.id}`} style={{ display: "block", position: "relative" }}>
        <div style={{ aspectRatio: "1/1" }}>
          {product.shotUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.shotUrl}
              alt={product.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <Placeholder label={`foto do produto\n${product.shot ?? product.title.split(" ")[0]}`} fontSize={11} />
          )}
        </div>
        {product.badge && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "#00B20B",
              color: "#FFFFFF",
              padding: "6px 12px",
              borderRadius: 4,
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 600,
              fontSize: 11,
            }}
          >
            {product.badge}
          </div>
        )}
        {product.promo && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "#E63946",
              color: "#FFFFFF",
              padding: "6px 12px",
              borderRadius: 4,
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 600,
              fontSize: 11,
            }}
          >
            {product.promo}
          </div>
        )}
      </Link>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <Link
          href={`/produto/${product.id}`}
          style={{
            fontFamily: "var(--font-archivo), sans-serif",
            fontWeight: 700,
            fontSize: 14,
            lineHeight: 1.4,
            color: "#012418",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 39,
          }}
        >
          {product.title}
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Stars />
          <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, color: "#999999" }}>
            ({product.reviews} avaliações)
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {product.oldPrice && (
            <span
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 11,
                color: "#999999",
                textDecoration: "line-through",
              }}
            >
              R$ {product.oldPrice}
            </span>
          )}
          <div
            style={{
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 800,
              fontSize: 16,
              color: "#00B20B",
            }}
          >
            R$ {product.price}
          </div>
          {product.oldPrice && (
            <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, color: "#666666" }}>
              à vista no PIX
            </span>
          )}
        </div>
        <motion.button
          onClick={add}
          disabled={product.hasStock === false}
          whileHover={product.hasStock === false ? undefined : { scale: 1.02 }}
          whileTap={product.hasStock === false ? undefined : { scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
          style={{
            marginTop: 4,
            height: 40,
            width: "100%",
            padding: "10px 16px",
            background: product.hasStock === false ? "#CCCCCC" : added ? "#009208" : "#00B20B",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 8,
            fontFamily: "var(--font-archivo), sans-serif",
            fontWeight: 700,
            fontSize: 14,
            cursor: product.hasStock === false ? "not-allowed" : "pointer",
            transition: "background 200ms var(--ease-out)",
          }}
        >
          {product.hasStock === false
            ? "Sem Estoque"
            : added
              ? "Adicionado!"
              : produto.todasCores
                ? "Escolher Cor"
                : "Adicionar ao Carrinho"}
        </motion.button>
      </div>
    </motion.div>
  );
}
