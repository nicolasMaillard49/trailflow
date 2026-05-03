import Image from "next/image";
import Link from "next/link";
import { Price } from "./price";

export function Hero() {
  return (
    <section className="relative grid grid-cols-1 md:grid-cols-2 min-h-svh">
      {/* MEDIA */}
      <div className="relative h-[65vw] md:h-auto overflow-hidden">
        <Image
          src="/images/wom-studio.png"
          alt="Coureuse équipée du gilet TrailFlow"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-top animate-hero-reveal"
        />
        <div className="absolute inset-0 md:bg-gradient-to-r bg-gradient-to-t from-ink/95 to-transparent md:via-transparent" />
      </div>

      {/* CONTENT */}
      <div className="relative flex flex-col justify-end px-6 md:px-16 py-20 md:py-24 gap-7">
        <span
          className="block text-[10px] font-light tracking-[0.28em] uppercase text-muted animate-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          NOUVEAU · COLLECTION 2026
        </span>

        <h1
          className="font-display font-light italic text-[clamp(50px,5.2vw,80px)] leading-[1.05] tracking-[-0.01em] text-cream animate-fade-up"
          style={{ animationDelay: "0.45s" }}
        >
          Cours plus loin.
          <br />
          <span className="text-muted-lt">Bois malin.</span>
          <br />
          Reste léger.
        </h1>

        <p
          className="max-w-md text-[14px] leading-[1.8] text-muted-lt font-light animate-fade-up"
          style={{ animationDelay: "0.6s" }}
        >
          Gilet d'hydratation trail & running. Mesh réfléchissant 360°,
          deux flasques, poche zippée téléphone. Coupe ajustée. Aucun ballottement.
        </p>

        <div
          className="animate-fade-up"
          style={{ animationDelay: "0.7s" }}
        >
          <Price variant="hero" />
        </div>

        <Link
          href="/product/trailflow"
          className="group inline-flex items-center gap-3 self-start bg-cream text-ink px-10 py-[18px] rounded-[2px] text-[11px] font-sans font-normal tracking-[0.2em] uppercase hover:opacity-90 hover:-translate-y-px transition-all animate-fade-up"
          style={{ animationDelay: "0.8s" }}
        >
          Commander maintenant
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

        <span
          className="text-[10px] font-light tracking-[0.18em] uppercase text-muted animate-fade-up"
          style={{ animationDelay: "0.9s" }}
        >
          Livraison offerte · Retour 15j
        </span>
      </div>

      {/* INDEX flottant */}
      <div className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-4 text-[10px] font-light tracking-[0.3em] uppercase text-muted">
        <span>01 / HERO</span>
      </div>
    </section>
  );
}
