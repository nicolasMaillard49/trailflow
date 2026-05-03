# 🏃 TrailFlow

> **Cours plus loin. Bois malin. Reste léger.**
> E-commerce dropshipping mono-produit — gilet hydratation trail & running.

## Stack

**Monorepo** (npm workspaces) :

- **`frontend-next/`** — Next.js 16 (App Router) · React 19 · Tailwind v4 · Framer Motion · Zustand
- **`backend/`** — NestJS · Prisma · PostgreSQL · Stripe (Embedded Checkout) · Resend
- **Hébergement** : Vercel (front) + Railway (back + Postgres)

## Commandes

```bash
# install (à la racine — installe tout via workspaces)
npm install

# front (port 3000)
npm run dev:front

# back (port 3001)
cp backend/.env.example backend/.env
npm run dev:back
```

## Routes

| Route | Rôle |
|-------|------|
| `/` | Landing page |
| `/product/trailflow` | Page produit |
| `/cart` | Panier |
| `/checkout` | Tunnel Stripe |
| `/confirmation` | Page merci |

## Pricing

- Prix de vente : **34,90 €** (barré 49,90 €)
- Achat fournisseur : 7,79 € (AliExpress — Lorey Global Store, ref `1005010186203421`)
- Marge nette estimée (CPA 10€) : ~11 €
- Seuil rentabilité : ~23 commandes/mois pour couvrir 500€ de pub

## Direction artistique

Style **Dark Sport Premium** — réfs : District Vision · Satisfy Running · On Running.
Voir [docs/design.md](docs/design.md) pour la palette complète et la typo.

## Documentation complète

Toute la spec produit, ads, assets et todo est dans le vault Obsidian :
**`D:\obsidian\MonCerveau\Projets\trailflow.md`**

## Référence visuelle

- **Design system** : [docs/design.md](docs/design.md) — palette, typo, composants, tokens CSS
- **Prototype landing** : [landing-prototype/trailflow_v3.html](landing-prototype/trailflow_v3.html) — référence HTML à convertir en composants Next.js
