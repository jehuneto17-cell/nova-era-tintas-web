"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shell } from "@/components/Shell";
import { ProductCard } from "@/components/ProductCard";
import { Placeholder } from "@/components/Placeholder";
import { Icon, categoryIcon } from "@/components/Icon";
import { SectionTitle } from "@/components/ui";
import { useBranding, useCategoriasAtivas, useProdutos } from "@/lib/hooks";
import { estoqueTotal, precoMinimo } from "@/lib/produtos";
import type { Categoria } from "@/lib/types";

/** Screen 1 — Home Web. */
export default function HomePage() {
  const { produtos, loading } = useProdutos();
  const { categorias } = useCategoriasAtivas();
  const branding = useBranding();

  const emEstoque = produtos.filter((p) => estoqueTotal(p) > 0);
  const bestsellers = [...emEstoque].sort((a, b) => precoMinimo(b) - precoMinimo(a)).slice(0, 4);
  const promos = produtos.filter((p) => p.descontoPct > 0).slice(0, 8);

  return (
    <Shell>
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          position: "relative",
          height: 320,
          boxSizing: "border-box",
          borderRadius: 12,
          overflow: "hidden",
          marginBottom: 32,
        }}
      >
        {branding?.banner_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={branding.banner_url}
            alt="Banner"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Placeholder label="Solte a imagem do banner aqui" fontSize={13} />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            padding: "40px 60px",
            background:
              "linear-gradient(90deg, rgba(0,36,24,.65) 0%, rgba(0,36,24,.15) 60%, rgba(0,36,24,0) 100%)",
            pointerEvents: "none",
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0, 0, 0.2, 1] }}
            style={{ maxWidth: "50%", pointerEvents: "auto" }}
          >
            <h1
              style={{
                margin: "0 0 12px",
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 800,
                fontSize: 36,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: "#FFFFFF",
                textWrap: "balance",
              }}
            >
              Tinta certa, obra pronta
            </h1>
            <p
              style={{
                margin: "0 0 20px",
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 15,
                color: "rgba(255,255,255,.85)",
              }}
            >
              {branding?.descricao ?? "Linha premium com entrega rápida para toda a região."}
            </p>
            <Link href="/produtos">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
                style={{
                  display: "inline-block",
                  height: 48,
                  lineHeight: "48px",
                  padding: "0 32px",
                  background: "#00B20B",
                  color: "#FFFFFF",
                  borderRadius: 8,
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                Ver Produtos
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Categorias em destaque */}
      {categorias.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <SectionTitle>Categorias em Destaque</SectionTitle>
          <div className="grid-cat-4">
            {categorias.slice(0, 4).map((c, i) => (
              <CategoryTile key={c.id} category={c} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Mais vendidos */}
      {!loading && bestsellers.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <SectionTitle
            action={
              <Link
                href="/produtos"
                style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 600, fontSize: 14 }}
              >
                Ver tudo →
              </Link>
            }
          >
            Mais Vendidos
          </SectionTitle>
          <div className="grid-4">
            {bestsellers.map((p, i) => (
              <ProductCard key={p.id} produto={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Promoções */}
      {!loading && promos.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <SectionTitle
            action={
              <Link
                href="/produtos"
                style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 600, fontSize: 14 }}
              >
                Ver tudo →
              </Link>
            }
          >
            Promoções Especiais
          </SectionTitle>
          <div className="grid-4">
            {promos.map((p, i) => (
              <ProductCard key={p.id} produto={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </Shell>
  );
}

function CategoryTile({ category, index }: { category: Categoria; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: [0, 0, 0.2, 1] }}
      whileHover={{ scale: 1.02, boxShadow: "0 4px 16px rgba(0,0,0,.15)" }}
    >
      <Link
        href="/categorias"
        style={{
          position: "relative",
          height: 180,
          display: "block",
          boxSizing: "border-box",
          borderRadius: 12,
          overflow: "hidden",
          cursor: "pointer",
          background: category.fotoUrl ? undefined : category.fundo,
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
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,.55) 100%)",
          }}
        >
          <Icon name={categoryIcon(category.icone)} size={40} color="#FFFFFF" />
          <div>
            <div
              style={{
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 18,
                color: "#FFFFFF",
              }}
            >
              {category.nome}
            </div>
            <div
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 12,
                color: "rgba(255,255,255,.85)",
              }}
            >
              {category.qtdProdutos} produtos
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
