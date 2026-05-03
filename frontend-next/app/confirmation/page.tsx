"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { useCart } from "@/lib/cart";

function ConfirmationInner() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const clear = useCart((s) => s.clear);

  useEffect(() => {
    if (sessionId) clear();
  }, [sessionId, clear]);

  return null;
}

export default function ConfirmationPage() {
  return (
    <>
      <Nav />
      <Suspense fallback={null}>
        <ConfirmationInner />
      </Suspense>
      <main className="pt-32 pb-32 px-6 md:px-14 min-h-svh text-center">
        <div className="max-w-2xl mx-auto">
          <span className="block text-[10px] font-light tracking-[0.28em] uppercase text-green mb-8">
            Commande confirmée
          </span>

          <h1 className="font-display font-light italic text-[clamp(48px,5vw,80px)] leading-[1.05] text-cream mb-8">
            Merci.
          </h1>

          <p className="text-[14px] font-light leading-[1.8] text-muted-lt mb-12 max-w-md mx-auto">
            Un email de confirmation arrive dans quelques minutes. Expédition
            sous 24h. Suivi détaillé dès expédition.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-3 bg-cream text-ink px-10 py-4 rounded-[2px] text-[11px] tracking-[0.2em] uppercase hover:opacity-90 transition-opacity"
          >
            Retour à l'accueil
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
