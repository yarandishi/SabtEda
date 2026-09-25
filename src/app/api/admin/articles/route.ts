import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, AuthError } from "@/lib/auth";

function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function GET() {
  try {
    await requireAdmin();
    const articles = await db.article.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        published: true,
        publishedAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ ok: true, articles });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[admin/articles GET] error", err);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "درخواست نامعتبر" }, { status: 400 });
    }

    const title = String(body.title ?? "").trim();
    const content = String(body.content ?? "");
    const excerpt = body.excerpt ? String(body.excerpt).trim() : null;
    const metaDescription = body.metaDescription ? String(body.metaDescription).trim() : null;
    const keywords = body.keywords ? String(body.keywords).trim() : null;
    const coverUrl = body.coverUrl ? String(body.coverUrl).trim() : null;
    const published = !!body.published;
    let slug = body.slug ? String(body.slug).trim().toLowerCase() : slugify(title);
    if (!slug) slug = slugify(title);
    if (!slug) {
      return NextResponse.json({ ok: false, error: "عنوان یا slug معتبر وارد کنید." }, { status: 422 });
    }

    // Ensure slug uniqueness
    let finalSlug = slug;
    let suffix = 1;
    while (await db.article.findUnique({ where: { slug: finalSlug }, select: { id: true } })) {
      finalSlug = `${slug}-${suffix++}`;
    }

    const article = await db.article.create({
      data: {
        slug: finalSlug,
        title,
        excerpt,
        content,
        metaDescription,
        keywords,
        coverUrl,
        published,
        publishedAt: published ? new Date() : null,
      },
    });

    return NextResponse.json({ ok: true, article: { id: article.id, slug: article.slug } });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[admin/articles POST] error", err);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
