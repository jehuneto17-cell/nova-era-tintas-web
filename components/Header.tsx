"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CartIcon, Icon } from "./Icon";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { useBranding, useLoja } from "@/lib/hooks";

function initials(nome: string) {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Sticky app header. Search field animates its border + shadow on focus,
 * the clear button springs in once there's a query, and the cart badge
 * pops whenever the count changes.
 */
export function Header() {
  const router = useRouter();
  const { cartCount } = useStore();
  const { user, cliente, logout } = useAuth();
  const branding = useBranding();
  const loja = useLoja();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showClear = focused && query.length > 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/busca/resultados?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        height: 64,
        background: "#FFFFFF",
        borderBottom: "1px solid #E5E5E5",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        padding: "0 24px",
      }}
    >
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: "var(--font-archivo), sans-serif",
          fontWeight: 800,
          fontSize: 22,
          letterSpacing: "-0.01em",
          color: "#012418",
          flex: "none",
        }}
      >
        {branding?.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={branding.logo_url} alt={loja?.nome ?? "Logo"} style={{ height: 32, width: "auto", display: "block" }} />
        ) : null}
        {loja?.nome ?? "Nova Era Tintas"}
      </Link>

      <form onSubmit={submit} style={{ position: "relative", width: 300 }}>
        <Icon
          name="search"
          size={18}
          color="#00B20B"
          style={{ position: "absolute", left: 16, top: 13, pointerEvents: "none" }}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (blurTimer.current) clearTimeout(blurTimer.current);
            setFocused(true);
          }}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setFocused(false), 120);
          }}
          placeholder="Buscar produtos..."
          aria-label="Buscar produtos"
          style={{
            width: "100%",
            height: 44,
            boxSizing: "border-box",
            padding: "10px 40px 10px 44px",
            borderRadius: 24,
            border: `2px solid ${focused ? "#00B20B" : "#E5E5E5"}`,
            boxShadow: focused ? "0 2px 8px rgba(0,0,0,.1)" : "none",
            outline: "none",
            fontFamily: "var(--font-manrope), sans-serif",
            fontSize: 14,
            color: "#012418",
            background: "#FFFFFF",
            transition: "all 200ms var(--ease-out)",
          }}
        />
        <AnimatePresence>
          {showClear && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
              onClick={() => setQuery("")}
              aria-label="Limpar busca"
              style={{
                position: "absolute",
                right: 14,
                top: 12,
                width: 20,
                height: 20,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 0,
                display: "grid",
                placeItems: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" stroke="#999999" strokeWidth="2.5">
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: 20, flex: "none" }}>
        <Link href="/carrinho" style={{ position: "relative", width: 24, height: 24, display: "block" }} aria-label="Carrinho">
          <motion.span whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }} style={{ display: "block" }}>
            <CartIcon />
          </motion.span>
          <motion.span
            key={cartCount}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            style={{
              position: "absolute",
              top: -8,
              right: -10,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "#E63946",
              color: "#FFFFFF",
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 600,
              fontSize: 10,
              display: "grid",
              placeItems: "center",
            }}
          >
            {cartCount}
          </motion.span>
        </Link>

        {user ? (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Menu da conta"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid #E5E5E5",
                background: "#F5F5F5",
                color: "#012418",
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
                transition: "background 200ms var(--ease-out)",
              }}
            >
              {cliente?.nome ? initials(cliente.nome) : "?"}
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  {/* click-away layer */}
                  <div
                    onClick={() => setMenuOpen(false)}
                    style={{ position: "fixed", inset: 0, zIndex: 25 }}
                  />
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 42,
                      width: 180,
                      background: "#FFFFFF",
                      border: "1px solid #E5E5E5",
                      borderRadius: 12,
                      boxShadow: "0 4px 16px rgba(0,0,0,.1)",
                      padding: 6,
                      display: "flex",
                      flexDirection: "column",
                      zIndex: 30,
                    }}
                  >
                    <MenuItem href="/perfil" onNavigate={() => setMenuOpen(false)}>
                      Perfil
                    </MenuItem>
                    <MenuItem href="/pedidos" onNavigate={() => setMenuOpen(false)}>
                      Meus Pedidos
                    </MenuItem>
                    <MenuItem
                      href="/login"
                      onNavigate={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      danger
                    >
                      Sair
                    </MenuItem>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link
            href="/login"
            style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 600,
              fontSize: 14,
              color: "#012418",
            }}
          >
            Entrar
          </Link>
        )}
      </div>
    </header>
  );
}

function MenuItem({
  href,
  children,
  danger,
  onNavigate,
}: {
  href: string;
  children: React.ReactNode;
  danger?: boolean;
  onNavigate: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onNavigate}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "10px 12px",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        color: danger ? "#E63946" : "#012418",
        background: hover ? "#F5F5F5" : "transparent",
        transition: "background 200ms var(--ease-out)",
      }}
    >
      {children}
    </Link>
  );
}
