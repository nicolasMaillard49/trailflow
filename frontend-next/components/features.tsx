import Image from "next/image";
import { storeConfig } from "@/lib/store.config";

export function Features() {
  return (
    <section
      id="features"
      className="bg-ink-soft px-6 md:px-14 py-20 md:py-[140px]"
    >
      <span className="block text-[10px] font-light tracking-[0.28em] uppercase text-muted mb-8">
        02 / Le produit
      </span>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-20 items-center">
        {/* Left : image principale */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] bg-[#1A1A18]">
          <Image
            src="/images/product-face.png"
            alt="Gilet TrailFlow vue de face"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        {/* Right : titre + 4 features numérotés */}
        <div className="flex flex-col gap-10">
          <h2 className="font-display font-light text-[clamp(30px,2.8vw,46px)] leading-[1.12] tracking-[-0.01em] text-cream">
            <em className="italic text-muted-lt font-light">Conçu pour</em>{" "}
            les trails les plus exigeants.
          </h2>

          <div className="flex flex-col">
            {storeConfig.features.map((f, i) => (
              <div
                key={f.n}
                className={`flex gap-6 py-5 ${
                  i !== storeConfig.features.length - 1
                    ? "border-b border-cream/[0.07]"
                    : ""
                }`}
              >
                <span className="font-display font-light text-[11px] tracking-[0.1em] text-muted min-w-[20px]">
                  {f.n}
                </span>
                <div className="flex-1">
                  <h3 className="font-sans text-[14px] font-normal text-cream mb-1.5">
                    {f.title}
                  </h3>
                  <p className="font-sans text-[12px] font-light text-muted-lt leading-[1.7]">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
