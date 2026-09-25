import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, AuthError } from "@/lib/auth";

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

    const data: { question?: string; answer?: string; order?: number; published?: boolean } = {};
    if (body.question !== undefined) data.question = String(body.question).trim();
    if (body.answer !== undefined) data.answer = String(body.answer).trim();
    if (Number.isFinite(body.order)) data.order = Number(body.order);
    if (body.published !== undefined) data.published = !!body.published;

    const updated = await db.faq.update({ where: { id }, data });
    return NextResponse.json({ ok: true, faq: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[admin/faqs PATCH] error", err);
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
    await db.faq.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[admin/faqs DELETE] error", err);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
