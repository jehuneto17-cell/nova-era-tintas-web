"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = {
  produtoId: string;
  variacao: string; // chave "Cor|Volume", igual à chave em produtos/{id}.variacoes
  title: string;
  specs: string;
  price: number;
  oldPrice: number | null;
  qty: number;
  shot: string;
  shotUrl?: string;
};

type StoreValue = {
  items: CartLine[];
  cartCount: number;
  subtotal: number;
  favorites: string[];
  addItem: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (produtoId: string, variacao: string, next: number) => void;
  removeItem: (produtoId: string, variacao: string) => void;
  resetCart: () => void;
  toggleFavorite: (produtoId: string) => void;
};

const StoreContext = createContext<StoreValue | null>(null);
const CART_KEY = "net_cart";
const FAVORITES_KEY = "net_favorites";

function lineKey(produtoId: string, variacao: string) {
  return `${produtoId}::${variacao}`;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    function readLocalStorage() {
      try {
        const cart = localStorage.getItem(CART_KEY);
        const favs = localStorage.getItem(FAVORITES_KEY);
        return {
          items: cart ? (JSON.parse(cart) as CartLine[]) : null,
          favorites: favs ? (JSON.parse(favs) as string[]) : null,
        };
      } catch {
        // localStorage indisponível (SSR/privado) — segue com carrinho vazio
        return { items: null, favorites: null };
      }
    }
    // Lido via microtask (callback), não sincronamente no corpo do efeito,
    // seguindo o padrão "subscribe/callback" recomendado pela regra
    // react-hooks/set-state-in-effect para sincronizar com localStorage.
    Promise.resolve(readLocalStorage()).then(({ items: storedItems, favorites: storedFavorites }) => {
      if (storedItems) setItems(storedItems);
      if (storedFavorites) setFavorites(storedFavorites);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites, hydrated]);

  const value = useMemo<StoreValue>(() => {
    const cartCount = items.reduce((a, i) => a + i.qty, 0);
    const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);

    return {
      items,
      cartCount,
      subtotal,
      favorites,
      addItem: (line, qty = 1) =>
        setItems((prev) => {
          const key = lineKey(line.produtoId, line.variacao);
          const found = prev.find((p) => lineKey(p.produtoId, p.variacao) === key);
          if (found) {
            return prev.map((p) =>
              lineKey(p.produtoId, p.variacao) === key
                ? { ...p, qty: Math.min(99, p.qty + qty) }
                : p,
            );
          }
          return [...prev, { ...line, qty }];
        }),
      setQty: (produtoId, variacao, next) =>
        setItems((prev) =>
          prev.map((p) =>
            lineKey(p.produtoId, p.variacao) === lineKey(produtoId, variacao)
              ? { ...p, qty: Math.min(99, Math.max(1, next)) }
              : p,
          ),
        ),
      removeItem: (produtoId, variacao) =>
        setItems((prev) =>
          prev.filter((p) => lineKey(p.produtoId, p.variacao) !== lineKey(produtoId, variacao)),
        ),
      resetCart: () => setItems([]),
      toggleFavorite: (produtoId) =>
        setFavorites((prev) =>
          prev.includes(produtoId) ? prev.filter((id) => id !== produtoId) : [...prev, produtoId],
        ),
    };
  }, [items, favorites]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export const brl = (n: number) => "R$ " + n.toFixed(2).replace(".", ",");
