import Image from "next/image";
import { storeConfig } from "@/lib/store.config";

export function Split() {
  return (
    <section className="px-6 md:px-14 py-20 md:py-[140px]">
      <span className="block text-[10px] font-light tracking-[0.28em] uppercase text-muted mb-8">
        05 / Pour elles. Pour eux.
      </span>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {storeConfig.split.map((s, i) => (
          <article
            key={i}
            className="group relative aspect-[3/4] overflow-hidden rounded-[3px] bg-[#1A1A18]"
          >
            <Image
              src={s.image}
              alt={`${s.kicker} — ${s.name}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top transition-transform duration-[700ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
            />
            <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-ink/95 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 flex flex-col gap-3">
              <span className="text-[9px] font-light tracking-[0.3em] uppercase text-muted">
                {s.kicker}
              </span>
              <h3 className="font-display font-light text-[26px] text-cream">
                {s.name}
              </h3>
              <p className="text-[11px] font-light leading-[1.6] text-muted-lt max-w-xs">
                {s.desc}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
