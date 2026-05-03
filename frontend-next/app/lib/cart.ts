"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  add: (item: CartItem) => void;
  remove: (slug: string, size: string) => void;
  setQuantity: (slug: string, size: string, qty: number) => void;
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
          const idx = s.items.findIndex(
            (i) => i.slug === item.slug && i.size === item.size
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
      remove: (slug, size) =>
        set((s) => ({
          items: s.items.filter((i) => !(i.slug === slug && i.size === size)),
        })),
      setQuantity: (slug, size, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.slug === slug && i.size === size
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
    { name: "trailflow-cart", partialize: (s) => ({ items: s.items }) }
  )
);
