import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Produto, ProdutoVariacao } from "./types";

function toProduto(id: string, data: Record<string, unknown>): Produto {
  return {
    id,
    nome: (data.nome as string) ?? "",
    categoriaId: (data.categoriaId as string) ?? "",
    categoria: (data.categoria as string) ?? "",
    descricao: (data.descricao as string) ?? "",
    limiteEstoqueBaixo: (data.limiteEstoqueBaixo as number) ?? 0,
    descontoPct: (data.descontoPct as number) ?? 0,
    ativo: (data.ativo as boolean) ?? false,
    cores: (data.cores as Produto["cores"]) ?? [],
    volumes: (data.volumes as string[]) ?? [],
    variacoes: (data.variacoes as Produto["variacoes"]) ?? {},
    specs: (data.specs as Produto["specs"]) ?? [],
    fotos: (data.fotos as Produto["fotos"]) ?? [],
  };
}

/** Variações ativas de um produto (ignora variações pausadas). */
export function variacoesAtivas(produto: Produto): ProdutoVariacao[] {
  return Object.values(produto.variacoes).filter((v) => v.ativo);
}

export function precoMinimo(produto: Produto): number {
  const ativas = variacoesAtivas(produto);
  if (ativas.length === 0) return 0;
  return Math.min(...ativas.map((v) => v.preco));
}

export function precoMaximo(produto: Produto): number {
  const ativas = variacoesAtivas(produto);
  if (ativas.length === 0) return 0;
  return Math.max(...ativas.map((v) => v.preco));
}

export function estoqueTotal(produto: Produto): number {
  return variacoesAtivas(produto).reduce((sum, v) => sum + v.estoque, 0);
}

export function capaUrl(produto: Produto): string | undefined {
  return produto.fotos[0]?.url;
}

/** Assina a lista de produtos ativos em tempo real. */
export function subscribeProdutos(
  onChange: (produtos: Produto[]) => void
): Unsubscribe {
  const q = query(collection(db, "produtos"), where("ativo", "==", true));
  return onSnapshot(q, (snap) => {
    const produtos = snap.docs.map((d) => toProduto(d.id, d.data()));
    onChange(produtos);
  });
}

export async function getProduto(id: string): Promise<Produto | null> {
  const snap = await getDoc(doc(db, "produtos", id));
  if (!snap.exists()) return null;
  const produto = toProduto(snap.id, snap.data());
  return produto.ativo ? produto : null;
}

export async function getProdutosPorCategoria(
  categoriaId: string
): Promise<Produto[]> {
  const q = query(
    collection(db, "produtos"),
    where("categoriaId", "==", categoriaId),
    where("ativo", "==", true)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toProduto(d.id, d.data()));
}
