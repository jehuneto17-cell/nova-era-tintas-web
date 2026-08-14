import { collection, onSnapshot, orderBy, query, type Unsubscribe } from "firebase/firestore";
import { db } from "./firebase";
import type { Categoria } from "./types";

function toCategoria(id: string, data: Record<string, unknown>): Categoria {
  return {
    id,
    nome: (data.nome as string) ?? "",
    icone: (data.icone as string) ?? "package",
    fotoUrl: data.fotoUrl as string | undefined,
    fundo: (data.fundo as string) ?? "#00B20B",
    ordem: (data.ordem as number) ?? 0,
    ativa: (data.ativa as boolean) ?? false,
    qtdProdutos: (data.qtdProdutos as number) ?? 0,
  };
}

/** Assina todas as categorias, ordenadas por `ordem`. Filtre por `ativa` no consumidor conforme o contexto (Home vs. busca). */
export function subscribeCategorias(
  onChange: (categorias: Categoria[]) => void
): Unsubscribe {
  const q = query(collection(db, "categorias"), orderBy("ordem", "asc"));
  return onSnapshot(q, (snap) => {
    const categorias = snap.docs.map((d) => toCategoria(d.id, d.data()));
    onChange(categorias);
  });
}

/** Categorias visíveis na Home (ativa === true), já ordenadas por `ordem`. */
export function subscribeCategoriasAtivas(
  onChange: (categorias: Categoria[]) => void
): Unsubscribe {
  return subscribeCategorias((categorias) =>
    onChange(categorias.filter((c) => c.ativa))
  );
}
