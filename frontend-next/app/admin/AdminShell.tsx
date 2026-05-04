"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const TOKEN_KEY = "trailflow-admin-token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setReady(true);
      return;
    }
    const token = getAdminToken();
    if (!token) {
      router.replace("/admin/login");
    } else {
      setReady(true);
    }
  }, [pathname, router]);

  // Intercepteur 401 : si une réponse JSON contient "401" ou "Unauthorized",
  // on déconnecte. (Simple — pour vrai refresh, gérer dans api.ts)
  useEffect(() => {
    const handler = (e: PromiseRejectionEvent) => {
      const msg = String(e.reason?.message || "");
      if (msg.includes("API 401") || msg.includes("Unauthorized")) {
        clearAdminToken();
        router.replace("/admin/login");
      }
    };
    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, [router]);

  // Drawer : ferme à chaque changement de route
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Drawer : ESC ferme + lock du scroll body quand ouvert
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  if (!ready) return null;

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const logout = () => {
    clearAdminToken();
    router.replace("/admin/login");
  };

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/orders", label: "Commandes" },
    { href: "/admin/products", label: "Produit" },
    { href: "/admin/bundles", label: "Bundles" },
  ];

  const navMarkup = (
    <>
      <a href="/admin" className="admin-logo">
        Trail<span>Flow</span>
        <small>Back-office</small>
      </a>
      <nav className="admin-nav">
        {links.map((l) => {
          const active =
            l.href === "/admin"
              ? pathname === "/admin"
              : pathname?.startsWith(l.href);
          return (
            <a
              key={l.href}
              href={l.href}
              className={`admin-nav-link${active ? " active" : ""}`}
            >
              {l.label}
            </a>
          );
        })}
      </nav>
      <div className="admin-side-foot">
        <a href="/" target="_blank" className="admin-side-link">
          ↗ Voir le site
        </a>
        <button onClick={logout} className="admin-side-link">
          Déconnexion
        </button>
      </div>
    </>
  );

  // Page courante (pour le titre dans le top bar mobile)
  const currentLink = links.find((l) =>
    l.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(l.href),
  );

  return (
    <div className="admin-shell">
      {/* TOP BAR MOBILE — visible < 900px */}
      <header className="admin-topbar">
        <a href="/admin" className="admin-topbar-logo">
          Trail<span>Flow</span>
        </a>
        <span className="admin-topbar-current">{currentLink?.label ?? ""}</span>
        <button
          type="button"
          className={`admin-burger${drawerOpen ? " is-open" : ""}`}
          onClick={() => setDrawerOpen((v) => !v)}
          aria-label={drawerOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={drawerOpen}
        >
          <span /><span /><span />
        </button>
      </header>

      {/* SIDEBAR DESKTOP — sticky, visible ≥ 900px */}
      <aside className="admin-side">{navMarkup}</aside>

      {/* DRAWER MOBILE — slide-in, visible < 900px quand drawerOpen */}
      <div
        className={`admin-drawer-backdrop${drawerOpen ? " is-open" : ""}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`admin-drawer${drawerOpen ? " is-open" : ""}`}
        aria-hidden={!drawerOpen}
      >
        {navMarkup}
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}
