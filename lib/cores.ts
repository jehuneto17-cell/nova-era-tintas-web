import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "./firebase";
import type { CorTinta, PaletaTodasCores } from "./types";

/** Nome do grupo usado para paletas sem `familia` (ex: Coral). */
const FAMILIA_SEM_GRUPO = "Cores";

/** Mesma ordem visual usada no painel admin (cores/page.tsx) — o Firestore não guarda essa ordem. */
const ORDEM_FAMILIAS = [
  "Vermelhos",
  "Laranjas",
  "Amarelos",
  "Verdes",
  "Cianos",
  "Azuis",
  "Violetas",
  "Rosas/Magentas",
  "Neutros",
];

function ordemFamilia(familia: string): number {
  const i = ORDEM_FAMILIAS.indexOf(familia);
  return i === -1 ? ORDEM_FAMILIAS.length : i;
}

/**
 * Paleta global de cores da loja, usada por produtos com `todasCores: true`.
 * `paleta` decide a coleção: "suvinil" (padrão, `cores`, com família) ou "coral" (`cores_coral`, sem família).
 */
export async function getPaletaCores(paleta: PaletaTodasCores = "suvinil"): Promise<CorTinta[]> {
  if (paleta === "coral") {
    // Sem índice composto dedicado: filtra/ordena em memória (coleção pequena, ~27 cores).
    const snap = await getDocs(collection(db, "cores_coral"));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as CorTinta)
      .filter((c) => c.ativa)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  const q = query(
    collection(db, "cores"),
    where("ativa", "==", true),
    orderBy("familia", "asc"),
    orderBy("nome", "asc")
  );
  const snap = await getDocs(q);
  const cores = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CorTinta);
  return cores.sort((a, b) => ordemFamilia(a.familia ?? "") - ordemFamilia(b.familia ?? ""));
}

/** Agrupa a paleta por família, na mesma ordem visual do admin. Cores sem família (ex: Coral) caem em um grupo único. */
export function agruparPorFamilia(cores: CorTinta[]): { familia: string; cores: CorTinta[] }[] {
  const grupos = new Map<string, CorTinta[]>();
  cores.forEach((c) => {
    const familia = c.familia ?? FAMILIA_SEM_GRUPO;
    const lista = grupos.get(familia) ?? [];
    lista.push(c);
    grupos.set(familia, lista);
  });
  return Array.from(grupos.entries())
    .map(([familia, cores]) => ({ familia, cores }))
    .sort((a, b) => ordemFamilia(a.familia) - ordemFamilia(b.familia));
}

export const CHAVE_TODAS_CORES = "__todas__";
