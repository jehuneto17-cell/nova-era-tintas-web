import { doc, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { db } from "./firebase";
import type {
  BrandingConfig,
  BuscasConfig,
  FreteConfig,
  LojaConfig,
  PagamentoConfig,
  WhatsappConfig,
} from "./types";

function subscribeDoc<T>(
  id: string,
  onChange: (data: T | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, "configuracoes", id), (snap) => {
    onChange(snap.exists() ? (snap.data() as T) : null);
  });
}

export function subscribeBranding(
  onChange: (config: BrandingConfig | null) => void
): Unsubscribe {
  return subscribeDoc<BrandingConfig>("branding", onChange);
}

export function subscribePagamento(
  onChange: (config: PagamentoConfig | null) => void
): Unsubscribe {
  return subscribeDoc<PagamentoConfig>("pagamento", onChange);
}

export function subscribeWhatsapp(
  onChange: (config: WhatsappConfig | null) => void
): Unsubscribe {
  return subscribeDoc<WhatsappConfig>("whatsapp", onChange);
}

export function subscribeFrete(
  onChange: (config: FreteConfig | null) => void
): Unsubscribe {
  return subscribeDoc<FreteConfig>("frete", onChange);
}

export function subscribeBuscas(
  onChange: (config: BuscasConfig | null) => void
): Unsubscribe {
  return subscribeDoc<BuscasConfig>("buscas", onChange);
}

export function subscribeLoja(
  onChange: (config: LojaConfig | null) => void
): Unsubscribe {
  return subscribeDoc<LojaConfig>("loja", onChange);
}
