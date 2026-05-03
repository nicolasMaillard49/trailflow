import Image from "next/image";
import { storeConfig } from "@/lib/store.config";

export function Gallery() {
  return (
    <section className="px-6 md:px-14 py-20 md:py-[140px]">
      <span className="block text-[10px] font-light tracking-[0.28em] uppercase text-muted mb-8">
        03 / Galerie
      </span>

      <div className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr] grid-rows-[320px_320px] gap-1.5">
        {storeConfig.gallery.map((g, i) => (
          <div
            key={i}
            className={`group relative overflow-hidden rounded-[3px] bg-[#1A1A18] ${
              g.span ? "row-span-2 col-span-2 md:col-span-1" : ""
            }`}
          >
            <Image
              src={g.src}
              alt={g.label}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            />
            <span className="absolute bottom-3 left-3 text-[9px] font-light tracking-[0.2em] uppercase text-cream/35 bg-ink/40 px-2 py-0.5 rounded-[2px]">
              {g.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
