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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const article = await db.article.findUnique({ where: { id } });
    if (!article) {
      return NextResponse.json({ ok: false, error: "مقاله پیدا نشد." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, article });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[admin/articles GET one] error", err);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "درخواست نامعتبر" }, { status: 400 });
    }

    const data: {
      title?: string;
      slug?: string;
      excerpt?: string | null;
      content?: string;
      metaDescription?: string | null;
      keywords?: string | null;
      coverUrl?: string | null;
      published?: boolean;
      publishedAt?: Date | null;
    } = {};

    if (body.title !== undefined) data.title = String(body.title).trim();
    if (body.content !== undefined) data.content = String(body.content);
    if (body.excerpt !== undefined) data.excerpt = body.excerpt ? String(body.excerpt).trim() : null;
    if (body.metaDescription !== undefined)
      data.metaDescription = body.metaDescription ? String(body.metaDescription).trim() : null;
    if (body.keywords !== undefined) data.keywords = body.keywords ? String(body.keywords).trim() : null;
    if (body.coverUrl !== undefined) data.coverUrl = body.coverUrl ? String(body.coverUrl).trim() : null;

    if (body.slug !== undefined) {
      let slug = String(body.slug).trim().toLowerCase() || slugify(data.title || "");
      if (slug) {
        let finalSlug = slug;
        let suffix = 1;
        while (
          (await db.article.findFirst({
            where: { slug: finalSlug, NOT: { id } },
            select: { id: true },
          }))
        ) {
          finalSlug = `${slug}-${suffix++}`;
        }
        data.slug = finalSlug;
      }
    }

    if (body.published !== undefined) {
      const published = !!body.published;
      data.published = published;
      // Set publishedAt when transitioning to published
      if (published) data.publishedAt = new Date();
    }

    const updated = await db.article.update({
      where: { id },
      data,
      select: { id: true, slug: true, title: true, published: true },
    });

    return NextResponse.json({ ok: true, article: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[admin/articles PATCH] error", err);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.article.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[admin/articles DELETE] error", err);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
