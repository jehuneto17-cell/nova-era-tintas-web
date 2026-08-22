import type { Product } from "@/components/ProductCard";
import { capaUrl, precoAVista, precoMinimo, temEstoque } from "./produtos";
import type { CartLine } from "./store";
import type { Produto, ProdutoVariacao } from "./types";

/** Converte um Produto do Firestore para o formato de exibição usado pelo ProductCard. */
export function toProductCard(produto: Produto): Product {
  const menorPreco = precoMinimo(produto);
  const aVista = precoAVista(produto, menorPreco);
  const temDesconto = produto.descontoPct > 0;
  return {
    id: produto.id,
    title: produto.nome,
    price: (temDesconto ? aVista : menorPreco).toFixed(2).replace(".", ","),
    oldPrice: temDesconto ? menorPreco.toFixed(2).replace(".", ",") : null,
    reviews: 0,
    badge: null,
    promo: temDesconto ? `OFF ${produto.descontoPct}%` : null,
    shot: produto.nome.split(" ")[0],
    shotUrl: capaUrl(produto),
    hasStock: temEstoque(produto),
  };
}

/** A variação padrão de um produto para adicionar ao carrinho a partir de um card (menor preço entre as ativas com estoque). */
export function variacaoPadrao(
  produto: Produto
): [chave: string, variacao: ProdutoVariacao] | null {
  const entradas = Object.entries(produto.variacoes).filter(
    ([, v]) => v.ativo && v.estoque > 0
  );
  if (entradas.length === 0) return null;
  return entradas.reduce((menor, atual) => (atual[1].preco < menor[1].preco ? atual : menor));
}

/**
 * Monta a linha de carrinho para um produto usando sua variação padrão (menor preço com estoque).
 * Retorna `null` também quando `todasCores` — o cliente precisa escolher a cor na página do produto.
 */
export function toCartLine(produto: Produto): Omit<CartLine, "qty"> | null {
  if (produto.todasCores) return null;
  const padrao = variacaoPadrao(produto);
  if (!padrao) return null;
  const [chave, variacao] = padrao;
  const temDesconto = produto.descontoPct > 0;
  return {
    produtoId: produto.id,
    variacao: chave,
    title: produto.nome,
    specs: `Cor: ${variacao.cor} | Volume: ${variacao.volume}`,
    price: temDesconto ? precoAVista(produto, variacao.preco) : variacao.preco,
    oldPrice: temDesconto ? variacao.preco : null,
    shot: produto.nome.split(" ")[0],
    shotUrl: capaUrl(produto),
  };
}
