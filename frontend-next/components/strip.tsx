import { storeConfig } from "@/lib/store.config";

export function Strip() {
  // dupliqué ×2 pour boucle marquee seamless
  const items = [...storeConfig.strip, ...storeConfig.strip];

  return (
    <div className="overflow-hidden border-y border-cream/[0.06] py-4">
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((label, i) => (
          <span
            key={i}
            className="px-10 text-[10px] font-light tracking-[0.22em] uppercase text-muted border-r border-cream/[0.07]"
          >
            <strong className="text-cream-dk font-normal mr-1.5">·</strong>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
