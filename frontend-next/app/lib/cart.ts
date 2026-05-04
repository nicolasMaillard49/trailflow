"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  size: string;
  /** Couleur sélectionnée — "Gris perle", "Noir nuit", "Bleu pastel". */
  color: string;
  price: number;
  quantity: number;
  image: string;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  add: (item: CartItem) => void;
  remove: (slug: string, size: string, color: string) => void;
  setQuantity: (slug: string, size: string, color: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  total: () => number;
  count: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      add: (item) =>
        set((s) => {
          // Une ligne du panier = combo (slug, size, color). Choisir une autre
          // couleur ou une autre taille crée donc une ligne distincte.
          const idx = s.items.findIndex(
            (i) => i.slug === item.slug && i.size === item.size && i.color === item.color
          );
          if (idx >= 0) {
            const next = [...s.items];
            next[idx] = {
              ...next[idx],
              quantity: next[idx].quantity + item.quantity,
            };
            return { items: next, isOpen: true };
          }
          return { items: [...s.items, item], isOpen: true };
        }),
      remove: (slug, size, color) =>
        set((s) => ({
          items: s.items.filter((i) => !(i.slug === slug && i.size === size && i.color === color)),
        })),
      setQuantity: (slug, size, color, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.slug === slug && i.size === size && i.color === color
              ? { ...i, quantity: Math.max(1, qty) }
              : i
          ),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      total: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "trailflow-cart",
      // Bumper ce numéro à chaque changement non rétro-compatible du shape de
      // CartItem (ajout d'un champ obligatoire, renommage, etc.). Sans version,
      // un changement de schéma casserait silencieusement le panier de tous
      // les clients déjà en cache.
      version: 2,
      partialize: (s) => ({ items: s.items }),
      migrate: (persistedState, fromVersion) => {
        if (fromVersion < 1) {
          // Migration v0 → v1 : on ne peut pas garantir le shape, on repart
          // sur un panier vide plutôt qu'un crash sur `.toFixed()` au render.
          return { items: [] } as { items: CartItem[] };
        }
        if (fromVersion < 2) {
          // v1 → v2 : ajout du champ `color`. On rétro-fitte avec la couleur
          // par défaut plutôt que de wiper le panier.
          const state = persistedState as { items?: Array<Partial<CartItem>> };
          return {
            items: (state.items ?? []).map((i) => ({
              productId: i.productId ?? '',
              slug: i.slug ?? '',
              name: i.name ?? '',
              size: i.size ?? 'M',
              color: i.color ?? 'Gris perle',
              price: i.price ?? 0,
              quantity: i.quantity ?? 1,
              image: i.image ?? '',
            })) as CartItem[],
          };
        }
        return persistedState as { items: CartItem[] };
      },
    }
  )
);
