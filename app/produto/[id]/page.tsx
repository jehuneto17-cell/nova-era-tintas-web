"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DOMPurify from "isomorphic-dompurify";
import { Shell } from "@/components/Shell";
import { ProductCard } from "@/components/ProductCard";
import { Placeholder } from "@/components/Placeholder";
import { Heart, Icon } from "@/components/Icon";
import { PrimaryButton, QtyStepper, SecondaryButton, SectionTitle, Stars, EASE_OUT } from "@/components/ui";
import { getProduto, getProdutosPorCategoria, precoAVista, precoMaximo, precoMinimo } from "@/lib/produtos";
import { agruparPorFamilia, CHAVE_TODAS_CORES, getPaletaCores } from "@/lib/cores";
import { brl, useStore } from "@/lib/store";
import type { CorTinta, Produto } from "@/lib/types";

/**
 * Descrições podem vir de duas fontes:
 * 1. O editor do painel admin (document.execCommand), que no Chrome/Edge gera
 *    `<span style="font-weight: bold">` em vez de `<strong>`.
 * 2. Texto colado de outro site (ex: página de fabricante), trazendo `<h1>`-`<h6>`
 *    e `<div>` aninhados com classes/estilos que não sobrevivem ao sanitizer.
 * Como o sanitizer abaixo remove `style`/`class` e só permite um conjunto restrito
 * de tags, este normalizador reescreve a árvore para essas tags antes de sanitizar,
 * preservando títulos, negrito/itálico/sublinhado e a separação entre parágrafos.
 */
function normalizarHtmlColado(html: string): string {
  if (typeof window === "undefined") return html;

  const container = document.createElement("div");
  container.innerHTML = html;

  container.querySelectorAll("span[style]").forEach((span) => {
    const style = (span.getAttribute("style") || "").toLowerCase();
    let wrapper: HTMLElement = span as HTMLElement;

    if (/font-weight:\s*(bold|[6-9]00)/.test(style)) {
      const strong = document.createElement("strong");
      strong.innerHTML = wrapper.innerHTML;
      wrapper.replaceWith(strong);
      wrapper = strong;
    }
    if (/font-style:\s*italic/.test(style)) {
      const em = document.createElement("em");
      em.innerHTML = wrapper.innerHTML;
      wrapper.replaceWith(em);
      wrapper = em;
    }
    if (/text-decoration:\s*underline/.test(style)) {
      const u = document.createElement("u");
      u.innerHTML = wrapper.innerHTML;
      wrapper.replaceWith(u);
      wrapper = u;
    }
  });

  container.querySelectorAll("h1, h2, h4, h5, h6").forEach((heading) => {
    const h3 = document.createElement("h3");
    h3.innerHTML = heading.innerHTML;
    heading.replaceWith(h3);
  });

  container.querySelectorAll("div").forEach((div) => {
    const temBlocoFilho = div.querySelector("div, h3, p, ul");
    if (!temBlocoFilho && div.textContent?.trim()) {
      const p = document.createElement("p");
      p.innerHTML = div.innerHTML;
      div.replaceWith(p);
    }
  });

  return container.innerHTML;
}

/** Converte descrição em texto puro (com quebras de linha) em HTML, preservando descrições já em HTML. */
function descricaoParaHtml(descricao: string): string {
  const pareceHtml = /<\/?[a-z][\s\S]*>/i.test(descricao);
  if (pareceHtml) return normalizarHtmlColado(descricao);

  const escapado = descricao
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escapado.replace(/\n/g, "<br>");
}

/** Screen 2 — Produto Detalhe. */
export default function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addItem, favorites, toggleFavorite } = useStore();

  const [produto, setProduto] = useState<Produto | null | undefined>(undefined);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [related, setRelated] = useState<Produto[]>([]);
  const [img, setImg] = useState(0);
  const [dir, setDir] = useState(1);
  const [colorIdx, setColorIdx] = useState(0);
  const [paleta, setPaleta] = useState<CorTinta[]>([]);
  const [corPaletaId, setCorPaletaId] = useState<string | null>(null);
  const [volumeIdx, setVolumeIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState({ desc: true, spec: false, rev: false });
  const [added, setAdded] = useState(false);

  if (id !== loadedId) {
    setLoadedId(id);
    setProduto(undefined);
  }

  useEffect(() => {
    let active = true;
    getProduto(id).then((p) => {
      if (!active) return;
      setProduto(p);
      setColorIdx(0);
      setCorPaletaId(null);
      setPaleta([]);
      setVolumeIdx(0);
      setImg(0);
      if (p) {
        getProdutosPorCategoria(p.categoriaId).then((list) => {
          if (active) setRelated(list.filter((r) => r.id !== p.id).slice(0, 4));
        });
        if (p.todasCores) {
          getPaletaCores(p.paletaTodasCores).then((cores) => {
            if (!active) return;
            setPaleta(cores);
            setCorPaletaId(cores[0]?.id ?? null);
          });
        }
      }
    });
    return () => {
      active = false;
    };
  }, [id]);

  const shots = produto?.fotos.length ? produto.fotos.map((f) => f.url) : [];
  const fav = produto ? favorites.includes(produto.id) : false;

  const corSelecionadaPaleta = paleta.find((c) => c.id === corPaletaId);
  const selectedCor = produto?.todasCores ? corSelecionadaPaleta?.nome : produto?.cores[colorIdx]?.nome;
  const selectedVolume = produto?.volumes[volumeIdx];
  const chaveCor = produto?.todasCores ? CHAVE_TODAS_CORES : selectedCor;
  const variacaoChave = chaveCor && selectedVolume ? `${chaveCor}|${selectedVolume}` : null;
  const variacao = produto && variacaoChave ? produto.variacoes[variacaoChave] : undefined;
  const familias = useMemo(() => agruparPorFamilia(paleta), [paleta]);

  const precoMin = produto ? precoMinimo(produto) : 0;
  const precoMax = produto ? precoMaximo(produto) : 0;

  function go(next: number) {
    if (shots.length === 0) return;
    setDir(next > img || (img === shots.length - 1 && next === 0) ? 1 : -1);
    setImg((next + shots.length) % shots.length);
  }

  function add() {
    if (!produto || !variacao || !variacaoChave) return;
    const temDesconto = produto.descontoPct > 0;
    addItem(
      {
        produtoId: produto.id,
        variacao: variacaoChave,
        title: produto.nome,
        specs: `Cor: ${selectedCor} | Volume: ${selectedVolume}`,
        price: temDesconto ? precoAVista(produto, variacao.preco) : variacao.preco,
        oldPrice: temDesconto ? variacao.preco : null,
        shot: produto.nome.split(" ")[0],
        shotUrl: shots[0],
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  if (produto === undefined) {
    return (
      <Shell>
        <div
          style={{
            padding: "120px 0",
            textAlign: "center",
            fontFamily: "var(--font-manrope), sans-serif",
            fontSize: 14,
            color: "#999999",
          }}
        >
          Carregando produto...
        </div>
      </Shell>
    );
  }

  if (produto === null) {
    return (
      <Shell>
        <div
          style={{
            padding: "120px 0",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 700,
              fontSize: 22,
              color: "#012418",
            }}
          >
            Produto não encontrado
          </h2>
          <p style={{ margin: 0, fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#999999" }}>
            Este produto pode ter sido removido ou está indisponível.
          </p>
          <div style={{ maxWidth: 260, width: "100%", marginTop: 8 }}>
            <PrimaryButton onClick={() => (window.location.href = "/produtos")}>Ver Produtos</PrimaryButton>
          </div>
        </div>
      </Shell>
    );
  }

  const canAdd = !!variacao && variacao.ativo && (produto.todasCores || variacao.estoque > 0);

  return (
    <Shell
      breadcrumb={[
        { label: "Início", href: "/" },
        { label: "Tintas", href: "/produtos" },
        { label: produto.nome },
      ]}
    >
      <div className="split-2">
        {/* Gallery */}
        <div style={{ position: "sticky", top: 88 }} className="unstick-mobile">
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1/1",
              border: "1px solid #E5E5E5",
              borderRadius: 12,
              overflow: "hidden",
              background: "#F5F5F5",
            }}
          >
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={img}
                custom={dir}
                initial={{ opacity: 0, x: dir * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -40 }}
                transition={{ duration: 0.28, ease: EASE_OUT }}
                style={{ position: "absolute", inset: 0 }}
              >
                {shots[img] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={shots[img]}
                    alt={produto.nome}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <Placeholder label={produto.nome} fontSize={13} />
                )}
              </motion.div>
            </AnimatePresence>

            {shots.length > 1 && (
              <>
                <CarouselButton side="left" onClick={() => go(img - 1)} />
                <CarouselButton side="right" onClick={() => go(img + 1)} />
              </>
            )}
          </div>

          {shots.length > 1 && (
            <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
              {shots.map((s, i) => (
                <motion.button
                  key={s + i}
                  onClick={() => go(i)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                  aria-label={`Ver foto ${i + 1}`}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    border: `2px solid ${i === img ? "#2E9222" : "transparent"}`,
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "#F5F5F5",
                    padding: 0,
                    transition: "border-color 200ms var(--ease-out)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Buy box */}
        <div>
          {produto.descontoPct > 0 && (
            <div
              style={{
                display: "inline-block",
                background: "#2E9222",
                color: "#FFFFFF",
                padding: "6px 12px",
                borderRadius: 4,
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 600,
                fontSize: 11,
                marginBottom: 12,
              }}
            >
              OFF {produto.descontoPct}%
            </div>
          )}
          <h1
            style={{
              margin: "0 0 8px",
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: "-0.01em",
              color: "#012418",
              textWrap: "pretty",
            }}
          >
            {produto.nome}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Stars size={16} letterSpacing={2} />
            {produto.ambientes && produto.ambientes.length > 0 && (
              <span
                style={{
                  padding: "3px 8px",
                  borderRadius: 7,
                  background: "var(--green-tint)",
                  color: "#2E9222",
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                }}
              >
                {produto.ambientes.length === 2
                  ? "Interior e Exterior"
                  : produto.ambientes[0] === "interior"
                    ? "Interior"
                    : "Exterior"}
              </span>
            )}
          </div>

          <div
            style={{
              padding: 16,
              background: "#F5F5F5",
              borderRadius: 12,
              marginBottom: 24,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {produto.descontoPct > 0 && variacao && (
              <span
                style={{
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontSize: 14,
                  color: "#999999",
                  textDecoration: "line-through",
                }}
              >
                {brl(variacao.preco)}
              </span>
            )}
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <span
                style={{
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 800,
                  fontSize: 32,
                  color: "#2E9222",
                }}
              >
                {variacao
                  ? brl(produto.descontoPct > 0 ? precoAVista(produto, variacao.preco) : variacao.preco)
                  : precoMin === precoMax
                    ? `R$ ${precoMin.toFixed(2).replace(".", ",")}`
                    : `R$ ${precoMin.toFixed(2).replace(".", ",")} - R$ ${precoMax.toFixed(2).replace(".", ",")}`}
              </span>
            </div>
            {produto.descontoPct > 0 && variacao && (
              <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, color: "#666666" }}>
                à vista no PIX
              </span>
            )}
          </div>

          {produto.todasCores ? (
            <PaletaSeletor
              paleta={paleta}
              familias={familias}
              corSelecionadaId={corPaletaId}
              onSelecionar={setCorPaletaId}
            />
          ) : (
            produto.cores.length > 0 && (
              <>
                <Label>
                  Cor:{" "}
                  <span style={{ fontWeight: 400, fontFamily: "var(--font-manrope), sans-serif", color: "#999999" }}>
                    {selectedCor}
                  </span>
                </Label>
                <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                  {produto.cores.map((c, i) => (
                    <motion.button
                      key={c.nome}
                      onClick={() => setColorIdx(i)}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      transition={{ duration: 0.2, ease: EASE_OUT }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        cursor: "pointer",
                        background: "transparent",
                        border: "none",
                        padding: 0,
                      }}
                    >
                      <span
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: c.hex,
                          border: i === colorIdx ? "3px solid #2E9222" : "2px solid #E5E5E5",
                          transition: "all 200ms var(--ease-out)",
                          display: "block",
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "var(--font-manrope), sans-serif",
                          fontSize: 11,
                          color: i === colorIdx ? "#012418" : "#999999",
                          transition: "color 200ms var(--ease-out)",
                        }}
                      >
                        {c.nome}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </>
            )
          )}

          {produto.volumes.length > 0 && (
            <>
              <Label>Volume:</Label>
              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {produto.volumes.map((v, i) => (
                  <motion.button
                    key={v}
                    onClick={() => setVolumeIdx(i)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.2, ease: EASE_OUT }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      background: i === volumeIdx ? "#2E9222" : "#FFFFFF",
                      border: `2px solid ${i === volumeIdx ? "#2E9222" : "#E5E5E5"}`,
                      color: i === volumeIdx ? "#FFFFFF" : "#012418",
                      fontFamily: "var(--font-manrope), sans-serif",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "all 200ms var(--ease-out)",
                    }}
                  >
                    {v}
                  </motion.button>
                ))}
              </div>
            </>
          )}

          {variacao && !variacao.ativo && (
            <p style={{ margin: "0 0 16px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, color: "#E63946" }}>
              Esta combinação não está disponível no momento.
            </p>
          )}
          {variacao && variacao.ativo && !produto.todasCores && variacao.estoque === 0 && (
            <p style={{ margin: "0 0 16px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, color: "#E63946" }}>
              Sem estoque para esta combinação.
            </p>
          )}

          <Label>Quantidade:</Label>
          <div style={{ marginBottom: 24 }}>
            <QtyStepper qty={qty} onChange={(n) => setQty(Math.min(99, Math.max(1, n)))} size="lg" />
          </div>

          <div style={{ marginBottom: 12 }}>
            <PrimaryButton onClick={add} disabled={!canAdd}>
              {!canAdd ? "Indisponível" : added ? "Adicionado ao carrinho!" : "Adicionar ao Carrinho"}
            </PrimaryButton>
          </div>

          <motion.button
            onClick={() => toggleFavorite(produto.id)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            style={{
              width: "100%",
              height: 48,
              background: fav ? "#FFE8E8" : "#FFFFFF",
              border: `2px solid ${fav ? "#E63946" : "#E5E5E5"}`,
              color: "#012418",
              borderRadius: 8,
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "all 200ms var(--ease-out)",
            }}
          >
            <motion.span
              key={String(fav)}
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 14 }}
              style={{ display: "grid", placeItems: "center" }}
            >
              <Heart filled={fav} />
            </motion.span>
            <span>{fav ? "Favoritado" : "Favoritar"}</span>
          </motion.button>
        </div>
      </div>

      {/* Accordions */}
      <section style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 16 }}>
        <Accordion
          title="Descrição"
          open={open.desc}
          onToggle={() => setOpen((s) => ({ ...s, desc: !s.desc }))}
        >
          {produto.descricao ? (
            <div
              className="descricao-produto"
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 14,
                lineHeight: 1.6,
                color: "#666666",
                textWrap: "pretty",
              }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(descricaoParaHtml(produto.descricao), {
                  ALLOWED_TAGS: ["h3", "p", "b", "i", "u", "ul", "li", "div", "br", "strong", "em"],
                  ALLOWED_ATTR: [],
                }),
              }}
            />
          ) : (
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 14,
                lineHeight: 1.6,
                color: "#666666",
                textWrap: "pretty",
              }}
            >
              Sem descrição disponível para este produto.
            </p>
          )}
        </Accordion>

        {produto.specs.length > 0 && (
          <Accordion
            title="Especificações"
            open={open.spec}
            onToggle={() => setOpen((s) => ({ ...s, spec: !s.spec }))}
          >
            <div className="split-2" style={{ gap: 20 }}>
              {produto.specs.map((s) => (
                <div
                  key={s.nome}
                  style={{
                    fontFamily: "var(--font-manrope), sans-serif",
                    fontSize: 13,
                    color: "#666666",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    borderBottom: "1px solid #E5E5E5",
                    paddingBottom: 8,
                  }}
                >
                  <span>{s.nome}</span>
                  <strong style={{ color: "#012418", fontWeight: 600 }}>{s.valor}</strong>
                </div>
              ))}
            </div>
          </Accordion>
        )}
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section style={{ marginTop: 60 }}>
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
            Você também pode gostar
          </SectionTitle>
          <div className="grid-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} produto={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </Shell>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-archivo), sans-serif",
        fontWeight: 700,
        fontSize: 14,
        color: "#012418",
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Seletor de cor para produtos com `todasCores` (catálogo Suvinil completo).
 * Preview grande da cor ativa + abas por família + busca, para navegar 130+ cores sem rolagem infinita.
 */
function PaletaSeletor({
  paleta,
  familias,
  corSelecionadaId,
  onSelecionar,
}: {
  paleta: CorTinta[];
  familias: { familia: string; cores: CorTinta[] }[];
  corSelecionadaId: string | null;
  onSelecionar: (id: string) => void;
}) {
  const [familiaAtiva, setFamiliaAtiva] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const corAtiva = paleta.find((c) => c.id === corSelecionadaId);

  useEffect(() => {
    if (familias.length > 0 && familiaAtiva === null) {
      setFamiliaAtiva(corAtiva?.familia ?? familias[0].familia);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familias]);

  const termo = busca.trim().toLowerCase();
  const buscando = termo.length > 0;

  const resultadosBusca = useMemo(() => {
    if (!buscando) return [];
    return paleta.filter(
      (c) => c.nome.toLowerCase().includes(termo) || c.codigo.toLowerCase().includes(termo)
    );
  }, [paleta, termo, buscando]);

  const grupoAtivo = familias.find((f) => f.familia === familiaAtiva);
  const coresExibidas = buscando ? resultadosBusca : (grupoAtivo?.cores ?? []);

  if (paleta.length === 0) {
    return (
      <>
        <Label>Cor</Label>
        <p style={{ margin: "0 0 20px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#999999" }}>
          Carregando paleta de cores...
        </p>
      </>
    );
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <Label>Cor</Label>

      {/* Preview grande da cor ativa */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: 14,
          background: "#F5F5F5",
          borderRadius: 12,
          marginBottom: 14,
        }}
      >
        <motion.div
          key={corAtiva?.id ?? "none"}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 10,
            background: corAtiva?.hex ?? "#E5E5E5",
            border: "1px solid rgba(0,0,0,.08)",
            boxShadow: "0 1px 4px rgba(0,0,0,.1)",
            flex: "none",
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: "#012418",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {corAtiva?.nome ?? "Selecione uma cor"}
          </div>
          {corAtiva && (
            <div
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontWeight: 600,
                fontSize: 12,
                color: "#999999",
                letterSpacing: "0.02em",
              }}
            >
              Código {corAtiva.codigo}
            </div>
          )}
        </div>
      </div>

      {/* Busca */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar cor por nome ou código..."
          aria-label="Buscar cor por nome ou código"
          style={{
            width: "100%",
            height: 40,
            boxSizing: "border-box",
            padding: "0 14px",
            border: "2px solid #E5E5E5",
            borderRadius: 8,
            fontFamily: "var(--font-manrope), sans-serif",
            fontSize: 13,
            color: "#012418",
            outline: "none",
            background: "#FFFFFF",
            transition: "border-color 200ms var(--ease-out)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#2E9222")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E5E5")}
        />
      </div>

      {/* Abas por família — ocultas durante a busca ou quando a paleta não tem famílias (ex: Coral) */}
      {!buscando && familias.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 8,
            marginBottom: 12,
          }}
        >
          {familias.map((grupo) => {
            const ativa = grupo.familia === familiaAtiva;
            return (
              <button
                key={grupo.familia}
                onClick={() => setFamiliaAtiva(grupo.familia)}
                aria-pressed={ativa}
                style={{
                  flex: "none",
                  padding: "8px 14px",
                  borderRadius: 20,
                  border: `1.5px solid ${ativa ? "#2E9222" : "#E5E5E5"}`,
                  background: ativa ? "#2E9222" : "#FFFFFF",
                  color: ativa ? "#FFFFFF" : "#666666",
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 200ms var(--ease-out)",
                }}
              >
                {grupo.familia}
              </button>
            );
          })}
        </div>
      )}

      {/* Grade de swatches */}
      <AnimatePresence mode="wait">
        <motion.div
          key={buscando ? `busca:${termo}` : familiaAtiva}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: EASE_OUT }}
        >
          {coresExibidas.length === 0 ? (
            <p
              style={{
                margin: 0,
                padding: "20px 0",
                textAlign: "center",
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 13,
                color: "#999999",
              }}
            >
              Nenhuma cor encontrada para &quot;{busca}&quot;.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(40px, 1fr))",
                gap: 8,
                maxHeight: 216,
                overflowY: "auto",
                padding: 4,
              }}
            >
              {coresExibidas.map((c) => {
                const selecionada = c.id === corSelecionadaId;
                return (
                  <motion.button
                    key={c.id}
                    title={`${c.nome} — ${c.codigo}`}
                    aria-label={`${c.nome} — ${c.codigo}`}
                    aria-pressed={selecionada}
                    onClick={() => onSelecionar(c.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ duration: 0.15, ease: EASE_OUT }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: c.hex,
                      border: selecionada ? "3px solid #2E9222" : "2px solid #E5E5E5",
                      boxShadow: selecionada ? "0 0 0 2px rgba(46,146,34,.2)" : "none",
                      cursor: "pointer",
                      padding: 0,
                      transition: "border-color 200ms var(--ease-out), box-shadow 200ms var(--ease-out)",
                    }}
                  />
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function CarouselButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileTap={{ scale: 0.9 }}
      aria-label={side === "left" ? "Imagem anterior" : "Próxima imagem"}
      style={{
        position: "absolute",
        [side]: 16,
        top: "50%",
        transform: "translateY(-50%)",
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: "none",
        background: hover ? "#F5F5F5" : "rgba(255,255,255,.9)",
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        boxShadow: "0 1px 8px rgba(0,0,0,.08)",
        transition: "background 200ms var(--ease-out)",
        zIndex: 2,
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#012418"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points={side === "left" ? "15 5 8 12 15 19" : "9 5 16 12 9 19"} />
      </svg>
    </motion.button>
  );
}

function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ border: "1px solid #E5E5E5", borderRadius: 12, overflow: "hidden", background: "#FFFFFF" }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 20,
          cursor: "pointer",
          fontFamily: "var(--font-archivo), sans-serif",
          fontWeight: 700,
          fontSize: 16,
          color: "#012418",
          width: "100%",
          background: "transparent",
          border: "none",
          textAlign: "left",
        }}
      >
        <span>{title}</span>
        <Icon
          name="chevron"
          size={20}
          color="#999999"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 200ms var(--ease-out)" }}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 20px 20px" }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
