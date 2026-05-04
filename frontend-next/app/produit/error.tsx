"use client";

import { useEffect } from "react";

export default function ProduitError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[produit] render error:", error);
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
        Une erreur est survenue
      </h1>
      <p style={{ maxWidth: 480, fontSize: 14, color: "rgba(240,237,232,0.65)", lineHeight: 1.6 }}>
        Le produit n&apos;a pas pu charger. Réessaye dans quelques secondes — si le problème persiste,
        contacte-nous.
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
          href="/"
          className="btn-primary"
          style={{ background: "transparent", color: "var(--cream, #F0EDE8)", border: "0.5px solid rgba(240,237,232,0.2)" }}
        >
          Retour à l&apos;accueil
        </a>
      </div>
    </main>
  );
}
