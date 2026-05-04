# Spec — Upsell Pack 2 flasques 500ml sur `/produit`

**Date** : 2026-05-04
**Auteur** : Nicolas (NMF Agence) + Claude
**Statut** : Validé, prêt pour implémentation

## Contexte

La page produit `/produit` vend le gilet hydratation TrailFlow. Sa fiche mentionne explicitement « Compatible flasques soft flask 500ml (non incluses) » et un avis client visible (Marc L., 4★) reproche cette absence. Côté DB, un bundle « Pack Hydratation » est déjà seedé mais jamais exposé en UI.

Objectif : proposer **2 flasques souples 500ml** en upsell sur la page produit, sans friction, avec un take-rate ciblé 8–15 % et un AOV +15–20 %.

## Décisions de cadrage

| Décision | Choix retenu |
|---|---|
| Format | Add-on cochable (pas de bundle, pas de page produit dédiée) |
| Prix | **15 €** TTC pour le pack de 2 flasques 500 ml |
| État par défaut | **Décoché** — conforme art. L121-17 Code conso, zéro risque DGCCRF |
| Placement | **Entre la sélection Taille et le bloc Qty/CTA** (placement « B » du brainstorm) |
| Couplage | Ajout au panier conjoint au clic sur le CTA principal de la veste |
| Modèle data | Nouveau `Product` Prisma (pas de bundle, pas d'add-on hardcodé) |
| Vente standalone | Non — uniquement en upsell sur `/produit` |

## 1. Modèle de données

### Nouveau Product seed

```ts
{
  slug: "pack-flasques-500ml",
  name: "Pack 2 flasques 500ml",
  description: "Deux flasques souples 500ml compatibles TrailFlow. Bouchon push-pull, dragonne intégrée.",
  price: 15,
  comparePrice: null,
  costPrice: 3.50,           // achat fournisseur estimé (les 2)
  image: "/images/flasks/pack-2-flasks.png",
  active: true,
}
```

Pas de migration Prisma : le schéma `Product` actuel suffit.
Pas d'entrée `Bundle` / `BundleItem` (le système Bundle reste inutilisé).

### OrderItem

L'`OrderItem` existant (avec `size?` et `color?` nullables ajoutés dans la migration `20260504140000_orderitem_size_color`) accepte naturellement la ligne flasques avec `size = null`, `color = null`.

**Convention pour le pipeline checkout** : le `CartItem` côté front exige des strings non-nulles ; pour la ligne flasques, le store envoie `size: ""` et `color: ""`. Le DTO `CreateCheckoutDto` accepte ces valeurs (déclarées `IsOptional`), et `payments.service.createCheckoutSession()` doit normaliser `"" → null` avant `OrderItem.create({ data: { size: ..., color: ... } })`. À couvrir dans le plan d'implémentation.

### Fulfillment / fournisseur

`Product.costPrice = 3.50 €` (estimation AliExpress 2 × ~1,75 €) → marge nette ~9 € par pack après frais Stripe et port mutualisé. Ajustable via le back-office quand le vrai prix d'achat est connu.

## 2. Frontend — composant upsell

### Localisation

`frontend-next/app/produit/page.tsx` — bloc inséré entre :
- (existant) `<div className="option-block">` Taille
- (existant) `<div className="qty-cta">` Qty + CTA

Pas de nouveau fichier composant : on reste dans `page.tsx` pour ne pas multiplier les exports.

### État local

Ajout dans `ProduitPage` :

```ts
const [addonChecked, setAddonChecked] = useState(false);
const [addonProduct, setAddonProduct] = useState<Product | null>(null);
```

### Fetch addon

Au mount, fetch parallèle au fetch veste, même pattern (3 retries exponentiels, parser `parseProduct`) :

```ts
api("/products/pack-flasques-500ml", { parse: parseProduct })
  .then(setAddonProduct)
  .catch(() => { /* silencieux : l'add-on est secondaire */ });
```

Si le fetch échoue après les retries, `addonProduct` reste `null` et la card est masquée — la veste reste vendable.

### Markup

```html
<label className="upsell-addon" data-checked={addonChecked}>
  <input type="checkbox" checked={addonChecked} onChange={...} />
  <Image src="/images/flasks/pack-2-flasks.png" width={44} height={44} alt="..." />
  <div>
    <div className="upsell-name">Pack 2 flasques 500ml</div>
    <div className="upsell-meta">Compatible TrailFlow · Push-pull</div>
  </div>
  <div className="upsell-price">+{addonProduct.price}€</div>
</label>
```

- `<label>` enveloppant : toute la card est cliquable.
- `<input>` réel pour l'a11y (clavier, lecteurs d'écran).
- Si `addonProduct === null` ⇒ rien rendu.

### Styles (`app/globals.css`)

- État repos : `border: 0.5px solid rgba(240,237,232,0.2)`, fond transparent.
- État coché : `border-color: #F0EDE8`, `background: rgba(240,237,232,0.04)`, checkbox remplie cream avec coche ink.
- Transition `200ms ease` sur `border-color` et `background-color`.
- Reset visuel par défaut sur `input[type="checkbox"]` + custom box (cohérent avec la DA Dark Sport Premium).

### Comportement au CTA "Ajouter au panier"

Modifier `handleAdd()` :

```ts
addItem({ /* veste */ });
if (addonChecked && addonProduct) {
  addItem({
    productId: addonProduct.id,
    slug: addonProduct.slug,
    name: addonProduct.name,
    size: "",                          // pas de size
    color: "",                         // pas de color
    price: addonProduct.price,
    quantity: 1,                       // toujours 1, indépendant de qty veste
    image: "/images/flasks/pack-2-flasks.png",
  });
  trackEvent("AddToCart", {
    content_name: addonProduct.name,
    content_ids: addonProduct.id,
    value: addonProduct.price,
    currency: "EUR",
  });
}
showToast(addonChecked
  ? `Gilet TrailFlow + 2 flasques ajoutés au panier`
  : `Gilet TrailFlow ajouté au panier`);
```

**Note cart.ts** : le store keye les lignes par `(slug, size, color)`. Pour le pack flasques, `size = ""` et `color = ""` ⇒ une seule ligne flasques peut exister, recliquer sur le CTA avec la case cochée incrémente sa quantité (cohérent avec la veste).

### Quantité

- Le stepper Qty existant agit **uniquement sur la veste**.
- Le pack flasques est ajouté **qty 1** quel que soit le qty veste, pour éviter une surprise sur la facture (cas : un coureur achète 2 vestes pour son couple n'a pas forcément besoin de 4 flasques).

### Mobile

- La card prend 100 % de la largeur du `info-side`, padding identique aux autres `option-block`.
- Le sticky CTA mobile bas n'inclut **pas** la case (sinon surcharge). L'add-on doit être visible pendant le scroll de la page produit.

## 3. Backend — Stripe + emails

### Stripe Checkout

`payments.service.createCheckoutSession()` itère déjà sur `dto.items` pour produire les `line_items` Stripe et les `OrderItem`. Aucun changement requis : envoyer `[veste, flasques]` au lieu de `[veste]` produit naturellement 2 line_items + 2 OrderItems.

Le DTO `CreateCheckoutDto` accepte déjà `size?` et `color?` optionnels — la ligne flasques les omet.

### Webhook

Aucun changement. L'idempotence (`ProcessedStripeEvent`) et la transition `PENDING → PAID` (via `updateMany`) restent inchangées.

### Email confirmation

Le template `order-confirmation.ts` itère déjà sur `order.items`. Les chips `Coloris` / `Taille` ne sont rendus que si les champs sont renseignés (déjà conditionnels). Pour la ligne flasques, seul le chip `Quantité 1` apparaît.

### Email expédition

Idem, itération sur les items existante. Un seul tracking, deux items listés.

### Admin back-office

`/admin/orders` affiche déjà les OrderItems d'une commande — la ligne flasques apparaît automatiquement avec son nom, qty et prix. Aucun changement controller/UI back-office.

## 4. Visuel produit

Créer `frontend-next/public/images/flasks/pack-2-flasks.png` à partir du visuel ChatGPT fourni :
- 2 flasques souples 500 ml côte à côte
- Détourées fond noir (matche le thème Ink #0E0E0C)
- Format carré, ~600 × 600 px
- Optimisée pour Next/Image (compression AVIF auto à la build)

## 5. Tests

### Backend

Étendre `backend/src/payments/payments.service.spec.ts` :

- **Nouveau cas** : `createCheckoutSession` avec 2 items (veste + flasques)
  - Vérifier 2 `OrderItem` créés, dont 1 avec `size=null, color=null`.
  - Vérifier 2 `line_items` envoyés à Stripe.
  - Vérifier `amount_total` = veste + 15 €.

Aucun nouveau test webhook (logique inchangée).

### Frontend

Pas de tests automatisés (alignement avec le reste du projet — la veste n'en a pas non plus). Validation manuelle :
- Cocher / décocher → bordure et fond changent.
- Cliquer CTA avec case cochée → 2 lignes dans le panier.
- Refresh page → addon décoché à nouveau (état non persisté volontairement).
- Network down sur addon fetch → card masquée, veste vendable.

## 6. Analytics

- `trackEvent("AddToCart")` distinct pour le pack flasques avec `content_ids: "pack-flasques-500ml"`.
- Take-rate mesurable post-prod via `OrderItem.where({ productId: <flask> })` rapporté à `Order.where({ status: PAID })` sur la même fenêtre.
- Pas de table dédiée take-rate.

## 7. Rollout

1. Seed étendu avec le nouveau `Product`.
2. Image copiée dans `public/images/flasks/`.
3. Backend déployé d'abord (le front fetch `pack-flasques-500ml` au mount).
4. **Exécuter `npx prisma db seed` en prod** après déploiement back (sinon le Product n'existe pas et la card reste silencieusement masquée). Alternative : créer le Product via une console Railway / un script idempotent dans le release pipeline.
5. Front déployé ensuite.
6. Test manuel d'une commande avec flasques en MailHog dev avant la mise en prod.
7. Premier passage prod : surveiller la première commande avec flasques (logs Stripe + MailHog → Resend).

Pas de feature flag — l'add-on est silencieux si le produit n'est pas en BDD, donc rollback = `Product.active = false`.

## Hors scope

- Page produit dédiée flasques (`/produit/pack-flasques-500ml`)
- Vente individuelle (1 flasque seule)
- Bundle "Pack Hydratation" via le système `Bundle`/`BundleItem`
- Cocher par défaut + dark patterns
- Multi-colis fournisseur
- Gestion stock
- Remboursement partiel automatisé (process Stripe Dashboard manuel)
