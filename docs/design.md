# TrailFlow — Design System
> Version 3.0 · Landing page référence · Mai 2026

---

## Identité visuelle

### Positionnement
Dark Sport Premium — entre l'éditorial de mode et la performance technique.
Références : District Vision · Satisfy Running · On Running · Arc'teryx

### Principe directeur
> Chaque élément respire. Rien n'est crié. Le produit parle.

Espacement généreux, typographie fine, couleurs retenues.
Le contraste vient de la tension entre le fond sombre et la matière du produit.

---

## Couleurs

### Palette principale
```
--ink        #0E0E0C   Fond principal — noir chaud (pas pur noir)
--ink-soft   #1C1C1A   Fond sections alternées
--cream      #F0EDE8   Texte principal · boutons CTA · logo
--cream-dk   #D8D4CE   Texte secondaire · citations · stats
--muted      #7A7872   Labels · eyebrows · métadonnées
--muted-lt   #ABA9A4   Body text · descriptions
--silver     #C4C2BE   Accents produit · dividers
--white      #FFFFFF   Titres hero · emphase forte
--green      #2A7A5A   Badges promo · validation · success
```

### Usages
| Élément | Couleur |
|---|---|
| Background page | `--ink` |
| Background sections alt | `--ink-soft` |
| Headlines | `--cream` / `--white` (emphase) |
| Body text | `--muted-lt` |
| Labels / eyebrows | `--muted` |
| Prix barré | `--muted` |
| Prix actuel | `--cream` |
| Badge promo | `--green` + border `rgba(42,122,90,0.35)` |
| CTA bouton bg | `--cream` |
| CTA bouton texte | `--ink` |
| Borders subtils | `rgba(240,237,232,0.06)` |
| Borders hover | `rgba(240,237,232,0.15)` |
| Overlay dégradé | `rgba(14,14,12,0.92)` → transparent |

---

## Typographie

### Familles
```
Display   → Cormorant Garamond
           Google Fonts · weights 300, 400
           Styles : normal + italic

UI / Body → Geist
           Google Fonts · weights 200, 300, 400, 500
```

### Échelle de taille
```
Hero H1        clamp(50px, 5.2vw, 80px)   Cormorant 300 italic
Section H2     clamp(30px, 2.8vw, 46px)   Cormorant 300
Section H2 em  même taille                 Cormorant 300 italic · color --muted-lt
Logo           22px                        Cormorant 300 · tracking 0.22em
Prix hero      28px                        Cormorant 400 · tracking 0.02em
Prix barré     18px                        Cormorant 300 · line-through
Prix nav       17px                        Cormorant 300 · tracking 0.04em
Prix CTA       32px                        Cormorant 400 · tracking 0.02em
Stat number    50px                        Cormorant 300 · tracking -0.02em
Review quote   17px                        Cormorant 300 italic
Body text      13–15px                     Geist 300 · line-height 1.8
Nav links      11px                        Geist 300 · tracking 0.18em · uppercase
Eyebrows       10px                        Geist 300 · tracking 0.28em · uppercase
Labels         10px                        Geist 300 · tracking 0.20–0.32em · uppercase
Badges         10px                        Geist 300 · tracking 0.14em · uppercase
Feature nums   11px                        Cormorant 300 · tracking 0.1em
Strip          10px                        Geist 300 · tracking 0.22em · uppercase
Footer links   10px                        Geist 300 · tracking 0.15em · uppercase
```

### Règles typographiques
- Line-height body : `1.8`
- Line-height headlines : `1.05–1.12`
- Letter-spacing headlines : `-0.01em` (légèrement serré)
- Jamais de bold écrasant sur les headlines — poids 300 ou 400 uniquement
- Les `<em>` dans les titres = italic Cormorant + `color: --muted-lt`
- Les `<strong>` dans les titres = Cormorant 400 normal + `color: --white`
- `-webkit-font-smoothing: antialiased` obligatoire sur body

---

## Espacement

### Padding sections
```
Desktop  140px top/bottom · 56px left/right
Mobile   80px top/bottom · 24px left/right
```

### Gaps grille
```
Hero grid gap        0 (colonnes collées)
Features grid gap    80px
Gallery grid gap     6px
Reviews grid gap     2px (effet "tableau de bord")
Stats border         0.5px (pas de gap — border-right)
Split grid gap       16px
```

### Padding intérieur composants
```
Nav                  20px 56px
Review card          36px
Stat block           40px
Feat item            22px 0
CTA section          180px 56px
Footer               48px 56px
```

---

## Layout

### Grilles principales

**Hero** — 2 colonnes `1fr 1fr`
- Gauche : image plein cadre `object-fit: cover`
- Droite : contenu texte, flex column, `justify-content: flex-end`

**Features** — 2 colonnes `1fr 1fr` · gap 80px · `align-items: center`

**Gallery** — 3 colonnes `1.6fr 1fr 1fr` · 2 rangées `320px 320px`
- Première cellule : `grid-row: span 2` (image dominante)

**Reviews** — 3 colonnes `repeat(3, 1fr)` · gap `2px`

**Stats** — 4 colonnes `repeat(4, 1fr)` · séparés par `border-right 0.5px`

**Split** — 2 colonnes `1fr 1fr` · gap `16px` · `aspect-ratio: 3/4`

---

## Composants

### Nav
```
Position : fixed top 0 · z-index 200
État par défaut : transparent · border-bottom transparent
État scrolled : background rgba(14,14,12,0.94) · backdrop-filter blur(20px)
               border-bottom rgba(240,237,232,0.06)
Transition : 0.4s sur background et border-color

Contenu gauche : Logo (Cormorant 300 · tracking 0.22em · uppercase)
Contenu droit  : nav-link · nav-price · nav-btn

nav-price : <s>49,90€</s> 34,90€ — Cormorant 300 · 17px
nav-btn   : fond --cream · texte --ink · padding 11px 24px · border-radius 2px
```

### Prix (règle universelle)
```
Toujours en Cormorant Garamond 300–400
Jamais isolé en très grand corps
Toujours accompagné du prix barré + badge

Structure :
  <span class="price-was">49,90€</span>    → muted · line-through · 18–20px
  <span class="price-now">34,90€</span>    → cream · 28–32px
  <span class="price-badge">− 30%</span>   → green · border green 0.5px · 10px · uppercase
```

### Bouton primaire (btn-primary)
```
Background    : --cream
Texte         : --ink · Geist 400 · 11px · tracking 0.2em · uppercase
Padding       : 18px 40px
Border-radius : 2px
Icône         : flèche droite SVG stroke --ink · 14px
Hover         : opacity 0.88 · translateY(-1px)
Transition    : 0.2s opacity + transform
```

### Section eyebrow
```
Geist 300 · 10px · tracking 0.28em · uppercase · color --muted
display: block · margin-bottom: 20px
Jamais de couleur d'accent — toujours --muted
```

### Feature item
```
Layout : flex row · gap 24px
Numéro : Cormorant 300 · 11px · tracking 0.1em · color --muted · min-width 20px
Titre  : Geist 400 · 14px · color --cream · margin-bottom 5px
Desc   : Geist 300 · 12px · color --muted-lt · line-height 1.7
Séparateurs : border-bottom 0.5px rgba(240,237,232,0.07)
```

### Gallery item
```
overflow: hidden · border-radius: 3px · background: #1A1A18
Image : object-fit cover · transition transform 0.6s cubic-bezier(0.16,1,0.3,1)
Hover : transform scale(1.04)
Label : position absolute · bottom 12px left 12px
        Geist 300 · 9px · tracking 0.2em · uppercase
        color rgba(240,237,232,0.35)
        background rgba(14,14,12,0.4) · padding 2px 7px · border-radius 2px
```

### Review card
```
Background : rgba(240,237,232,0.03)
Border     : 0.5px solid rgba(240,237,232,0.06)
Padding    : 36px
Pas de border-radius (effet "tableau de bord" avec gap 2px)

Stars  : Geist · 11px · color --cream-dk · letter-spacing 4px
Quote  : Cormorant 300 italic · 17px · line-height 1.65 · color --cream-dk
Author : Geist 300 · 10px · tracking 0.15em · uppercase · color --muted
```

### Split card (homme/femme)
```
aspect-ratio: 3/4 · overflow: hidden · border-radius: 3px
Image : object-fit cover · object-position: top · transition transform 0.7s
Hover : scale(1.03)
Dégradé overlay : linear-gradient(to top, rgba(14,14,12,0.92) 0%, transparent 100%)
                  height: 55% · position absolute bottom

Kicker : Geist 300 · 9px · tracking 0.3em · uppercase · color --muted
Name   : Cormorant 300 · 26px · color --cream
Desc   : Geist 300 · 11px · color --muted-lt · line-height 1.6
```

### Strip défilant
```
border-top + border-bottom : 0.5px solid rgba(240,237,232,0.06)
padding: 15px 0

Item : Geist 300 · 10px · tracking 0.22em · uppercase · color --muted
       padding: 0 40px · border-right 0.5px rgba(240,237,232,0.07)
strong : color --cream-dk · font-weight 400 · margin-right 6px

Animation : marquee 30s linear infinite
@keyframes marquee : translateX(0) → translateX(-50%)
Contenu dupliqué ×2 pour boucle seamless
```

---

## Animations

### Principes
- 1 animation d'entrée de page orchestrée (hero)
- Hover states surprenants mais sobres
- Pas d'animation au scroll (pas de IntersectionObserver) pour garder la légèreté

### Hero reveal (image)
```css
animation: heroReveal 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards
from : transform scale(1.08) · opacity 0.6
to   : transform scale(1.0)  · opacity 1
```

### Hero content (stagger)
```css
animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both
delays : 0.3s · 0.45s · 0.6s · 0.7s · 0.8s · 0.9s

@keyframes fadeUp :
  from : opacity 0 · translateY(20px)
  to   : opacity 1 · translateY(0)
```

### Hover images galerie & split
```css
transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)
hover     : scale(1.03–1.04)
```

### Courbe easing standard
```
cubic-bezier(0.16, 1, 0.3, 1)  — spring naturel, décélération douce
```

---

## Borders & Séparateurs

```
Borders subtils       : 0.5px solid rgba(240,237,232,0.06)
Borders hover/actif   : 0.5px solid rgba(240,237,232,0.15)
Border-radius standard: 2–3px (très peu — design angulaire)
Border-radius boutons : 2px
Border-radius galerie : 3px
Border-radius badges  : 2px
Jamais de border-radius > 4px — trop "app", pas assez "éditorial"
```

---

## Responsive

### Breakpoint unique : 900px

**En dessous de 900px :**
```
Nav          : padding 16px 24px · nav-price et nav-link masqués
Hero         : grid 1 colonne · hero-media height 65vw
               overlay → gradient to top (pas to right)
               hero-index masqué
Features     : grid 1 colonne · gap 56px
Gallery      : 2 colonnes · gi.span2 → span 2 colonnes pleine largeur
Reviews      : 1 colonne
Stats        : 2 colonnes
Split        : 1 colonne
Sections     : padding 80px 24px
Footer       : flex-direction column · padding 32px 24px
```

---

## Assets images

### Format attendu
- Fond neutre : blanc `#FFFFFF` ou gris clair `#F5F5F3`
- Résolution minimale : 1200px sur le grand côté
- Format : PNG (transparence si possible) ou JPG haute qualité
- `object-fit: cover` partout — cadrer le sujet en haut

### Mapping sections → images
```
Hero              → wom_studio.png (femme, plein cadre)
Features img main → Gemini face fond blanc
Features detail   → Gemini détail boucle + réfléchissant
Gallery [0] large → Gemini face avec flasque (span 2 rows)
Gallery [1]       → Gemini 3/4 avant
Gallery [2]       → Gemini côté droit
Gallery [3]       → Gemini dos
Gallery [4]       → Gemini côté gauche
Split gauche      → wom_studio.png
Split droite      → man_studio.png
```

---

## Ce qu'il ne faut PAS faire

```
✗ Police Inter, Roboto, Arial, Space Grotesk
✗ Gradient violet/bleu sur fond blanc
✗ Prix en très grand corps isolé (style "49€ !!!")
✗ border-radius > 4px sur les cards
✗ Shadows portées lourdes visibles
✗ Couleurs d'accent flashy (orange, rouge, jaune)
✗ Bold sur les headlines (max weight 400)
✗ Sections sans respiration (padding < 80px)
✗ Texte > 15px pour le body
✗ Plus d'une couleur d'accent (seul le vert est utilisé)
✗ Animations au scroll parasites
```

---

## Tokens CSS (variables à déclarer dans :root)

```css
:root {
  /* Colors */
  --ink:       #0E0E0C;
  --ink-soft:  #1C1C1A;
  --cream:     #F0EDE8;
  --cream-dk:  #D8D4CE;
  --muted:     #7A7872;
  --muted-lt:  #ABA9A4;
  --silver:    #C4C2BE;
  --white:     #FFFFFF;
  --green:     #2A7A5A;

  /* Typography */
  --font-display: 'Cormorant Garamond', serif;
  --font-ui:      'Geist', sans-serif;

  /* Spacing */
  --section-pad-v: 140px;
  --section-pad-h: 56px;
  --section-pad-v-mobile: 80px;
  --section-pad-h-mobile: 24px;

  /* Borders */
  --border-subtle:  0.5px solid rgba(240,237,232,0.06);
  --border-hover:   0.5px solid rgba(240,237,232,0.15);
  --radius-sm:      2px;
  --radius-md:      3px;

  /* Easing */
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

*Document généré le 3 mai 2026 — TrailFlow Design System v3*
