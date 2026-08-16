"use client";

import { useState } from "react";
import Link from "next/link";
import { useBranding, useLoja } from "@/lib/hooks";

const COLUMNS = [
  {
    title: "Empresa",
    links: [
      { label: "Sobre Nós", href: "/sobre" },
      { label: "Contato", href: "/contato" },
      { label: "Trabalhe Conosco", href: "/trabalhe-conosco" },
    ],
  },
  {
    title: "Ajuda",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Envio", href: "/envio" },
      { label: "Trocas e Devoluções", href: "/trocas-devolucoes" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos de Serviço", href: "/termos" },
      { label: "Política de Privacidade", href: "/privacidade" },
    ],
  },
];

const INSTAGRAM_URL = "https://www.instagram.com/novaeratintas";
const FACEBOOK_URL = "https://www.facebook.com/nova.era.336717";

function waNumero(numero: string) {
  const digits = numero.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : `55${digits}`;
}

const WHATSAPP_ICON = (
  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l5.07-1.33A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.2 14.15c-.22.6-1.29 1.16-1.78 1.2-.46.05-.95.09-3.05-.63-2.56-1-4.2-3.6-4.33-3.77-.13-.17-1.03-1.36-1.03-2.6 0-1.23.65-1.84.88-2.1.23-.24.5-.3.66-.3h.48c.15 0 .36-.06.56.43.22.53.74 1.83.8 1.96.06.13.1.29.02.46-.08.17-.13.28-.25.43-.13.15-.27.34-.38.46-.13.13-.26.27-.11.53.15.27.66 1.1 1.43 1.78 1 .87 1.83 1.15 2.1 1.28.27.13.42.11.58-.07.15-.18.65-.76.83-1.02.18-.27.35-.22.6-.13.24.09 1.55.73 1.82.87.27.13.44.2.5.31.07.13.07.72-.15 1.31z" />
);

function socialItems(redes: { instagram: string; facebook: string } | undefined) {
  const items: { label: string; href: string; paths: React.ReactNode; filled?: boolean }[] = [];
  if (redes?.instagram) {
    items.push({
      label: redes.instagram,
      href: INSTAGRAM_URL,
      paths: (
        <>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" />
        </>
      ),
    });
  }
  if (redes?.facebook) {
    items.push({
      label: redes.facebook,
      href: FACEBOOK_URL,
      paths: <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V9a1 1 0 0 1 1-1z" />,
    });
  }
  return items;
}

export function Footer() {
  const branding = useBranding();
  const loja = useLoja();
  const social = socialItems(branding?.redes_sociais);
  const nome = loja?.nome ?? "Nova Era Tintas";
  const email = branding?.email;
  const whatsappLoja = branding?.whatsapp;

  return (
    <footer style={{ background: "#1A4D2E", color: "#FFFFFF", padding: "40px 24px", marginTop: 60 }}>
      <div className="footer-grid" style={{ display: "grid", gap: 24 }}>
        {COLUMNS.map((col) => (
          <div key={col.title} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: "#FFFFFF",
              }}
            >
              {col.title}
            </div>
            {col.links.map((l) => (
              <FooterLink key={l.label} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </div>
        ))}
        {(email || whatsappLoja || social.length > 0) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: "#FFFFFF",
              }}
            >
              Contato
            </div>
            {email && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <a href={`mailto:${email}`} style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>
                  {email}
                </a>
              </div>
            )}
            {(whatsappLoja || social.length > 0) && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {whatsappLoja && (
                  <SocialLink label={whatsappLoja} href={`https://wa.me/${waNumero(whatsappLoja)}`} filled>
                    {WHATSAPP_ICON}
                  </SocialLink>
                )}
                {social.map((s) => (
                  <SocialLink key={s.label} label={s.label} href={s.href}>
                    {s.paths}
                  </SocialLink>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div
        style={{
          marginTop: 20,
          paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,.2)",
          textAlign: "center",
          fontFamily: "var(--font-manrope), sans-serif",
          fontSize: 11,
          color: "rgba(255,255,255,.5)",
        }}
      >
        © 2026 {nome}. Todos os direitos reservados.
        <br />
        <a
          href="https://www.instagram.com/jehu_dev_e.commerce/"
          target="_blank"
          rel="noreferrer"
          style={{ color: "inherit", textDecoration: "none" }}
        >
          desenvolvido por @JEHU_DEV_E.COMMERCE
        </a>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontSize: 13,
        color: hover ? "#FFFFFF" : "rgba(255,255,255,.7)",
        transition: "color 200ms var(--ease-out)",
      }}
    >
      {children}
    </Link>
  );
}

function SocialLink({
  label,
  href,
  children,
  filled,
}: {
  label: string;
  href: string;
  children: React.ReactNode;
  filled?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        color: hover ? "#FFFFFF" : "rgba(255,255,255,.7)",
        transition: "color 200ms var(--ease-out)",
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke={filled ? "none" : "currentColor"}
        strokeWidth="1.8"
        style={{ flexShrink: 0 }}
      >
        {children}
      </svg>
      {label}
    </a>
  );
}
