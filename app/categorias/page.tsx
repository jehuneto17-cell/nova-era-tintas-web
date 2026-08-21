"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { CategoryIcon } from "@/components/CategoryIcon";
import { EASE_OUT } from "@/components/ui";
import { useCategoriasAtivas, useProdutos } from "@/lib/hooks";
import { contarPorCategoria } from "@/lib/produtos";
import type { Categoria } from "@/lib/types";

/** Screen 7 — Categorias. */
export default function CategoriasPage() {
  const { categorias, loading } = useCategoriasAtivas();
  const { produtos } = useProdutos();
  const qtdPorCategoria = contarPorCategoria(produtos);

  return (
    <Shell breadcrumb={[{ label: "Início", href: "/" }, { label: "Categorias" }]}>
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            margin: "0 0 8px",
            fontFamily: "var(--font-archivo), sans-serif",
            fontWeight: 800,
            fontSize: 32,
            color: "#012418",
          }}
        >
          Categorias de Produtos
        </h1>
        <p
          style={{
            margin: "0 0 8px",
            fontFamily: "var(--font-manrope), sans-serif",
            fontSize: 14,
            color: "#666666",
          }}
        >
          Explore nossos produtos organizados por categoria
        </p>
        {!loading && (
          <span
            style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 500,
              fontSize: 12,
              color: "#999999",
            }}
          >
            {categorias.length} categorias disponíveis
          </span>
        )}
      </div>

      {loading ? (
        <div
          style={{
            padding: "80px 0",
            textAlign: "center",
            fontFamily: "var(--font-manrope), sans-serif",
            fontSize: 13,
            color: "#999999",
          }}
        >
          Carregando categorias...
        </div>
      ) : categorias.length === 0 ? (
        <div
          style={{
            padding: "80px 0",
            textAlign: "center",
            fontFamily: "var(--font-manrope), sans-serif",
            fontSize: 13,
            color: "#999999",
          }}
        >
          Nenhuma categoria disponível no momento.
        </div>
      ) : (
        <div className="grid-4">
          {categorias.map((c, i) => (
            <CategoryCard key={c.id} category={c} index={i} qtd={qtdPorCategoria.get(c.id) ?? 0} />
          ))}
        </div>
      )}
    </Shell>
  );
}

function CategoryCard({ category, index, qtd }: { category: Categoria; index: number; qtd: number }) {
  const [hover, setHover] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4), ease: EASE_OUT }}
      whileHover={{ y: -4, boxShadow: "0 4px 16px rgba(0,0,0,.12)" }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      style={{
        background: "#FFFFFF",
        border: `1px solid ${hover ? "#00B20B" : "#E5E5E5"}`,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 1px 8px rgba(0,0,0,.05)",
        cursor: "pointer",
        transition: "border-color 200ms var(--ease-out)",
      }}
    >
      <Link href="/produtos" style={{ display: "block" }}>
        <div
          style={{
            height: 200,
            background: category.fotoUrl ? undefined : category.fundo,
            position: "relative",
            display: "grid",
            placeItems: "center",
            overflow: "hidden",
          }}
        >
          {category.fotoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={category.fotoUrl}
              alt={category.nome}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
          {/* Icon lifts and grows slightly with the card. */}
          <motion.div
            animate={{ scale: hover ? 1.12 : 1 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            style={{ position: "relative", zIndex: 1 }}
          >
            <CategoryIcon icone={category.icone} size={48} color="#FFFFFF" />
          </motion.div>
        </div>
        <div style={{ padding: 20 }}>
          <div
            style={{
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 700,
              fontSize: 18,
              color: "#012418",
              marginBottom: 8,
            }}
          >
            {category.nome}
          </div>
          <div
            style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 600,
              fontSize: 11,
              color: "#00B20B",
              marginBottom: 12,
            }}
          >
            {qtd} produtos
          </div>
          <span
            style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 700,
              fontSize: 12,
              color: hover ? "#00B20B" : "#0088B7",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              transition: "color 200ms var(--ease-out)",
            }}
          >
            Explorar
            <motion.span animate={{ x: hover ? 4 : 0 }} transition={{ duration: 0.2, ease: EASE_OUT }}>
              ›
            </motion.span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
