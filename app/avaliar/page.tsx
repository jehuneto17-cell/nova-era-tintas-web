"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Shell } from "@/components/Shell";
import { Placeholder } from "@/components/Placeholder";
import { EASE_OUT, Spinner } from "@/components/ui";

const FEEDBACK: Record<number, string> = {
  0: "Selecione uma nota",
  1: "Desculpe ouvir isso...",
  2: "Obrigado pelo feedback!",
  3: "Que legal!",
  4: "Adoramos! Obrigado!",
  5: "Perfeito! Você é top!",
};

const MAX_SIZE = 5 * 1024 * 1024;
const MAX_PHOTOS = 3;

type Photo = { id: string; src: string };

/** Screen 22 — Avaliar Compra. */
export default function AvaliarPage() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [titulo, setTitulo] = useState("");
  const [comentario, setComentario] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ text: string; kind: "success" | "error" } | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function showToast(text: string, kind: "success" | "error") {
    setToast({ text, kind });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3500);
  }

  function acceptFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    const remaining = MAX_PHOTOS - photos.length;
    files.slice(0, remaining).forEach((file) => {
      if (file.type !== "image/jpeg" && file.type !== "image/png") {
        showToast("Formato inválido. Envie JPG ou PNG.", "error");
        return;
      }
      if (file.size > MAX_SIZE) {
        showToast("Foto muito grande. Máximo 5MB.", "error");
        return;
      }
      const reader = new FileReader();
      const id = `${Date.now()}-${Math.random()}`;
      reader.onload = () => setPhotos((p) => [...p, { id, src: reader.result as string }]);
      reader.readAsDataURL(file);
    });
  }

  const display = hoverRating || rating;
  const canSubmit = rating > 0 && !submitting;

  function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast("Avaliação enviada com sucesso! Obrigado!", "success");
      setTimeout(() => router.push("/pedidos"), 1500);
    }, 1200);
  }

  return (
    <Shell>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          style={{ width: "100%", maxWidth: 800 }}
        >
          <h1
            style={{
              margin: "0 0 12px",
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 700,
              fontSize: 28,
              color: "#012418",
            }}
          >
            Avaliar Compra
          </h1>
          <p
            style={{
              margin: "0 0 24px",
              paddingBottom: 24,
              borderBottom: "1px solid #E5E5E5",
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 14,
              color: "#999999",
              lineHeight: 1.6,
            }}
          >
            Sua opinião nos ajuda a melhorar! Compartilhe sua experiência com o produto.
          </p>

          {/* Product */}
          <div
            style={{
              background: "#F8F8F8",
              border: "1px solid #E5E5E5",
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              display: "flex",
              gap: 16,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                flex: "none",
                borderRadius: 8,
                overflow: "hidden",
                background: "#FFFFFF",
              }}
            >
              <Placeholder label="tinta 1L" fontSize={9} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <span
                style={{
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#012418",
                }}
              >
                Tinta Acrílica Premium Branco 1L
              </span>
              <span
                style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, color: "#999999" }}
              >
                Cor: Branco | Volume: 1L
              </span>
              <span
                style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, color: "#999999" }}
              >
                Qtd: 2x | Data Entrega: 15 de julho de 2026
              </span>
            </div>
          </div>

          {/* Rating */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E5E5",
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: "#012418",
                textAlign: "center",
              }}
            >
              Como você avalia este produto?
            </div>
            <div
              style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "center" }}
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((n) => {
                const filled = n <= display;
                return (
                  <motion.button
                    key={n}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{ scale: rating === n ? 1.06 : 1 }}
                    transition={{ duration: 0.2, ease: EASE_OUT }}
                    aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
                    aria-pressed={rating === n}
                    style={{
                      width: 48,
                      height: 48,
                      background: filled ? "#FFFBF0" : "#F8F8F8",
                      borderRadius: 8,
                      border: `2px solid ${filled ? "#FFB703" : "#E5E5E5"}`,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 200ms var(--ease-out), border-color 200ms var(--ease-out)",
                    }}
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill={filled ? "#FFB703" : "none"}
                      stroke={filled ? "#FFB703" : "#D4D4D4"}
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                      style={{ transition: "fill 200ms var(--ease-out), stroke 200ms var(--ease-out)" }}
                    >
                      <polygon points="12 2 15 9 22 9.5 16.5 14.5 18.5 22 12 18 5.5 22 7.5 14.5 2 9.5 9 9" />
                    </svg>
                  </motion.button>
                );
              })}
            </div>
            <div
              style={{
                height: 24,
                textAlign: "center",
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 13,
                color: "#999999",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={display}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  style={{ display: "block" }}
                >
                  {FEEDBACK[display] ?? FEEDBACK[0]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Title */}
          <FieldCard label="Título da Avaliação">
            <TextInput
              value={titulo}
              onChange={(v) => setTitulo(v.slice(0, 80))}
              placeholder="Ex: Produto de qualidade excepcional"
            />
            <Counter value={titulo.length} max={80} />
          </FieldCard>

          {/* Comment */}
          <FieldCard label="Sua Avaliação">
            <TextArea
              value={comentario}
              onChange={(v) => setComentario(v.slice(0, 500))}
              placeholder="Compartilhe sua experiência. O que você gostou? Há algo a melhorar?"
            />
            <Counter value={comentario.length} max={500} />
            <div
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTop: "1px solid #E5E5E5",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontWeight: 600,
                  fontSize: 11,
                  color: "#999999",
                }}
              >
                Dicas para uma boa avaliação:
              </span>
              <span
                style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, color: "#999999" }}
              >
                • Seja honesto e construtivo · Compartilhe detalhes específicos · Mencione pontos fortes
                e fracos · Evite linguagem ofensiva
              </span>
            </div>
          </FieldCard>

          {/* Photos */}
          <FieldCard label="Adicione Fotos">
            {photos.length < MAX_PHOTOS && (
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
                  acceptFiles(e.dataTransfer.files);
                }}
                animate={{ scale: dragging ? 1.01 : 1 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") fileInput.current?.click();
                }}
                style={{
                  background: dragging ? "#E8F5E9" : "#F8F8F8",
                  border: `2px dashed ${dragging ? "#00B20B" : "#E5E5E5"}`,
                  borderRadius: 8,
                  padding: 20,
                  textAlign: "center",
                  cursor: "pointer",
                  minHeight: 120,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  boxSizing: "border-box",
                  transition: "background 200ms var(--ease-out), border-color 200ms var(--ease-out)",
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={dragging ? "#00B20B" : "#999999"}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-manrope), sans-serif",
                      fontSize: 13,
                      color: "#012418",
                    }}
                  >
                    Arraste as fotos aqui
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-manrope), sans-serif",
                      fontSize: 11,
                      color: "#999999",
                      marginTop: 4,
                    }}
                  >
                    ou clique para selecionar
                  </div>
                </div>
                <div
                  style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, color: "#999999" }}
                >
                  JPG ou PNG • Máximo 5MB por foto • Até 3 fotos
                </div>
              </motion.div>
            )}
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg, image/png"
              multiple
              onChange={(e) => acceptFiles(e.target.files)}
              style={{ display: "none" }}
            />

            {photos.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 12,
                  marginTop: 16,
                }}
              >
                <AnimatePresence mode="popLayout">
                  {photos.map((p) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.22, ease: EASE_OUT }}
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "1",
                        borderRadius: 8,
                        overflow: "hidden",
                        background: "#F8F8F8",
                      }}
                    >
                      <Image src={p.src} alt="Foto da avaliação" fill style={{ objectFit: "cover" }} unoptimized />
                      <RemovePhoto onClick={() => setPhotos((x) => x.filter((ph) => ph.id !== p.id))} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </FieldCard>

          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <BackBtn onClick={() => router.push("/pedidos")}>Voltar</BackBtn>
            <motion.button
              onClick={submit}
              disabled={!canSubmit}
              whileHover={canSubmit ? { y: -1, boxShadow: "0 2px 8px rgba(0,178,11,.2)" } : undefined}
              whileTap={canSubmit ? { scale: 0.98 } : undefined}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              style={{
                flex: 1,
                height: 48,
                background: rating > 0 ? "#00B20B" : "#BFBFBF",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 8,
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 14,
                cursor: canSubmit ? "pointer" : "not-allowed",
                opacity: rating > 0 ? 1 : 0.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "background 200ms var(--ease-out), opacity 200ms var(--ease-out)",
              }}
            >
              {submitting && <Spinner />}
              {submitting ? "Enviando..." : "Enviar Avaliação"}
            </motion.button>
          </div>
        </motion.div>
      </div>

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
              background: toast.kind === "error" ? "#E63946" : "#00B20B",
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

function FieldCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E5E5",
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12 }}>
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
        <span
          style={{
            fontFamily: "var(--font-manrope), sans-serif",
            fontSize: 10,
            color: "#999999",
            background: "#F8F8F8",
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          opcional
        </span>
      </div>
      {children}
    </div>
  );
}

function Counter({ value, max }: { value: number; max: number }) {
  return (
    <div
      style={{
        textAlign: "right",
        marginTop: 8,
        fontFamily: "var(--font-manrope), sans-serif",
        fontSize: 11,
        color: value >= max ? "#E63946" : "#999999",
        transition: "color 200ms var(--ease-out)",
      }}
    >
      {value}/{max}
    </div>
  );
}

function TextInput({
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
      maxLength={80}
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
        boxShadow: focused ? "0 0 0 3px rgba(0,178,11,.1)" : "none",
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
      maxLength={500}
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
        boxShadow: focused ? "0 0 0 3px rgba(0,178,11,.1)" : "none",
        transition: "all 200ms var(--ease-out)",
      }}
    />
  );
}

function RemovePhoto({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileTap={{ scale: 0.85 }}
      aria-label="Remover foto"
      style={{
        position: "absolute",
        top: 6,
        right: 6,
        width: 26,
        height: 26,
        borderRadius: "50%",
        background: hover ? "#E63946" : "rgba(230,57,70,.9)",
        border: "none",
        color: "#FFFFFF",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 200ms var(--ease-out)",
        zIndex: 2,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" stroke="#FFFFFF" strokeWidth="2.5">
        <line x1="5" y1="5" x2="19" y2="19" />
        <line x1="19" y1="5" x2="5" y2="19" />
      </svg>
    </motion.button>
  );
}

function BackBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      style={{
        flex: 1,
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
