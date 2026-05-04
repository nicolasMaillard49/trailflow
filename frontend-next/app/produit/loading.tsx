export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
        fontFamily: "var(--font-geist, system-ui)",
        color: "var(--cream, #F0EDE8)",
        background: "var(--bg, #0E0E0C)",
      }}
    >
      <div
        aria-hidden
        style={{
          width: 32,
          height: 32,
          border: "2px solid rgba(240,237,232,0.15)",
          borderTopColor: "var(--cream, #F0EDE8)",
          borderRadius: "50%",
          animation: "tf-spin 0.9s linear infinite",
        }}
      />
      <span style={{ letterSpacing: "0.2em", fontSize: 11, textTransform: "uppercase", color: "rgba(240,237,232,0.5)" }}>
        Chargement du produit…
      </span>
      <style>{`@keyframes tf-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
