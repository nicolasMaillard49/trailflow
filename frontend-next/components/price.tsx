import { storeConfig } from "@/lib/store.config";

type Variant = "nav" | "hero" | "cta";

const sizeMap: Record<Variant, { now: string; was: string }> = {
  nav: { now: "text-[17px]", was: "text-[13px]" },
  hero: { now: "text-[28px]", was: "text-[18px]" },
  cta: { now: "text-[32px]", was: "text-[20px]" },
};

export function Price({ variant = "hero" }: { variant?: Variant }) {
  const { price, originalPrice, discount } = storeConfig.product;
  const sz = sizeMap[variant];
  return (
    <span className="inline-flex items-baseline gap-3 font-display font-light">
      <s className={`${sz.was} text-muted line-through font-light`}>
        {originalPrice.toFixed(2).replace(".", ",")}€
      </s>
      <span className={`${sz.now} text-cream tracking-[0.02em]`}>
        {price.toFixed(2).replace(".", ",")}€
      </span>
      {variant !== "nav" && (
        <span className="text-[10px] uppercase tracking-[0.14em] font-sans font-light text-green border border-green/35 px-2 py-1 rounded-[2px]">
          − {discount}%
        </span>
      )}
    </span>
  );
}
