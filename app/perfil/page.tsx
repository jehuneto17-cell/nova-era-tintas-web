"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Shell } from "@/components/Shell";
import { Modal } from "@/components/Modal";
import { Icon } from "@/components/Icon";
import { EASE_OUT, PrimaryButton } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { atualizarCliente } from "@/lib/clientes";
import type { ClienteEndereco } from "@/lib/types";

/** Screen 13 — Perfil. */
export default function PerfilPage() {
  const router = useRouter();
  const { user, cliente, loading: authLoading, logout } = useAuth();

  const [toggles, setToggles] = useState({ pedidos: true, ofertas: true, newsletter: false });
  const [showLogout, setShowLogout] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({ rotulo: "", texto: "" });
  const [savingAddress, setSavingAddress] = useState(false);

  async function saveNewAddress() {
    if (!newAddress.texto.trim() || !user || !cliente || savingAddress) return;
    setSavingAddress(true);
    const entry: ClienteEndereco = {
      id: `end_${Date.now()}`,
      rotulo: newAddress.rotulo.trim() || "Endereço",
      texto: newAddress.texto.trim(),
      principal: cliente.enderecos.length === 0,
    };
    try {
      await atualizarCliente(user.uid, { enderecos: [...cliente.enderecos, entry] });
      setShowAddressModal(false);
      setNewAddress({ rotulo: "", texto: "" });
    } finally {
      setSavingAddress(false);
    }
  }

  async function makeMain(id: string) {
    if (!user || !cliente) return;
    const enderecos = cliente.enderecos.map((e) => ({ ...e, principal: e.id === id }));
    await atualizarCliente(user.uid, { enderecos });
  }

  async function removeAddress(id: string) {
    if (!user || !cliente) return;
    const enderecos = cliente.enderecos.filter((e) => e.id !== id);
    await atualizarCliente(user.uid, { enderecos });
  }

  if (!authLoading && !user) {
    return (
      <Shell>
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E5E5",
            borderRadius: 12,
            padding: "64px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 20, color: "#012418", marginBottom: 8 }}>
            Entre para ver seu perfil
          </div>
          <div style={{ maxWidth: 240, margin: "0 auto" }}>
            <PrimaryButton height={44} onClick={() => router.push("/login")}>
              Entrar
            </PrimaryButton>
          </div>
        </div>
      </Shell>
    );
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

  const principal = cliente.enderecos.find((e) => e.principal) ?? cliente.enderecos[0] ?? null;
  const outrosEnderecos = cliente.enderecos.filter((e) => e.id !== principal?.id);
  const iniciais = cliente.nome
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
        <div style={{ width: "100%", maxWidth: 900 }}>
          {/* Avatar card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            style={{
              background: "#F8F8F8",
              border: "1px solid #E5E5E5",
              borderRadius: 12,
              padding: 32,
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 16px" }}>
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  border: "4px solid #2E9222",
                  background: "#2E9222",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 800,
                  fontSize: 48,
                  color: "#FFFFFF",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {cliente.fotoUrl ? (
                  <Image src={cliente.fotoUrl} alt="Foto de perfil" fill style={{ objectFit: "cover" }} unoptimized />
                ) : (
                  iniciais || "?"
                )}
              </div>
            </div>
            <h1
              style={{
                margin: "0 0 8px",
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 28,
                color: "#012418",
              }}
            >
              {cliente.nome}
            </h1>
            <p
              style={{
                margin: "0 0 24px",
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 14,
                color: "#999999",
              }}
            >
              {cliente.email}
            </p>
            <OutlineButton onClick={() => router.push("/perfil/editar")}>Editar Perfil</OutlineButton>
          </motion.div>

          {/* Personal info */}
          <Card>
            <CardHeader title="Informações Pessoais" action={null} />
            <div className="confirm-grid" style={{ gap: "20px 24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <FieldCaption>Nome Completo</FieldCaption>
                <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 14, color: "#012418" }}>
                  {cliente.nome}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <FieldCaption>Email</FieldCaption>
                <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 14, color: "#012418" }}>
                  {cliente.email}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <FieldCaption>Telefone</FieldCaption>
                <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 14, color: "#012418" }}>
                  {cliente.telefone || "—"}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <FieldCaption>Cliente desde</FieldCaption>
                <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 14, color: "#012418" }}>
                  {cliente.desde ? new Date(cliente.desde).toLocaleDateString("pt-BR") : "—"}
                </span>
              </div>
            </div>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader title="Endereço Principal" action={null} />
            {principal ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <FieldCaption>{principal.rotulo}</FieldCaption>
                <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 14, color: "#012418" }}>
                  {principal.texto}
                </span>
              </div>
            ) : (
              <p style={{ margin: 0, fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#999999" }}>
                Nenhum endereço cadastrado ainda.
              </p>
            )}

            {outrosEnderecos.length > 0 && (
              <div
                style={{
                  marginTop: 24,
                  paddingTop: 20,
                  borderTop: "1px solid #E5E5E5",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-archivo), sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#012418",
                  }}
                >
                  Outros Endereços
                </span>
                {outrosEnderecos.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: 12,
                      background: "#F8F8F8",
                      border: "1px solid #E5E5E5",
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-manrope), sans-serif",
                        fontSize: 13,
                        color: "#012418",
                        lineHeight: 1.5,
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{a.rotulo}</div>
                      <div style={{ color: "#999999", fontSize: 12 }}>{a.texto}</div>
                    </div>
                    <div style={{ display: "flex", gap: 10, flex: "none", alignItems: "center" }}>
                      <InlineLink onClick={() => makeMain(a.id)} size={11}>
                        Tornar principal
                      </InlineLink>
                      <RemoveX onClick={() => removeAddress(a.id)} label={`Remover ${a.rotulo}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick actions */}
          <div className="perks-grid" style={{ marginBottom: 24 }}>
            <ActionButton
              color="#2E9222"
              hoverBg="#F3FBF4"
              onClick={() => router.push("/pedidos")}
              icon={<Icon name="package" size={20} color="#2E9222" />}
            >
              Meus Pedidos
            </ActionButton>
            <ActionButton
              color="#0088B7"
              hoverBg="#F0F7FB"
              onClick={() => {
                setNewAddress({ rotulo: "", texto: "" });
                setShowAddressModal(true);
              }}
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0088B7"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 21s-7-6-7-11a7 7 0 1 1 14 0c0 5-7 11-7 11z" />
                  <line x1="12" y1="8" x2="12" y2="13" />
                  <line x1="9.5" y1="10.5" x2="14.5" y2="10.5" />
                </svg>
              }
            >
              Novo Endereço
            </ActionButton>
            <ActionButton
              solid
              color="#E63946"
              hoverBg="#CC2E36"
              onClick={() => setShowLogout(true)}
              icon={<Icon name="logout" size={20} color="#FFFFFF" />}
            >
              Sair
            </ActionButton>
          </div>

          {/* Preferences */}
          <div
            style={{
              background: "#F8F8F8",
              border: "1px solid #E5E5E5",
              borderRadius: 12,
              padding: 24,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 18,
                color: "#012418",
                marginBottom: 16,
              }}
            >
              Preferências
            </div>
            {(
              [
                ["pedidos", "Receber notificações de pedidos"],
                ["ofertas", "Receber ofertas e promoções"],
                ["newsletter", "Receber newsletter"],
              ] as const
            ).map(([key, label]) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <span
                  style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 14, color: "#012418" }}
                >
                  {label}
                </span>
                <Switch
                  on={toggles[key]}
                  onToggle={() => setToggles((t) => ({ ...t, [key]: !t[key] }))}
                  label={label}
                />
              </div>
            ))}
          </div>

          <div
            style={{
              paddingTop: 24,
              textAlign: "center",
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 12,
              color: "#999999",
            }}
          >
            Desenvolvido por{" "}
            <a
              href="https://www.instagram.com/jehu_dev_e.commerce/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2E9222", textDecoration: "none" }}
            >
              @JEHU_DEV_E.COMMERCE
            </a>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showLogout && (
          <Modal onClose={() => setShowLogout(false)} label="Confirmar saída">
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
              Tem certeza que deseja sair?
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <ModalButton variant="ghost" onClick={() => setShowLogout(false)}>
                Cancelar
              </ModalButton>
              <ModalButton
                variant="danger"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
              >
                Sair
              </ModalButton>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddressModal && (
          <Modal onClose={() => setShowAddressModal(false)} label="Novo endereço" maxWidth={440}>
            <div
              style={{
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 18,
                color: "#012418",
                marginBottom: 20,
              }}
            >
              Novo Endereço
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              <ModalInput
                value={newAddress.rotulo}
                onChange={(v) => setNewAddress((a) => ({ ...a, rotulo: v }))}
                placeholder="Rótulo (ex: Casa, Trabalho)"
              />
              <ModalInput
                value={newAddress.texto}
                onChange={(v) => setNewAddress((a) => ({ ...a, texto: v }))}
                placeholder="Endereço completo"
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <ModalButton variant="ghost" onClick={() => setShowAddressModal(false)}>
                Cancelar
              </ModalButton>
              <ModalButton variant="info" onClick={saveNewAddress}>
                {savingAddress ? "Salvando..." : "Salvar Endereço"}
              </ModalButton>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </Shell>
  );
}

const inlineInputStyle: React.CSSProperties = {
  height: 36,
  boxSizing: "border-box",
  padding: "8px 10px",
  border: "2px solid #E5E5E5",
  borderRadius: 6,
  fontFamily: "var(--font-manrope), sans-serif",
  fontSize: 14,
  color: "#012418",
  outline: "none",
  background: "#FFFFFF",
  width: "100%",
  transition: "border-color 200ms var(--ease-out)",
};

function EditableValue({
  editing,
  value,
  onChange,
  label,
}: {
  editing: boolean;
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <AnimatePresence mode="wait" initial={false}>
      {editing ? (
        <motion.input
          key="edit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-label={label}
          style={{ ...inlineInputStyle, borderColor: focused ? "#2E9222" : "#E5E5E5" }}
        />
      ) : (
        <motion.span
          key="view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 14, color: "#012418" }}
        >
          {value || "—"}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function Card({ children }: { children: React.ReactNode }) {
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
      {children}
    </motion.div>
  );
}

function CardHeader({ title, action }: { title: string; action: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        gap: 12,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-archivo), sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: "#012418",
        }}
      >
        {title}
      </span>
      {action}
    </div>
  );
}

function FieldCaption({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-manrope), sans-serif",
        fontWeight: 600,
        fontSize: 12,
        color: "#999999",
      }}
    >
      {children}
    </span>
  );
}

function SaveButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      whileHover={{ backgroundColor: "#24741B" }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      onClick={onClick}
      style={{
        marginTop: 20,
        height: 40,
        padding: "0 20px",
        background: "#2E9222",
        color: "#FFFFFF",
        border: "none",
        borderRadius: 8,
        fontFamily: "var(--font-archivo), sans-serif",
        fontWeight: 700,
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      Salvar
    </motion.button>
  );
}

function InlineLink({
  onClick,
  children,
  size = 13,
}: {
  onClick: () => void;
  children: React.ReactNode;
  size?: number;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontFamily: "var(--font-manrope), sans-serif",
        fontWeight: 600,
        fontSize: size,
        color: hover ? "#2E9222" : "#0088B7",
        transition: "color 200ms var(--ease-out)",
      }}
    >
      {children}
    </button>
  );
}

function RemoveX({ onClick, label }: { onClick: () => void; label: string }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={label}
      style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", display: "grid" }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        stroke={hover ? "#E63946" : "#999999"}
        strokeWidth="2.5"
        style={{ transition: "stroke 200ms var(--ease-out)" }}
      >
        <line x1="5" y1="5" x2="19" y2="19" />
        <line x1="19" y1="5" x2="5" y2="19" />
      </svg>
    </button>
  );
}

function OutlineButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      style={{
        height: 44,
        padding: "10px 24px",
        background: hover ? "#F3FBF4" : "#FFFFFF",
        border: "2px solid #2E9222",
        color: "#2E9222",
        fontFamily: "var(--font-archivo), sans-serif",
        fontWeight: 700,
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

function ActionButton({
  children,
  icon,
  color,
  hoverBg,
  onClick,
  solid,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  color: string;
  hoverBg: string;
  onClick: () => void;
  solid?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileHover={{ y: -2, boxShadow: `0 4px 12px ${color}26` }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      style={{
        height: 72,
        background: solid ? (hover ? hoverBg : color) : hover ? hoverBg : "#FFFFFF",
        border: solid ? "none" : `2px solid ${color}`,
        color: solid ? "#FFFFFF" : color,
        borderRadius: 8,
        fontFamily: "var(--font-archivo), sans-serif",
        fontWeight: 700,
        fontSize: 14,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        cursor: "pointer",
        transition: "background 200ms var(--ease-out)",
      }}
    >
      {icon}
      {children}
    </motion.button>
  );
}

function Switch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      aria-label={label}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: on ? "#2E9222" : "#E5E5E5",
        position: "relative",
        cursor: "pointer",
        transition: "background 200ms var(--ease-out)",
        flex: "none",
        border: "none",
        padding: 0,
      }}
    >
      <motion.span
        animate={{ left: on ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#FFFFFF",
          position: "absolute",
          top: 2,
          boxShadow: "0 1px 2px rgba(0,0,0,.2)",
          display: "block",
        }}
      />
    </button>
  );
}

function ModalButton({
  children,
  onClick,
  variant,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant: "ghost" | "danger" | "info";
}) {
  const [hover, setHover] = useState(false);
  const styles = {
    ghost: {
      background: "#FFFFFF",
      border: `2px solid ${hover ? "#2E9222" : "#E5E5E5"}`,
      color: "#012418",
    },
    danger: { background: hover ? "#CC2E36" : "#E63946", border: "none", color: "#FFFFFF" },
    info: { background: hover ? "#00729B" : "#0088B7", border: "none", color: "#FFFFFF" },
  }[variant];

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
        borderRadius: 8,
        fontFamily: "var(--font-archivo), sans-serif",
        fontWeight: 700,
        fontSize: 14,
        cursor: "pointer",
        transition: "all 200ms var(--ease-out)",
        ...styles,
      }}
    >
      {children}
    </motion.button>
  );
}

function ModalInput({
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
        flex: 1,
        minWidth: 0,
        height: 44,
        boxSizing: "border-box",
        padding: "0 14px",
        border: `2px solid ${focused ? "#2E9222" : "#E5E5E5"}`,
        borderRadius: 8,
        fontFamily: "var(--font-manrope), sans-serif",
        fontSize: 14,
        color: "#012418",
        outline: "none",
        background: "#FFFFFF",
        transition: "border-color 200ms var(--ease-out)",
      }}
    />
  );
}
