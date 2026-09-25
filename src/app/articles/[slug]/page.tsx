import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedArticleBySlug, getAllPublishedSlugs } from "@/lib/data";
import { ArticleContent } from "@/components/katebkar/article-content";
import { SiteFooter } from "@/components/katebkar/site-footer";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const rows = await getAllPublishedSlugs();
  return rows.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) {
    return { title: "مقاله پیدا نشد | کاتب‌کار" };
  }

  const title = article.title;
  const description =
    article.metaDescription || article.excerpt || "مقاله راهنمای کاتب‌کار";
  const keywords = article.keywords
    ? article.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : undefined;
  const url = `/articles/${article.slug}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: "کاتب‌کار",
      publishedTime: article.publishedAt?.toISOString(),
      images: article.coverUrl ? [{ url: article.coverUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.coverUrl ? [article.coverUrl] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription || article.excerpt || undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "کاتب‌کار" },
    publisher: { "@type": "Organization", name: "کاتب‌کار" },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `/articles/${article.slug}`,
    },
    image: article.coverUrl || undefined,
    keywords: article.keywords || undefined,
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <ArticleContent
        title={article.title}
        excerpt={article.excerpt}
        publishedAt={article.publishedAt?.toISOString() ?? null}
        content={article.content}
      />
      <SiteFooter />
    </div>
  );
}
