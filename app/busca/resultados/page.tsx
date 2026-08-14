"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Shell } from "@/components/Shell";
import { ProductCard } from "@/components/ProductCard";
import { EASE_OUT, PrimaryButton } from "@/components/ui";
import { useProdutos } from "@/lib/hooks";
import { precoMinimo } from "@/lib/produtos";

const SORTS = ["Mais Relevantes", "Menor Preço", "Maior Preço"];

/** Screen 10 — Resultados de Busca. */
export default function ResultadosPage() {
  return (
    <Suspense fallback={<Shell>{null}</Shell>}>
      <Resultados />
    </Suspense>
  );
}

function Resultados() {
  const router = useRouter();
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const [sort, setSort] = useState(SORTS[0]);
  const { produtos, loading } = useProdutos();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = q
      ? produtos.filter(
          (p) => p.nome.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q),
        )
      : [];
    list = [...list];
    if (sort === "Menor Preço") list.sort((a, b) => precoMinimo(a) - precoMinimo(b));
    if (sort === "Maior Preço") list.sort((a, b) => precoMinimo(b) - precoMinimo(a));
    return list;
  }, [produtos, query, sort]);

  const matches = results.length > 0;

  return (
    <Shell breadcrumb={[{ label: "Início", href: "/" }, { label: "Busca", href: "/busca" }, { label: "Resultados" }]}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: "1px solid #E5E5E5",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 500,
              fontSize: 12,
              color: "#999999",
            }}
          >
            Resultados para:{" "}
          </span>
          <span
            style={{
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: "#012418",
            }}
          >
            &ldquo;{query}&rdquo;
          </span>
          {!loading && (
            <motion.span
              key={results.length}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontWeight: 500,
                fontSize: 12,
                color: "#00B20B",
                marginLeft: 8,
              }}
            >
              {results.length} produtos encontrados
            </motion.span>
          )}
        </div>

        {matches && (
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Ordenar por"
            style={{
              height: 36,
              padding: "0 12px",
              border: "2px solid #E5E5E5",
              borderRadius: 6,
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 600,
              fontSize: 12,
              color: "#012418",
              background: "#FFFFFF",
              outline: "none",
              cursor: "pointer",
              transition: "border-color 200ms var(--ease-out)",
            }}
          >
            {SORTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
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
          Buscando produtos...
        </div>
      ) : matches ? (
        <motion.div layout className="grid-4">
          {results.map((p, i) => (
            <ProductCard key={p.id} produto={p} index={i} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            padding: "80px 0",
            textAlign: "center",
          }}
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="1.5">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <h2
            style={{
              margin: "8px 0 0",
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 700,
              fontSize: 20,
              color: "#012418",
            }}
          >
            Nenhum produto encontrado
          </h2>
          <p
            style={{
              margin: "0 0 12px",
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 13,
              color: "#666666",
            }}
          >
            Tente uma busca diferente ou explore nossas categorias
          </p>
          <div style={{ maxWidth: 260, width: "100%" }}>
            <PrimaryButton onClick={() => router.push("/categorias")}>Explorar Categorias</PrimaryButton>
          </div>
        </motion.div>
      )}
    </Shell>
  );
}
