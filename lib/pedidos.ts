import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Pedido, PedidoEstado, PedidoItem } from "./types";

function toPedido(id: string, data: Record<string, unknown>): Pedido {
  return {
    id,
    numero: (data.numero as string) ?? "",
    clienteId: (data.clienteId as string) ?? "",
    cliente: (data.cliente as string) ?? "",
    telefone: (data.telefone as string) ?? "",
    estado: (data.estado as PedidoEstado) ?? "em_negociacao",
    criadoEm: (data.criadoEm as string) ?? "",
    itens: (data.itens as PedidoItem[]) ?? [],
    frete: (data.frete as number) ?? 0,
    endereco: (data.endereco as string) ?? "",
    enderecoMudou: (data.enderecoMudou as boolean) ?? false,
    historico: (data.historico as Pedido["historico"]) ?? [],
    comprovanteUrl: data.comprovanteUrl as string | undefined,
    comprovanteEnviadoEm: data.comprovanteEnviadoEm as string | undefined,
    valorComprovante: data.valorComprovante as number | undefined,
    ultimaRecusa: data.ultimaRecusa as Pedido["ultimaRecusa"],
  };
}

/** Assina os pedidos de um cliente, mais recentes primeiro. */
export function subscribePedidosDoCliente(
  clienteId: string,
  onChange: (pedidos: Pedido[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "pedidos"),
    where("clienteId", "==", clienteId),
    orderBy("criadoEm", "desc")
  );
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => toPedido(d.id, d.data())));
  });
}

export function subscribePedido(
  pedidoId: string,
  onChange: (pedido: Pedido | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, "pedidos", pedidoId), (snap) => {
    onChange(snap.exists() ? toPedido(snap.id, snap.data()) : null);
  });
}

export interface NovoPedidoInput {
  numero: string;
  clienteId: string;
  cliente: string;
  telefone: string;
  itens: PedidoItem[];
  frete: number;
  endereco: string;
  enderecoMudou: boolean;
}

/** Cria um pedido novo com estado inicial "em_negociacao", como o app do cliente deve fazer. */
export async function criarPedido(input: NovoPedidoInput): Promise<string> {
  const agora = new Date().toISOString();
  const docRef = await addDoc(collection(db, "pedidos"), {
    ...input,
    estado: "em_negociacao" satisfies PedidoEstado,
    criadoEm: agora,
    historico: [
      {
        estado: "em_negociacao",
        quando: agora,
        quem: input.cliente,
      },
    ],
  });
  return docRef.id;
}

/** Avança o pedido para "aguardando_confirmacao" ao anexar o comprovante PIX enviado pelo cliente. */
export async function enviarComprovante(
  pedidoId: string,
  comprovanteUrl: string,
  valorComprovante: number,
  quem: string
): Promise<void> {
  const agora = new Date().toISOString();
  await updateDoc(doc(db, "pedidos", pedidoId), {
    estado: "aguardando_confirmacao" satisfies PedidoEstado,
    comprovanteUrl,
    comprovanteEnviadoEm: agora,
    valorComprovante,
    historico: arrayUnion({
      estado: "aguardando_confirmacao",
      quando: agora,
      quem,
      observacao: "Comprovante enviado",
    }),
  });
}

/** Cancela um pedido em negociação, a pedido do cliente. */
export async function cancelarPedido(pedidoId: string, quem: string): Promise<void> {
  const agora = new Date().toISOString();
  await updateDoc(doc(db, "pedidos", pedidoId), {
    estado: "cancelado" satisfies PedidoEstado,
    historico: arrayUnion({
      estado: "cancelado",
      quando: agora,
      quem,
      observacao: "Cancelado pelo cliente",
    }),
  });
}
