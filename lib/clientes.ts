import { deleteField, doc, getDoc, onSnapshot, setDoc, updateDoc, type Unsubscribe } from "firebase/firestore";
import { db } from "./firebase";
import type { Cliente, ClienteEndereco } from "./types";

function toCliente(id: string, data: Record<string, unknown>): Cliente {
  return {
    id,
    nome: (data.nome as string) ?? "",
    telefone: (data.telefone as string) ?? "",
    email: (data.email as string) ?? "",
    desde: (data.desde as string) ?? "",
    fotoUrl: data.fotoUrl as string | undefined,
    enderecos: (data.enderecos as ClienteEndereco[]) ?? [],
    historicoEnderecos: (data.historicoEnderecos as string[]) ?? [],
  };
}

/** O id do documento é o mesmo uid do Firebase Auth. */
export function subscribeCliente(
  uid: string,
  onChange: (cliente: Cliente | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, "clientes", uid), (snap) => {
    onChange(snap.exists() ? toCliente(snap.id, snap.data()) : null);
  });
}

export async function getCliente(uid: string): Promise<Cliente | null> {
  const snap = await getDoc(doc(db, "clientes", uid));
  return snap.exists() ? toCliente(snap.id, snap.data()) : null;
}

/** Cria o documento de cliente no cadastro, usando o uid do Auth como id do documento. */
export async function criarCliente(
  uid: string,
  dados: Pick<Cliente, "nome" | "telefone" | "email">
): Promise<void> {
  await setDoc(doc(db, "clientes", uid), {
    ...dados,
    desde: new Date().toISOString(),
    enderecos: [],
    historicoEnderecos: [],
  } satisfies Omit<Cliente, "id">);
}

export async function atualizarCliente(
  uid: string,
  dados: Partial<Omit<Cliente, "id">>
): Promise<void> {
  const { fotoUrl, ...resto } = dados;
  await updateDoc(doc(db, "clientes", uid), {
    ...resto,
    ...(("fotoUrl" in dados) ? { fotoUrl: fotoUrl === undefined ? deleteField() : fotoUrl } : {}),
  });
}
