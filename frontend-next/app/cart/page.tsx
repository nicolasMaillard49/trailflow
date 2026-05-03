"use client";

import Image from "next/image";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { useCart } from "@/lib/cart";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const setQuantity = useCart((s) => s.setQuantity);
  const total = useCart((s) => s.total());

  return (
    <>
      <Nav />
      <main className="pt-32 pb-32 px-6 md:px-14 min-h-svh">
        <div className="max-w-4xl mx-auto">
          <span className="block text-[10px] font-light tracking-[0.28em] uppercase text-muted mb-6">
            Votre panier
          </span>
          <h1 className="font-display font-light italic text-[clamp(40px,4vw,64px)] leading-[1.05] text-cream mb-14">
            {items.length === 0 ? "Vide pour l'instant." : "Prêt à courir."}
          </h1>

          {items.length === 0 ? (
            <Link
              href="/product/trailflow"
              className="inline-flex items-center gap-3 bg-cream text-ink px-10 py-4 rounded-[2px] text-[11px] tracking-[0.2em] uppercase hover:opacity-90 transition-opacity"
            >
              Découvrir le gilet
            </Link>
          ) : (
            <>
              <div className="border-t border-cream/[0.06]">
                {items.map((item) => (
                  <div
                    key={`${item.slug}-${item.size}`}
                    className="flex items-center gap-6 py-6 border-b border-cream/[0.06]"
                  >
                    <div className="relative w-24 h-28 overflow-hidden rounded-[2px] bg-[#1A1A18] flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-light text-[20px] text-cream mb-1">
                        {item.name}
                      </h3>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-muted">
                        Taille {item.size}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 border border-cream/[0.15] rounded-[2px]">
                      <button
                        onClick={() =>
                          setQuantity(item.slug, item.size, item.quantity - 1)
                        }
                        className="w-8 h-8 text-muted hover:text-cream"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-cream">{item.quantity}</span>
                      <button
                        onClick={() =>
                          setQuantity(item.slug, item.size, item.quantity + 1)
                        }
                        className="w-8 h-8 text-muted hover:text-cream"
                      >
                        +
                      </button>
                    </div>
                    <div className="font-display font-light text-[22px] text-cream w-24 text-right">
                      {(item.price * item.quantity).toFixed(2).replace(".", ",")}€
                    </div>
                    <button
                      onClick={() => remove(item.slug, item.size)}
                      className="text-[10px] tracking-[0.18em] uppercase text-muted hover:text-cream"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between py-10">
                <span className="text-[10px] tracking-[0.28em] uppercase text-muted">
                  Total
                </span>
                <span className="font-display font-light text-[40px] text-cream">
                  {total.toFixed(2).replace(".", ",")}€
                </span>
              </div>

              <Link
                href="/checkout"
                className="block text-center bg-cream text-ink py-5 rounded-[2px] text-[11px] tracking-[0.2em] uppercase hover:opacity-90 transition-opacity"
              >
                Passer au paiement →
              </Link>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
