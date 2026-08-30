"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Shell } from "@/components/Shell";
import { Modal } from "@/components/Modal";
import { Toast } from "@/components/AuthShell";
import { EASE_OUT, Spinner } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { atualizarCliente } from "@/lib/clientes";
import { uploadImage } from "@/lib/cloudinary";

const INITIAL_ADDR = {
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "MG",
};

/** Screen 14 — Editar Perfil. */
export default function EditarPerfilPage() {
  const router = useRouter();
  const { user, cliente, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ nome: "", telefone: "", email: "" });
  const [addr, setAddr] = useState(INITIAL_ADDR);
  const [telefoneTouched, setTelefoneTouched] = useState(false);
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // Seed the form once the real cliente doc arrives, via callback (não
  // sincronamente no corpo do efeito), seguindo o padrão recomendado pela
  // regra react-hooks/set-state-in-effect.
  useEffect(() => {
    if (!cliente || hydrated) return;
    Promise.resolve(cliente).then((c) => {
      setForm({ nome: c.nome, telefone: c.telefone, email: c.email });
      setFotoUrl(c.fotoUrl ?? null);
      const principal = c.enderecos.find((e) => e.principal) ?? c.enderecos[0];
      if (principal) {
        setAddr((a) => ({
          ...a,
          cep: principal.cep ?? "",
          rua: principal.rua ?? principal.texto,
          numero: principal.numero ?? "",
          complemento: principal.complemento ?? "",
          bairro: principal.bairro ?? "",
          cidade: principal.cidade ?? "",
          uf: principal.uf ?? "MG",
        }));
      }
      setHydrated(true);
    });
  }, [cliente, hydrated]);

  const setField = (k: keyof typeof form) => (v: string) => {
    setForm((s) => ({ ...s, [k]: v }));
    setDirty(true);
  };
  const setAddrField = (k: keyof typeof addr) => (v: string) => {
    setAddr((s) => ({ ...s, [k]: v }));
    setDirty(true);
    if (k === "cep") setCepStatus("idle");
  };

  const telDigits = form.telefone.replace(/\D/g, "");
  const showTelefoneError = telefoneTouched && telDigits.length > 0 && telDigits.length !== 11;

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploadingFoto(true);
    try {
      const { url } = await uploadImage(file);
      setFotoUrl(url);
      setDirty(true);
    } finally {
      setUploadingFoto(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function buscarCep() {
    const digits = addr.cep.replace(/\D/g, "");
    setCepStatus("loading");
    setTimeout(() => {
      if (digits.length !== 8) {
        setCepStatus("error");
        return;
      }
      setCepStatus("ok");
      setDirty(true);
      setAddr((a) => ({
        ...a,
        rua: "Rua Encontrada, s/n",
        bairro: "Centro",
        cidade: "Itaú de Minas",
        uf: "MG",
      }));
    }, 800);
  }

  async function save() {
    if (!user || !cliente || saving) return;
    setSaving(true);
    try {
      const rua = addr.rua.trim();
      const numero = addr.numero.trim();
      const complemento = addr.complemento.trim();
      const bairro = addr.bairro.trim();
      const cidade = addr.cidade.trim();
      const uf = addr.uf.trim();
      const cep = addr.cep.trim();
      const enderecoTexto = cep
        ? `${rua}, ${numero}${complemento ? ` - ${complemento}` : ""} - ${bairro}, ${cidade}/${uf} - CEP ${cep}`
        : [rua, numero, complemento].filter(Boolean).join(", ");
      const outros = cliente.enderecos.filter((e) => !e.principal);
      const principalId = cliente.enderecos.find((e) => e.principal)?.id ?? `end_${Date.now()}`;
      const enderecos = enderecoTexto
        ? [
            { id: principalId, rotulo: "Principal", texto: enderecoTexto, principal: true, cep, rua, numero, complemento, bairro, cidade, uf },
            ...outros,
          ]
        : cliente.enderecos;

      await atualizarCliente(user.uid, {
        nome: form.nome,
        telefone: form.telefone,
        fotoUrl: fotoUrl ?? undefined,
        enderecos,
      });
      setSaving(false);
      setDirty(false);
      setToast(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(false), 3000);
    } catch {
      setSaving(false);
    }
  }

  function cancel() {
    if (dirty) setShowDiscard(true);
    else router.push("/perfil");
  }

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  if (!authLoading && !user) {
    return null;
  }

  if (authLoading || !cliente) {
    return (
      <Shell>
        <div style={{ padding: "120px 0", textAlign: "center", fontFamily: "var(--font-manrope), sans-serif", color: "#999999" }}>
          Carregando perfil...
        </div>
      </Shell>
    );
  }

  const iniciais = form.nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Shell>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 700 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <BackButton onClick={cancel} />
            <h1
              style={{
                margin: 0,
                flex: 1,
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 28,
                color: "#012418",
              }}
            >
              Editar Perfil
            </h1>
          </div>

          {/* Avatar upload */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            style={{
              background: "#F8F8F8",
              border: "1px dashed #E5E5E5",
              borderRadius: 12,
              padding: 24,
              textAlign: "center",
              marginBottom: 32,
            }}
          >
            <motion.div
              key={preview ?? fotoUrl ?? "initials"}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              style={{
                width: 100,
                height: 100,
                margin: "0 auto 16px",
                borderRadius: "50%",
                border: "3px solid #2E9222",
                background: "#2E9222",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 800,
                fontSize: 36,
                color: "#FFFFFF",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {preview || fotoUrl ? (
                <Image src={(preview ?? fotoUrl) as string} alt="Foto de perfil" fill style={{ objectFit: "cover" }} unoptimized />
              ) : (
                iniciais || "?"
              )}
              {uploadingFoto && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(1,36,24,.45)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Spinner size={22} />
                </div>
              )}
            </motion.div>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png"
              onChange={onFileChange}
              style={{ display: "none" }}
            />
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <OutlineSmall onClick={() => fileInput.current?.click()}>Mudar Foto</OutlineSmall>
              {fotoUrl && (
                <RemovePhotoLink
                  onClick={() => {
                    setFotoUrl(null);
                    setPreview(null);
                    setDirty(true);
                  }}
                />
              )}
            </div>
            <div
              style={{
                marginTop: 8,
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 12,
                color: "#999999",
              }}
            >
              Máximo 5MB. Formatos: JPG ou PNG
            </div>
          </motion.div>

          {/* Personal */}
          <SectionCard title="Informações Pessoais">
            <div className="confirm-grid" style={{ marginBottom: 16 }}>
              <EditField label="Nome Completo" value={form.nome} onChange={setField("nome")} placeholder="João Silva" />
              <EditField label="Email" value={form.email} onChange={() => {}} readOnly hint="Email não pode ser alterado" />
            </div>
            <div className="confirm-grid">
              <EditField
                label="Telefone"
                value={form.telefone}
                onChange={(v) => {
                  setField("telefone")(v);
                  setTelefoneTouched(true);
                }}
                placeholder="(35) 98414-1300"
                error={showTelefoneError ? "Telefone deve ter 11 dígitos" : null}
              />
            </div>
          </SectionCard>

          {/* Address */}
          <SectionCard title="Endereço">
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 16, flexWrap: "wrap" }}>
              <div style={{ flex: "0 0 150px" }}>
                <EditField
                  label="CEP"
                  value={addr.cep}
                  onChange={setAddrField("cep")}
                  placeholder="37700-000"
                  borderOverride={cepStatus === "error" ? "#E63946" : undefined}
                />
              </div>
              <motion.button
                onClick={buscarCep}
                whileHover={{ boxShadow: "0 2px 8px rgba(46,146,34,.2)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                style={{
                  height: 44,
                  padding: "0 20px",
                  background: "#2E9222",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 8,
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {cepStatus === "loading" && <Spinner size={14} />}
                {cepStatus === "loading" ? "Buscando..." : "Buscar"}
              </motion.button>
            </div>
            <AnimatePresence>
              {cepStatus === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    margin: "-10px 0 16px",
                    fontFamily: "var(--font-manrope), sans-serif",
                    fontSize: 12,
                    color: "#E63946",
                  }}
                >
                  CEP não encontrado
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ marginBottom: 16 }}>
              <EditField label="Rua / Avenida" value={addr.rua} onChange={setAddrField("rua")} />
            </div>
            <div style={{ display: "flex", gap: 20, marginBottom: 16, flexWrap: "wrap" }}>
              <div style={{ flex: "0 0 120px" }}>
                <EditField label="Número" value={addr.numero} onChange={setAddrField("numero")} />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <EditField
                  label="Complemento"
                  value={addr.complemento}
                  onChange={setAddrField("complemento")}
                />
              </div>
            </div>
            <div className="address-grid">
              <EditField label="Bairro" value={addr.bairro} onChange={setAddrField("bairro")} />
              <EditField label="Cidade" value={addr.cidade} onChange={setAddrField("cidade")} />
              <SelectField label="UF" value={addr.uf} onChange={setAddrField("uf")} options={["MG", "SP", "RJ"]} />
            </div>
          </SectionCard>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              marginTop: 32,
              paddingTop: 24,
              borderTop: "1px solid #E5E5E5",
              flexWrap: "wrap",
            }}
          >
            <GhostButton onClick={cancel}>Cancelar</GhostButton>
            <motion.button
              onClick={save}
              whileHover={{ y: -1, boxShadow: "0 2px 8px rgba(46,146,34,.2)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              style={{
                height: 48,
                padding: "12px 24px",
                background: "#2E9222",
                color: "#FFFFFF",
                border: "none",
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 14,
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {saving && <Spinner size={14} />}
              <span>{saving ? "Salvando..." : "Salvar Alterações"}</span>
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDiscard && (
          <Modal onClose={() => setShowDiscard(false)} label="Descartar alterações">
            <p
              style={{
                margin: "0 0 24px",
                fontFamily: "var(--font-manrope), sans-serif",
                fontWeight: 600,
                fontSize: 15,
                color: "#012418",
                textAlign: "center",
              }}
            >
              Descartar alterações?
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <DialogButton variant="ghost" onClick={() => setShowDiscard(false)}>
                Continuar editando
              </DialogButton>
              <DialogButton
                variant="danger"
                onClick={() => {
                  setPreview(null);
                  setDirty(false);
                  setShowDiscard(false);
                  router.push("/perfil");
                }}
              >
                Descartar
              </DialogButton>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast tone="success" message="Perfil atualizado com sucesso!" />}
      </AnimatePresence>
    </Shell>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E5E5",
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-archivo), sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: "#012418",
          marginBottom: 20,
        }}
      >
        {title}
      </div>
      {children}
    </motion.div>
  );
}

const EditField = React.memo(({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  readOnly,
  hint,
  error,
  borderOverride,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  hint?: string;
  error?: string | null;
  borderOverride?: string;
}) => {
  const [focused, setFocused] = useState(false);
  const border = borderOverride ?? (error ? "#E63946" : focused ? "#2E9222" : "#E5E5E5");

  return (
    <div>
      <label
        style={{
          display: "block",
          fontFamily: "var(--font-manrope), sans-serif",
          fontWeight: 600,
          fontSize: 12,
          color: "#999999",
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        type={type}
        readOnly={readOnly}
        aria-label={label}
        style={{
          width: "100%",
          height: 44,
          boxSizing: "border-box",
          padding: "12px 16px",
          border: `2px solid ${border}`,
          borderRadius: 8,
          background: readOnly ? "#F5F5F5" : "#FFFFFF",
          fontFamily: "var(--font-manrope), sans-serif",
          fontSize: 14,
          color: readOnly ? "#666666" : "#012418",
          outline: "none",
          boxShadow: focused && !readOnly ? "0 0 0 3px rgba(46,146,34,.1)" : "none",
          transition: "all 200ms var(--ease-out)",
        }}
      />
      <motion.div
        initial={false}
        animate={{ opacity: error ? 1 : 0, height: error ? "auto" : 0 }}
        transition={{ duration: 0.2 }}
        style={{ overflow: "hidden" }}
      >
        {error && (
          <div
            style={{
              marginTop: 4,
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 12,
              color: "#E63946",
            }}
          >
            {error}
          </div>
        )}
      </motion.div>
      {!error && hint && (
        <div
          style={{
            marginTop: 4,
            fontFamily: "var(--font-manrope), sans-serif",
            fontSize: 11,
            color: "#999999",
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
});

const SelectField = React.memo(({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label
        style={{
          display: "block",
          fontFamily: "var(--font-manrope), sans-serif",
          fontWeight: 600,
          fontSize: 12,
          color: "#999999",
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label={label}
        style={{
          width: "100%",
          height: 44,
          boxSizing: "border-box",
          padding: "0 16px",
          border: `2px solid ${focused ? "#2E9222" : "#E5E5E5"}`,
          borderRadius: 8,
          fontFamily: "var(--font-manrope), sans-serif",
          fontSize: 14,
          color: "#012418",
          outline: "none",
          background: "#FFFFFF",
          cursor: "pointer",
          transition: "border-color 200ms var(--ease-out)",
        }}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
});

function BackButton({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label="Voltar"
      style={{
        width: 24,
        height: 24,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: hover ? "#2E9222" : "#012418",
        padding: 0,
        display: "grid",
        placeItems: "center",
        transition: "color 200ms var(--ease-out)",
      }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="15 5 8 12 15 19" />
      </svg>
    </button>
  );
}

function OutlineSmall({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      style={{
        height: 40,
        padding: "10px 20px",
        background: hover ? "#F3FBF4" : "#FFFFFF",
        border: "2px solid #2E9222",
        color: "#2E9222",
        fontFamily: "var(--font-manrope), sans-serif",
        fontWeight: 600,
        fontSize: 14,
        borderRadius: 8,
        cursor: "pointer",
        transition: "background 200ms var(--ease-out)",
      }}
    >
      {children}
    </motion.button>
  );
}

function RemovePhotoLink({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: 40,
        padding: "10px 4px",
        background: "transparent",
        border: "none",
        color: hover ? "#E63946" : "#999999",
        fontFamily: "var(--font-manrope), sans-serif",
        fontWeight: 600,
        fontSize: 14,
        cursor: "pointer",
        transition: "color 200ms var(--ease-out)",
      }}
    >
      Remover Foto
    </button>
  );
}

function GhostButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      style={{
        height: 48,
        padding: "12px 24px",
        background: hover ? "#F8F8F8" : "#FFFFFF",
        border: `2px solid ${hover ? "#999999" : "#E5E5E5"}`,
        color: "#012418",
        fontFamily: "var(--font-archivo), sans-serif",
        fontWeight: 700,
        fontSize: 14,
        borderRadius: 8,
        cursor: "pointer",
        transition: "all 200ms var(--ease-out)",
      }}
    >
      {children}
    </motion.button>
  );
}

function DialogButton({
  children,
  onClick,
  variant,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant: "ghost" | "danger";
}) {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15, ease: EASE_OUT }}
      style={{
        flex: 1,
        height: 44,
        background: variant === "danger" ? (hover ? "#CC2E36" : "#E63946") : "#FFFFFF",
        border: variant === "danger" ? "none" : `2px solid ${hover ? "#2E9222" : "#E5E5E5"}`,
        color: variant === "danger" ? "#FFFFFF" : "#012418",
        borderRadius: 8,
        fontFamily: "var(--font-archivo), sans-serif",
        fontWeight: 700,
        fontSize: 13,
        cursor: "pointer",
        transition: "all 200ms var(--ease-out)",
      }}
    >
      {children}
    </motion.button>
  );
}
