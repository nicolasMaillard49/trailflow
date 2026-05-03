"use client";

import { create } from "zustand";
import { useEffect } from "react";

type Toast = { id: number; message: string };

type ToastState = {
  toasts: Toast[];
  push: (message: string) => void;
  dismiss: (id: number) => void;
};

let nextId = 1;

const useToasts = create<ToastState>((set) => ({
  toasts: [],
  push: (message) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, message }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Helper utilisable de partout. */
export function showToast(message: string) {
  useToasts.getState().push(message);
}

/** À monter une fois dans le RootLayout. */
export function ToastHost() {
  const toasts = useToasts((s) => s.toasts);
  const dismiss = useToasts((s) => s.dismiss);

  // Cleanup défensif
  useEffect(() => () => useToasts.setState({ toasts: [] }), []);

  return (
    <div className="toast-host" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <button
          key={t.id}
          className="toast"
          onClick={() => dismiss(t.id)}
          aria-label="Fermer la notification"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{t.message}</span>
        </button>
      ))}
    </div>
  );
}
