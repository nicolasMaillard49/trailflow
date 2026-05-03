import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-cream/[0.06] px-6 md:px-14 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="font-display font-light text-[18px] tracking-[0.22em] uppercase text-cream"
        >
          Trail<span className="text-muted">Flow</span>
        </Link>
        <span className="text-[10px] font-light tracking-[0.18em] uppercase text-muted">
          © 2026
        </span>
      </div>

      <nav className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[10px] font-light tracking-[0.15em] uppercase text-muted-lt">
        <Link href="/mentions-legales" className="hover:text-cream transition-colors">
          Mentions légales
        </Link>
        <Link href="/cgv" className="hover:text-cream transition-colors">
          CGV
        </Link>
        <Link href="/confidentialite" className="hover:text-cream transition-colors">
          Confidentialité
        </Link>
        <Link href="/retours" className="hover:text-cream transition-colors">
          Retours
        </Link>
        <a
          href="mailto:contact@trailflow.shop"
          className="hover:text-cream transition-colors"
        >
          Contact
        </a>
      </nav>
    </footer>
  );
}
