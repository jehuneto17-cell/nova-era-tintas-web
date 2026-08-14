"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Icon, type IconName } from "./Icon";

const NAV: { label: string; icon: IconName; href: string }[] = [
  { label: "Produtos", icon: "grid", href: "/produtos" },
  { label: "Categorias", icon: "boxes", href: "/categorias" },
  { label: "Meus Pedidos", icon: "package", href: "/pedidos" },
  { label: "Perfil", icon: "user", href: "/perfil" },
  { label: "Configurações", icon: "gear", href: "/perfil/editar" },
  { label: "Logout", icon: "logout", href: "/login" },
];

/**
 * Sticky left rail. The active item is filled green; inactive items lift to a
 * light tint on hover. Active state is derived from the route, so navigating
 * moves the highlight.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 220,
        flex: "none",
        background: "#F8F8F8",
        borderRight: "1px solid #E5E5E5",
        position: "sticky",
        top: 64,
        height: "calc(100vh - 64px)",
        padding: "20px 12px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        overflow: "auto",
      }}
      className="hidden md:flex"
    >
      {NAV.map((item) => {
        const active =
          item.href === "/produtos"
            ? pathname === "/" || pathname.startsWith("/produto")
            : pathname.startsWith(item.href);
        return <NavItem key={item.label} item={item} active={active} />;
      })}
    </aside>
  );
}

function NavItem({
  item,
  active,
}: {
  item: { label: string; icon: IconName; href: string };
  active: boolean;
}) {
  return (
    <motion.div whileHover={{ x: active ? 0 : 2 }} transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          borderRadius: 8,
          cursor: "pointer",
          background: active ? "#00B20B" : "transparent",
          color: active ? "#FFFFFF" : "#999999",
          fontFamily: "var(--font-manrope), sans-serif",
          fontSize: 14,
          fontWeight: active ? 700 : 600,
          transition: "all 200ms var(--ease-out)",
        }}
        className={active ? "" : "nav-item-idle"}
      >
        <Icon name={item.icon} size={20} color={active ? "#FFFFFF" : "#999999"} />
        <span>{item.label}</span>
      </Link>
    </motion.div>
  );
}
