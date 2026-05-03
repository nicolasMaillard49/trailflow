import Link from "next/link";
import { Price } from "./price";

export function CtaFinal() {
  return (
    <section
      id="buy"
      className="bg-ink-soft px-6 md:px-14 py-32 md:py-[180px] text-center"
    >
      <span className="block text-[10px] font-light tracking-[0.28em] uppercase text-muted mb-8">
        06 / Commander
      </span>

      <h2 className="font-display font-light text-[clamp(36px,4vw,64px)] leading-[1.05] tracking-[-0.01em] text-cream mb-8 max-w-3xl mx-auto">
        <em className="italic text-muted-lt font-light">Aujourd'hui</em>,
        ou jamais.
      </h2>

      <p className="text-[14px] font-light text-muted-lt leading-[1.8] max-w-md mx-auto mb-10">
        Stock 2026 ultra-limité. Livraison sous 5–7 jours. Paiement sécurisé Stripe.
      </p>

      <div className="mb-10 flex justify-center">
        <Price variant="cta" />
      </div>

      <Link
        href="/product/trailflow"
        className="group inline-flex items-center gap-3 bg-cream text-ink px-12 py-5 rounded-[2px] text-[11px] font-sans font-normal tracking-[0.2em] uppercase hover:opacity-90 hover:-translate-y-px transition-all"
      >
        Ajouter au panier
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          className="transition-transform group-hover:translate-x-1"
        >
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </Link>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-[10px] font-light tracking-[0.18em] uppercase text-muted">
        <span>· Livraison offerte</span>
        <span>· Retour 15 jours</span>
        <span>· Garantie 1 an</span>
        <span>· Paiement Stripe</span>
      </div>
    </section>
  );
}
