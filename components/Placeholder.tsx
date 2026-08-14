// Mirrors the `placeholder()` helper in the Claude Designer sources: a hatched
// grey box standing in for photography that hasn't been shot yet.
export function Placeholder({
  label,
  fontSize = 12,
  square = false,
}: {
  label: string;
  fontSize?: number;
  square?: boolean;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "100%",
        aspectRatio: square ? "1/1" : undefined,
        background: "#F5F5F5",
        backgroundImage:
          "repeating-linear-gradient(135deg, rgba(1,36,24,.05) 0 10px, rgba(1,36,24,.02) 10px 20px)",
        display: "grid",
        placeItems: "center",
        fontFamily: "ui-monospace, Menlo, monospace",
        fontSize: `${fontSize}px`,
        color: "#999999",
        textAlign: "center",
        padding: "0 12px",
        boxSizing: "border-box",
        whiteSpace: "pre-line",
      }}
    >
      {label}
    </div>
  );
}
