"use client";

import { InstitutionalPage, Section } from "@/components/InstitutionalPage";
import { useBranding, useWhatsapp } from "@/lib/hooks";

export default function TrabalheConoscoPage() {
  const branding = useBranding();
  const whatsapp = useWhatsapp();

  const emailHref = branding?.email
    ? `mailto:${branding.email}?subject=${encodeURIComponent("Trabalhe Conosco")}`
    : undefined;
  const waHref = whatsapp?.numero
    ? `https://wa.me/${whatsapp.numero.replace(/\D/g, "")}?text=${encodeURIComponent(
        "Olá! Tenho interesse em trabalhar na Nova Era Tintas e gostaria de enviar meu currículo.",
      )}`
    : undefined;

  return (
    <InstitutionalPage
      title="Trabalhe Conosco"
      breadcrumbLabel="Trabalhe Conosco"
      subtitle="Quer fazer parte do nosso time? Envie seu currículo pelos canais abaixo."
    >
      <Section title="Como se candidatar">
        <p style={{ margin: 0 }}>
          No momento não temos vagas abertas divulgadas no site, mas você pode enviar seu currículo e
          área de interesse — assim que surgir uma oportunidade compatível, entramos em contato.
        </p>
      </Section>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {emailHref && (
          <a
            href={emailHref}
            style={{
              flex: "1 1 200px",
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#2E9222",
              color: "#FFFFFF",
              borderRadius: 8,
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Enviar currículo por e-mail
          </a>
        )}
        {waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            style={{
              flex: "1 1 200px",
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#FFFFFF",
              border: "1px solid #E5E5E5",
              color: "#012418",
              borderRadius: 8,
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Falar pelo WhatsApp
          </a>
        )}
        {!emailHref && !waHref && (
          <p style={{ margin: 0, fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#999999" }}>
            Nenhum canal de contato cadastrado no momento.
          </p>
        )}
      </div>
    </InstitutionalPage>
  );
}
