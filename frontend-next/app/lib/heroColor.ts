"use client";

import type { StaticImageData } from "next/image";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Imports statiques pour bénéficier du blur placeholder Next/Image sur les
// trois couleurs (le LCP reste sur la couleur active, peu importe laquelle
// l'utilisateur a sélectionnée en dernière session).
import heroGrey from "@/public/images/wom-man-grey-stud.png";
import heroBlack from "@/public/images/black/wom-and-man-black.png";
import heroBlue from "@/public/images/blue/wom-man-blue-stud-3-4.png";

export type HeroColor = {
  /** Nom canonique — partagé avec /produit (source de vérité du panier). */
  name: string;
  /** Couleur de la pastille du sélecteur (CSS background). */
  hex: string;
  /** Photo hero du combo femme + homme portant le gilet de cette couleur. */
  hero: StaticImageData;
  /** Miniature panier quand on ajoute depuis la LP (face détourée). */
  cartImage: string;
};

// Mémo : ajouter une couleur ici suffit. Le sélecteur du hero, l'image hero,
// la sticky bar mobile et l'item panier piochent tous dans cette liste.
export const HERO_COLORS: HeroColor[] = [
  {
    name: "Gris perle",
    hex: "#C4C2BE",
    hero: heroGrey,
    cartImage: "/images/product-face.png",
  },
  {
    name: "Noir nuit",
    hex: "#1C1C1A",
    hero: heroBlack,
    cartImage: "/images/black/black-cote.png",
  },
  {
    name: "Bleu pastel",
    hex: "#A7B9D1",
    hero: heroBlue,
    cartImage: "/images/blue/p-blue-cote.png",
  },
];

export function findHeroColor(name: string): HeroColor {
  return HERO_COLORS.find((c) => c.name === name) ?? HERO_COLORS[0];
}

type HeroColorState = {
  color: string;
  /** True dès que l'utilisateur a explicitement choisi une couleur — permet
   *  à la LP de garder la photo originale au premier paint et de ne swap
   *  vers le combo femme + homme qu'après une interaction. */
  picked: boolean;
  setColor: (name: string) => void;
};

// Le nom de la couleur est persisté (utile pour le panier), mais pas le
// flag `picked` : à chaque chargement de page on remet l'image hero solo
// d'origine, et le swap vers le combo ne se fait qu'après une nouvelle
// interaction. Cohérent avec l'expérience "découverte" du LCP initial.
export const useHeroColor = create<HeroColorState>()(
  persist(
    (set) => ({
      color: HERO_COLORS[0].name,
      picked: false,
      setColor: (color) => set({ color, picked: true }),
    }),
    {
      name: "tf_lp_color",
      partialize: (state) => ({ color: state.color }),
    },
  ),
);
