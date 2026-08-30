"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Shell } from "@/components/Shell";
import { Modal } from "@/components/Modal";
import { EASE_OUT, Spinner } from "@/components/ui";
import { subscribePedido, enviarComprovante } from "@/lib/pedidos";
import { useAuth } from "@/lib/auth";
import { brl } from "@/lib/store";
import { uploadImage } from "@/lib/cloudinary";
import type { Pedido } from "@/lib/types";

const MAX_SIZE = 5 * 1024 * 1024;

function pedidoTotal(p: Pedido) {
  return p.itens.reduce((s, i) => s + i.preco * i.qtd, 0) + p.frete;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Screen 19 — Enviar Comprovante. */
export default function EnviarComprovantePage() {
  return (
    <Suspense fallback={<Shell>{null}</Shell>}>
      <EnviarComprovante />
    </Suspense>
  );
}

function EnviarComprovante() {
  const router = useRouter();
  const params = useSearchParams();
  const pedidoId = params.get("id");
  const { cliente } = useAuth();
  const [pedido, setPedido] = useState<Pedido | null | undefined>(undefined);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [toast, setToast] = useState<{ text: string; kind: "success" | "error" } | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (pedidoId !== loadedId) {
    setLoadedId(pedidoId);
    setPedido(pedidoId ? undefined : null);
  }

  useEffect(() => {
    if (!pedidoId) return;
    return subscribePedido(pedidoId, setPedido);
  }, [pedidoId]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function showToast(text: string, kind: "success" | "error") {
    setToast({ text, kind });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3500);
  }

  function acceptFile(f: File | undefined | null) {
    if (!f) return;
    if (f.type !== "image/jpeg" && f.type !== "image/png") {
      showToast("Formato inválido. Envie JPG ou PNG.", "error");
      return;
    }
    if (f.size > MAX_SIZE) {
      showToast("Arquivo muito grande. Máximo 5MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFile(f);
      setPreviewSrc(reader.result as string);
    };
    reader.readAsDataURL(f);
  }

  const hasFile = !!file;
  const total = pedido ? pedidoTotal(pedido) : 0;

  const checklist = [
    { label: "Imagem contém data e hora visível", ok: hasFile },
    { label: `Valor corresponde ao pedido (${brl(total)})`, ok: hasFile },
    { label: "Tipo de arquivo: JPG ou PNG", ok: hasFile },
    { label: "Tamanho do arquivo: máximo 5MB", ok: hasFile },
    { label: "Comprovante legível e clara (validar ao enviar)", ok: false },
  ];

  async function submit() {
    if (!hasFile || !file || submitting || !pedido) return;
    setSubmitting(true);
    try {
      const { url: comprovanteUrl } = await uploadImage(file);
      await enviarComprovante(pedido.id, comprovanteUrl, total, cliente?.nome ?? "Cliente");
      setSubmitting(false);
      showToast("Comprovante enviado com sucesso!", "success");
      setTimeout(() => router.push(`/comprovante/aguardando?id=${pedido.id}`), 900);
    } catch {
      setSubmitting(false);
      showToast("Erro ao enviar comprovante. Tente novamente.", "error");
    }
  }

  if (!pedidoId || pedido === null) {
    return (
      <Shell>
        <div style={{ padding: "120px 0", textAlign: "center", fontFamily: "var(--font-manrope), sans-serif", color: "#999999" }}>
          Pedido não encontrado.
        </div>
      </Shell>
    );
  }

  if (pedido === undefined) {
    return (
      <Shell>
        <div style={{ padding: "120px 0", textAlign: "center", fontFamily: "var(--font-manrope), sans-serif", color: "#999999" }}>
          Carregando pedido...
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 800 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
              paddingBottom: 16,
              borderBottom: "1px solid #E5E5E5",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <h1
              style={{
                margin: 0,
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 28,
                color: "#012418",
              }}
            >
              Enviar Comprovante de Pagamento
            </h1>
            <span
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 12,
                color: "#FFB703",
                background: "#FFF8E5",
                padding: "6px 12px",
                borderRadius: 6,
              }}
            >
              Aguardando Comprovante
            </span>
          </div>
          <p
            style={{
              margin: "0 0 24px",
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 13,
              color: "#999999",
            }}
          >
            Pedido {pedido.numero}
          </p>

          {/* Instructions */}
          <div
            style={{
              background: "#F0F7FB",
              border: "1px solid #D4E8F4",
              borderLeft: "4px solid #0088B7",
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
              display: "flex",
              gap: 16,
              alignItems: "flex-start",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0088B7"
              strokeWidth="1.6"
              style={{ flex: "none" }}
            >
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="11" x2="12" y2="16" />
              <circle cx="12" cy="8" r="0.6" fill="#0088B7" />
            </svg>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#0088B7",
                  marginBottom: 12,
                }}
              >
                Como Enviar
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "Faça screenshot da tela de confirmação do PIX",
                  `Certifique-se que aparece: data, hora e valor (${brl(total)})`,
                  "Envie a imagem no formato JPG ou PNG",
                  "Máximo 5MB",
                ].map((text, i) => (
                  <motion.div
                    key={text}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.06, ease: EASE_OUT }}
                    style={{ display: "flex", gap: 8 }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#0088B7",
                        width: 20,
                        flex: "none",
                        fontFamily: "var(--font-manrope), sans-serif",
                        fontSize: 12,
                      }}
                    >
                      {i + 1}.
                    </span>
                    <span
                      style={{
                        flex: 1,
                        fontFamily: "var(--font-manrope), sans-serif",
                        fontSize: 12,
                        color: "#012418",
                      }}
                    >
                      {text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Dropzone / preview */}
          <AnimatePresence mode="wait">
            {!hasFile ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  onClick={() => fileInput.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    acceptFile(e.dataTransfer.files[0]);
                  }}
                  animate={{ scale: dragging ? 1.01 : 1 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") fileInput.current?.click();
                  }}
                  style={{
                    background: dragging ? "#E8F5E9" : "#FFFFFF",
                    border: `2px dashed ${dragging ? "#2E9222" : "#E5E5E5"}`,
                    borderRadius: 12,
                    padding: "40px 24px",
                    textAlign: "center",
                    cursor: "pointer",
                    marginBottom: 24,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 16,
                    minHeight: 200,
                    justifyContent: "center",
                    boxShadow: dragging ? "0 4px 12px rgba(46,146,34,.15)" : "none",
                    boxSizing: "border-box",
                    transition: "background 200ms var(--ease-out), border-color 200ms var(--ease-out)",
                  }}
                >
                  <motion.svg
                    animate={{ y: dragging ? -4 : 0 }}
                    transition={{ duration: 0.2, ease: EASE_OUT }}
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={dragging ? "#2E9222" : "#999999"}
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 18a4.5 4.5 0 0 1-1-8.9A6 6 0 0 1 17.6 8H18a4 4 0 0 1 0 8h-1" />
                    <path d="M12 12v8" />
                    <path d="M9 15l3-3 3 3" />
                  </motion.svg>
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-archivo), sans-serif",
                        fontWeight: 700,
                        fontSize: 16,
                        color: "#012418",
                        marginBottom: 8,
                      }}
                    >
                      Arraste a imagem aqui
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-manrope), sans-serif",
                        fontSize: 13,
                        color: "#999999",
                        marginBottom: 16,
                      }}
                    >
                      ou clique para selecionar
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-manrope), sans-serif",
                        fontSize: 11,
                        color: "#999999",
                      }}
                    >
                      JPG ou PNG • Máximo 5MB
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E5E5E5",
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-archivo), sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#012418",
                  }}
                >
                  Pré-visualização
                </div>
                {previewSrc && (
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: 300,
                      borderRadius: 8,
                      background: "#F8F8F8",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={previewSrc}
                      alt="Pré-visualização do comprovante"
                      fill
                      style={{ objectFit: "contain" }}
                      unoptimized
                    />
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 12,
                    background: "#F8F8F8",
                    borderRadius: 8,
                    gap: 12,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-manrope), sans-serif",
                        fontSize: 12,
                        color: "#012418",
                        wordBreak: "break-all",
                      }}
                    >
                      {file?.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-manrope), sans-serif",
                        fontSize: 11,
                        color: "#999999",
                      }}
                    >
                      {file ? formatSize(file.size) : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flex: "none" }}>
                    <IconAction
                      onClick={() => fileInput.current?.click()}
                      color="#0088B7"
                      hoverColor="#2E9222"
                      label="Trocar imagem"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                    </IconAction>
                    <IconAction
                      onClick={() => {
                        setFile(null);
                        setPreviewSrc(null);
                        if (fileInput.current) fileInput.current.value = "";
                      }}
                      color="#E63946"
                      hoverColor="#CC2E36"
                      label="Remover imagem"
                      strokeWidth={2.5}
                    >
                      <line x1="5" y1="5" x2="19" y2="19" />
                      <line x1="19" y1="5" x2="5" y2="19" />
                    </IconAction>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg, image/png"
            onChange={(e) => acceptFile(e.target.files?.[0])}
            style={{ display: "none" }}
          />

          {/* Order facts */}
          <div
            className="confirm-grid"
            style={{
              background: "#F8F8F8",
              border: "1px solid #E5E5E5",
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
              gap: 16,
            }}
          >
            <Fact label="Nº Pedido" value={pedido.numero} />
            <Fact label="Valor Total" value={brl(total)} color="#2E9222" />
            <Fact
              label="Data do Pedido"
              value={
                pedido.criadoEm
                  ? new Date(pedido.criadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
                  : "-"
              }
            />
            <Fact label="Método Pagamento" value="PIX" />
            <Fact label="Status" value="Aguardando Comprovante" color="#FFB703" />
          </div>

          {/* Checklist */}
          <AnimatePresence>
            {hasFile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: EASE_OUT }}
                style={{ overflow: "hidden" }}
              >
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E5E5E5",
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-archivo), sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#012418",
                      marginBottom: 16,
                    }}
                  >
                    Validar Comprovante
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {checklist.map((c, i) => (
                      <motion.div
                        key={c.label}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.06, ease: EASE_OUT }}
                        style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
                      >
                        {c.ok ? (
                          <motion.svg
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 16, delay: i * 0.06 }}
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#2E9222"
                            strokeWidth="2"
                            style={{ flex: "none" }}
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="7 12 10.5 15.5 17 8.5" />
                          </motion.svg>
                        ) : (
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              border: "2px solid #E5E5E5",
                              borderRadius: "50%",
                              flex: "none",
                              boxSizing: "border-box",
                            }}
                          />
                        )}
                        <span
                          style={{
                            fontFamily: "var(--font-manrope), sans-serif",
                            fontSize: 12,
                            color: c.ok ? "#012418" : "#999999",
                          }}
                        >
                          {c.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <motion.button
              onClick={submit}
              disabled={!hasFile || submitting}
              whileHover={hasFile && !submitting ? { y: -1, boxShadow: "0 2px 8px rgba(46,146,34,.2)" } : undefined}
              whileTap={hasFile && !submitting ? { scale: 0.98 } : undefined}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              style={{
                height: 48,
                background: hasFile ? "#2E9222" : "#BFBFBF",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 8,
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 14,
                cursor: hasFile && !submitting ? "pointer" : "not-allowed",
                opacity: hasFile ? 1 : 0.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "background 200ms var(--ease-out), opacity 200ms var(--ease-out)",
              }}
            >
              {submitting && <Spinner />}
              {submitting ? "Enviando..." : "Enviar Comprovante"}
            </motion.button>
            <GhostBtn onClick={() => setShowCancel(true)}>Cancelar</GhostBtn>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCancel && (
          <Modal onClose={() => setShowCancel(false)} label="Cancelar envio">
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
              Deseja cancelar o envio?
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <DialogBtn variant="ghost" onClick={() => setShowCancel(false)}>
                Não
              </DialogBtn>
              <DialogBtn
                variant="danger"
                onClick={() => {
                  setShowCancel(false);
                  router.push("/pedidos");
                }}
              >
                Sim, cancelar
              </DialogBtn>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            role="status"
            style={{
              position: "fixed",
              top: 20,
              right: 20,
              background: toast.kind === "error" ? "#E63946" : "#012418",
              color: "#FFFFFF",
              padding: "14px 20px",
              borderRadius: 8,
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 600,
              fontSize: 13,
              boxShadow: "0 4px 16px rgba(0,0,0,.2)",
              zIndex: 300,
            }}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  );
}

function Fact({ label, value, color = "#012418" }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontFamily: "var(--font-manrope), sans-serif",
          fontWeight: 600,
          fontSize: 11,
          color: "#999999",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-manrope), sans-serif",
          fontWeight: 600,
          fontSize: 13,
          color,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function IconAction({
  children,
  onClick,
  color,
  hoverColor,
  label,
  strokeWidth = 1.8,
}: {
  children: React.ReactNode;
  onClick: () => void;
  color: string;
  hoverColor: string;
  label: string;
  strokeWidth?: number;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={label}
      aria-label={label}
      style={{
        background: "transparent",
        border: "none",
        width: 24,
        height: 24,
        color: hover ? hoverColor : color,
        cursor: "pointer",
        padding: 0,
        display: "grid",
        placeItems: "center",
        transition: "color 200ms var(--ease-out)",
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </button>
  );
}

function GhostBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
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
        background: hover ? "#F8F8F8" : "#FFFFFF",
        border: `1px solid ${hover ? "#999999" : "#E5E5E5"}`,
        color: "#012418",
        borderRadius: 8,
        fontFamily: "var(--font-archivo), sans-serif",
        fontWeight: 700,
        fontSize: 14,
        cursor: "pointer",
        transition: "all 200ms var(--ease-out)",
      }}
    >
      {children}
    </motion.button>
  );
}

function DialogBtn({
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
      style={{
        flex: 1,
        height: 44,
        background: variant === "danger" ? (hover ? "#CC2E36" : "#E63946") : "#FFFFFF",
        border: variant === "danger" ? "none" : `2px solid ${hover ? "#2E9222" : "#E5E5E5"}`,
        color: variant === "danger" ? "#FFFFFF" : "#012418",
        borderRadius: 8,
        fontFamily: "var(--font-archivo), sans-serif",
        fontWeight: 700,
        fontSize: 14,
        cursor: "pointer",
        transition: "all 200ms var(--ease-out)",
      }}
    >
      {children}
    </motion.button>
  );
}
