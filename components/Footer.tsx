"use client";

import { useState } from "react";
import { useBranding, useLoja } from "@/lib/hooks";

const COLUMNS = [
  { title: "Empresa", links: ["Sobre Nós", "Contato", "Trabalhe Conosco"] },
  { title: "Ajuda", links: ["FAQ", "Envio", "Trocas e Devoluções"] },
  { title: "Legal", links: ["Termos de Serviço", "Política de Privacidade"] },
];

function socialItems(redes: { instagram: string; facebook: string; tiktok: string } | undefined) {
  const items: { label: string; href: string; paths: React.ReactNode }[] = [];
  if (redes?.instagram) {
    items.push({
      label: "Instagram",
      href: redes.instagram,
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
      label: "Facebook",
      href: redes.facebook,
      paths: <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V9a1 1 0 0 1 1-1z" />,
    });
  }
  if (redes?.tiktok) {
    items.push({
      label: "TikTok",
      href: redes.tiktok,
      paths: (
        <path d="M14 3v10.5a2.5 2.5 0 1 1-2.5-2.5M14 3a5 5 0 0 0 5 5" />
      ),
    });
  }
  return items;
}

export function Footer() {
  const branding = useBranding();
  const loja = useLoja();
  const social = socialItems(branding?.redes_sociais);
  const nome = loja?.nome ?? "Nova Era Tintas";

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
              <FooterLink key={l}>{l}</FooterLink>
            ))}
          </div>
        ))}
        {social.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: "#FFFFFF",
              }}
            >
              Siga-nos
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {social.map((s) => (
                <SocialLink key={s.label} label={s.label} href={s.href}>
                  {s.paths}
                </SocialLink>
              ))}
            </div>
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
      </div>
    </footer>
  );
}

function FooterLink({ children }: { children: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href="#"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontSize: 13,
        color: hover ? "#FFFFFF" : "rgba(255,255,255,.7)",
        transition: "color 200ms var(--ease-out)",
      }}
    >
      {children}
    </a>
  );
}

function SocialLink({ label, href, children }: { label: string; href: string; children: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 20,
        height: 20,
        display: "grid",
        placeItems: "center",
        transform: hover ? "scale(1.15)" : "scale(1)",
        opacity: hover ? 1 : 0.85,
        transition: "all 200ms var(--ease-out)",
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8">
        {children}
      </svg>
    </a>
  );
}
