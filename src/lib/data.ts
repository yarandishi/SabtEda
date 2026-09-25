import "server-only";
import { db } from "@/lib/db";

/** Fetch published FAQs ordered for public display (server-side). */
export async function getPublishedFaqs() {
  return db.faq.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    select: { id: true, question: true, answer: true },
  });
}

/** Fetch published articles summary list (for the articles index page). */
export async function getPublishedArticles() {
  return db.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverUrl: true,
      publishedAt: true,
    },
  });
}

/** Fetch a single published article by slug (server-side). */
export async function getPublishedArticleBySlug(slug: string) {
  return db.article.findFirst({
    where: { slug, published: true },
  });
}

/** All published article slugs (for sitemap + generateStaticParams). */
export async function getAllPublishedSlugs() {
  const rows = await db.article.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });
  return rows;
}
