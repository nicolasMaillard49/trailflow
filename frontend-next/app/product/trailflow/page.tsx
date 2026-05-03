"use client";

import Image from "next/image";
import { useState } from "react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Price } from "@/components/price";
import { storeConfig } from "@/lib/store.config";
import { useCart } from "@/lib/cart";

const images = [
  "/images/product-face.png",
  "/images/product-face-sol.png",
  "/images/product-3quart.png",
  "/images/product-cote-droit.png",
  "/images/product-dos.png",
  "/images/product-cote-gauche.png",
  "/images/product-details.png",
];

export default function ProductPage() {
  const [size, setSize] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const add = useCart((s) => s.add);
  const { product } = storeConfig;

  const handleAdd = () => {
    if (!size) return;
    add({
      productId: product.slug,
      slug: product.slug,
      name: product.name,
      size,
      price: product.price,
      quantity: 1,
      image: images[0],
    });
  };

  return (
    <>
      <Nav />
      <main className="pt-24 pb-32 px-6 md:px-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 max-w-7xl mx-auto">
          {/* Galerie produit */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] bg-[#1A1A18]">
              <Image
                src={images[active]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-7 gap-2">
              {images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setActive(i)}
                  className={`relative aspect-square overflow-hidden rounded-[2px] bg-[#1A1A18] border ${
                    active === i ? "border-cream" : "border-cream/[0.06]"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Infos produit */}
          <div className="flex flex-col gap-7 md:pt-8">
            <span className="text-[10px] font-light tracking-[0.28em] uppercase text-muted">
              {storeConfig.identity.name}
            </span>

            <h1 className="font-display font-light italic text-[clamp(36px,3.6vw,56px)] leading-[1.05] tracking-[-0.01em] text-cream">
              {product.name}
            </h1>

            <p className="font-display font-light italic text-[18px] text-muted-lt">
              {storeConfig.identity.tagline}
            </p>

            <div>
              <Price variant="cta" />
            </div>

            <p className="text-[14px] font-light leading-[1.8] text-muted-lt max-w-md">
              Mesh réfléchissant 360°. Deux poches avant flasques + une zippée téléphone.
              Boucles click anti-ballottement. Coupe ajustée. Tailles unisexe S à XL.
            </p>

            {/* Sélecteur taille */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-light tracking-[0.28em] uppercase text-muted">
                Taille
              </span>
              <div className="flex gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`w-14 h-14 border rounded-[2px] font-display font-light text-[18px] transition-all ${
                      size === s
                        ? "bg-cream text-ink border-cream"
                        : "border-cream/[0.15] text-cream hover:border-cream"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={!size}
              className="group inline-flex items-center justify-center gap-3 self-start bg-cream text-ink px-12 py-5 rounded-[2px] text-[11px] font-sans font-normal tracking-[0.2em] uppercase hover:opacity-90 hover:-translate-y-px transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {size ? "Ajouter au panier" : "Choisir une taille"}
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
            </button>

            <ul className="flex flex-col gap-2 text-[10px] font-light tracking-[0.18em] uppercase text-muted pt-6 border-t border-cream/[0.06]">
              <li>· Livraison offerte sous {product.deliveryDays}</li>
              <li>· Retour gratuit 15 jours</li>
              <li>· Paiement sécurisé Stripe</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
