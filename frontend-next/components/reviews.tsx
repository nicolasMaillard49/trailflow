import { storeConfig } from "@/lib/store.config";

export function Reviews() {
  return (
    <section
      id="proof"
      className="bg-ink-soft px-6 md:px-14 py-20 md:py-[140px]"
    >
      <span className="block text-[10px] font-light tracking-[0.28em] uppercase text-muted mb-8">
        04 / Ils nous font confiance
      </span>

      <h2 className="font-display font-light text-[clamp(30px,2.8vw,46px)] leading-[1.12] tracking-[-0.01em] text-cream mb-14 max-w-2xl">
        <em className="italic text-muted-lt font-light">5 000 coureurs.</em>{" "}
        Une seule conviction.
      </h2>

      {/* Reviews — gap 2px effet "tableau de bord" */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px] mb-[2px]">
        {storeConfig.reviews.map((r, i) => (
          <article
            key={i}
            className="bg-cream/[0.03] border border-cream/[0.06] p-9"
          >
            <div className="text-[11px] text-cream-dk tracking-[4px] mb-5">
              {"★".repeat(r.stars)}
              <span className="text-muted">{"★".repeat(5 - r.stars)}</span>
            </div>
            <blockquote className="font-display font-light italic text-[17px] leading-[1.65] text-cream-dk mb-6">
              « {r.quote} »
            </blockquote>
            <p className="text-[10px] font-sans font-light tracking-[0.15em] uppercase text-muted">
              {r.author}
            </p>
          </article>
        ))}
      </div>

      {/* Stats — séparateurs border-right 0.5px */}
      <div className="grid grid-cols-2 md:grid-cols-4">
        {storeConfig.stats.map((s, i) => (
          <div
            key={i}
            className={`p-10 ${
              i !== storeConfig.stats.length - 1
                ? "md:border-r border-cream/[0.06]"
                : ""
            } ${i % 2 === 0 ? "border-r md:border-r" : ""}`}
          >
            <div className="font-display font-light text-[50px] tracking-[-0.02em] text-cream leading-none mb-3">
              {s.number}
            </div>
            <div className="text-[10px] font-sans font-light tracking-[0.2em] uppercase text-muted">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
