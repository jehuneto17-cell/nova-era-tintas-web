"use client";

import { useState } from "react";
import { InstitutionalPage } from "@/components/InstitutionalPage";
import { EASE_OUT } from "@/components/ui";
import { useBranding, useLoja, useWhatsapp } from "@/lib/hooks";
import { motion } from "framer-motion";

const INSTAGRAM_URL = "https://www.instagram.com/novaeratintas";
const FACEBOOK_URL = "https://www.facebook.com/nova.era.336717";

function waNumero(numero: string) {
  const digits = numero.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export default function ContatoPage() {
  const branding = useBranding();
  const loja = useLoja();
  const whatsapp = useWhatsapp();
  const [nome, setNome] = useState("");
  const [mensagem, setMensagem] = useState("");

  const podeEnviar = nome.trim().length > 0 && mensagem.trim().length > 0 && Boolean(whatsapp?.numero);

  const waHref = whatsapp?.numero
    ? `https://wa.me/${waNumero(whatsapp.numero)}?text=${encodeURIComponent(
        `Olá, meu nome é ${nome || "___"}.\n\n${mensagem || "___"}`,
      )}`
    : undefined;

  return (
    <InstitutionalPage
      title="Contato"
      breadcrumbLabel="Contato"
      subtitle="Fale com a nossa equipe — respondemos por e-mail ou WhatsApp."
    >
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E5E5E5",
          borderRadius: 12,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: "var(--font-archivo), sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: "#012418",
          }}
        >
          Nossos canais
        </h2>
        {branding?.email && (
          <ContatoLinha label="E-mail">
            <a href={`mailto:${branding.email}`} style={{ color: "#0088B7" }}>
              {branding.email}
            </a>
          </ContatoLinha>
        )}
        {branding?.whatsapp && (
          <ContatoLinha label="WhatsApp">
            <a
              href={`https://wa.me/${waNumero(branding.whatsapp)}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#0088B7" }}
            >
              {branding.whatsapp}
            </a>
          </ContatoLinha>
        )}
        {branding?.redes_sociais?.instagram && (
          <ContatoLinha label="Instagram">
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" style={{ color: "#0088B7" }}>
              {branding.redes_sociais.instagram}
            </a>
          </ContatoLinha>
        )}
        {branding?.redes_sociais?.facebook && (
          <ContatoLinha label="Facebook">
            <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" style={{ color: "#0088B7" }}>
              {branding.redes_sociais.facebook}
            </a>
          </ContatoLinha>
        )}
        {loja?.endereco && <ContatoLinha label="Endereço">{loja.endereco}</ContatoLinha>}
        {loja?.horarios && <ContatoLinha label="Horário">{loja.horarios}</ContatoLinha>}
        {!branding?.email && !branding?.whatsapp && (
          <p style={{ margin: 0, fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#999999" }}>
            Nenhum canal de contato cadastrado no momento.
          </p>
        )}
      </div>

      {whatsapp?.numero && (
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E5E5",
            borderRadius: 12,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: "#012418",
            }}
          >
            Enviar mensagem pelo WhatsApp
          </h2>
          <Field label="Seu nome">
            <Input value={nome} onChange={setNome} placeholder="Como podemos te chamar?" />
          </Field>
          <Field label="Mensagem">
            <TextArea value={mensagem} onChange={setMensagem} placeholder="Como podemos ajudar?" />
          </Field>
          <motion.a
            href={podeEnviar ? waHref : undefined}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!podeEnviar}
            whileHover={podeEnviar ? { y: -1 } : undefined}
            whileTap={podeEnviar ? { scale: 0.98 } : undefined}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            style={{
              height: 48,
              background: podeEnviar ? "#00B20B" : "#BFBFBF",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 8,
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 700,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              cursor: podeEnviar ? "pointer" : "not-allowed",
              pointerEvents: podeEnviar ? "auto" : "none",
              opacity: podeEnviar ? 1 : 0.6,
            }}
          >
            Enviar pelo WhatsApp
          </motion.a>
        </div>
      )}
    </InstitutionalPage>
  );
}

function ContatoLinha({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 8, fontFamily: "var(--font-manrope), sans-serif", fontSize: 13 }}>
      <span style={{ color: "#999999", minWidth: 80 }}>{label}</span>
      <span style={{ color: "#012418" }}>{children}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span
        style={{
          fontFamily: "var(--font-archivo), sans-serif",
          fontWeight: 700,
          fontSize: 13,
          color: "#012418",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      aria-label={placeholder}
      style={{
        width: "100%",
        height: 44,
        boxSizing: "border-box",
        padding: "12px 16px",
        border: `2px solid ${focused ? "#00B20B" : "#E5E5E5"}`,
        borderRadius: 8,
        fontFamily: "var(--font-manrope), sans-serif",
        fontSize: 14,
        color: "#012418",
        outline: "none",
        background: "#FFFFFF",
        transition: "all 200ms var(--ease-out)",
      }}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      aria-label={placeholder}
      style={{
        width: "100%",
        height: 120,
        boxSizing: "border-box",
        padding: "12px 16px",
        border: `2px solid ${focused ? "#00B20B" : "#E5E5E5"}`,
        borderRadius: 8,
        fontFamily: "var(--font-manrope), sans-serif",
        fontSize: 14,
        lineHeight: 1.5,
        color: "#012418",
        resize: "none",
        outline: "none",
        background: "#FFFFFF",
        transition: "all 200ms var(--ease-out)",
      }}
    />
  );
}
