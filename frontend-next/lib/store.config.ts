/**
 * TrailFlow store config — contenu éditable (pas la DA, qui est codée dans les composants).
 * Pour PAWLY/template = tout dans un mega-config. Ici : seul ce qui change vraiment.
 */

export const storeConfig = {
  identity: {
    name: "TRAILFLOW",
    tagline: "Cours plus loin. Bois malin. Reste léger.",
    contactEmail: "contact@trailflow.shop",
    instagram: "https://instagram.com/trailflow",
    tiktok: "https://tiktok.com/@trailflow",
  },

  product: {
    slug: "gilet-trailflow",
    name: "Gilet TrailFlow",
    price: 34.9,
    originalPrice: 49.9,
    discount: 30,
    currency: "€",
    sizes: ["S", "M", "L", "XL"] as const,
    deliveryDays: "5–7 jours",
  },

  features: [
    {
      n: "01",
      title: "Mesh réfléchissant 360°",
      desc: "Visibilité totale en sortie nocturne. Bandes réfléchissantes sur les bretelles + nid d'abeille intégral.",
    },
    {
      n: "02",
      title: "2 poches avant flasques",
      desc: "Élastiques ajustées. Compatibles flasques 500ml ou tubes de gels. Accès sans rupture de foulée.",
    },
    {
      n: "03",
      title: "Poche zippée téléphone",
      desc: "Smartphone XL + clés. Zip étanche. Aucun ballottement même sur trail technique.",
    },
    {
      n: "04",
      title: "Boucles click double",
      desc: "Ajustement millimétrique poitrine + abdomen. Click sécurité. Reste plaqué jusqu'au marathon.",
    },
  ],

  gallery: [
    { src: "/images/product-face-sol.png", label: "Face avec flasque", span: true },
    { src: "/images/product-3quart.png", label: "3/4 avant", span: false },
    { src: "/images/product-cote-droit.png", label: "Côté droit", span: false },
    { src: "/images/product-dos.png", label: "Dos", span: false },
    { src: "/images/product-cote-gauche.png", label: "Côté gauche", span: false },
  ],

  reviews: [
    {
      stars: 5,
      quote:
        "Léger, ultra ajustable. Aucun rebond sur 30 km de trail technique. Le mesh respire vraiment.",
      author: "Mathieu L. · Marathon Mont-Blanc",
    },
    {
      stars: 5,
      quote:
        "Les flasques restent en place, le téléphone aussi. Visibilité dingue à la frontale.",
      author: "Sarah V. · Trail nocturne",
    },
    {
      stars: 4,
      quote:
        "Rapport qualité-prix imbattable. Comparé à mon Salomon, la coupe est aussi nette.",
      author: "Antoine R. · Semi-marathon",
    },
  ],

  stats: [
    { number: "5K+", label: "Coureurs équipés" },
    { number: "4.7", label: "Note moyenne" },
    { number: "477", label: "Avis vérifiés" },
    { number: "15j", label: "Retour gratuit" },
  ],

  split: [
    {
      kicker: "FEMME",
      name: "Anna",
      desc: "Coupe ajustée bretelles fines. Brassière compatible. Tailles S à L.",
      image: "/images/wom-studio.png",
    },
    {
      kicker: "HOMME",
      name: "Léo",
      desc: "Coupe large dos respirant. T-shirt tech intégré. Tailles M à XL.",
      image: "/images/man-studio.png",
    },
  ],

  strip: [
    "LIVRAISON OFFERTE FRANCE",
    "RETOUR 15 JOURS GRATUIT",
    "PAIEMENT SÉCURISÉ STRIPE",
    "STOCK ULTRA-LIMITÉ",
    "EXPÉDIÉ SOUS 24H",
    "5K+ COUREURS ÉQUIPÉS",
  ],
};

export type StoreConfig = typeof storeConfig;
