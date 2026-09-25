import type { MetadataRoute } from "next";
import { getAllPublishedSlugs } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.SITE_URL || "https://katebkar.ir";
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const articles = await getAllPublishedSlugs();
  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${siteUrl}/articles/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticEntries, ...articleEntries];
}
