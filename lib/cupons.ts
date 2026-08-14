import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import type { Cupom } from "./types";

function toCupom(id: string, data: Record<string, unknown>): Cupom {
  return {
    id,
    codigo: (data.codigo as string) ?? "",
    tipo: (data.tipo as Cupom["tipo"]) ?? "%",
    valor: (data.valor as number) ?? 0,
    inicio: (data.inicio as string) ?? "",
    fim: (data.fim as string) ?? "",
    limite: (data.limite as number | null) ?? null,
    usos: (data.usos as number) ?? 0,
    ativo: (data.ativo as boolean) ?? false,
  };
}

export function cupomValido(
  cupom: Cupom,
  hoje: string = new Date().toISOString().slice(0, 10)
): boolean {
  if (!cupom.ativo) return false;
  if (hoje < cupom.inicio || hoje > cupom.fim) return false;
  if (cupom.limite !== null && cupom.usos >= cupom.limite) return false;
  return true;
}

/** Busca um cupom pelo código exato e retorna se for válido hoje; null se não existir ou estiver inválido/expirado. */
export async function buscarCupomValido(codigo: string): Promise<Cupom | null> {
  const q = query(collection(db, "cupons"), where("codigo", "==", codigo));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const cupom = toCupom(snap.docs[0].id, snap.docs[0].data());
  return cupomValido(cupom) ? cupom : null;
}
