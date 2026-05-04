"use client";

import { useEffect } from "react";

export default function ConfirmationError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[confirmation] render error:", error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 20,
        padding: "0 20px",
        textAlign: "center",
        background: "var(--bg, #0E0E0C)",
        color: "var(--cream, #F0EDE8)",
      }}
    >
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 40, fontWeight: 300 }}>
        Erreur d&apos;affichage de la confirmation
      </h1>
      <p style={{ maxWidth: 480, fontSize: 14, color: "rgba(240,237,232,0.65)", lineHeight: 1.6 }}>
        Si tu viens de payer, ne te ré-engage pas — la commande est bien enregistrée
        et l&apos;email de confirmation arrive. Tu peux suivre son statut depuis
        l&apos;onglet « Suivi commande ».
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="btn-primary"
          style={{ background: "var(--cream, #F0EDE8)", color: "var(--bg, #0E0E0C)" }}
        >
          Réessayer
        </button>
        <a
          href="/suivi"
          className="btn-primary"
          style={{ background: "transparent", color: "var(--cream, #F0EDE8)", border: "0.5px solid rgba(240,237,232,0.2)" }}
        >
          Suivre ma commande
        </a>
      </div>
    </main>
  );
}
