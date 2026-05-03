import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://trailflow.boutique";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/produit`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/cgv`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/retours`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];
}
