import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, AuthError } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const faqs = await db.faq.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ ok: true, faqs });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[admin/faqs GET] error", err);
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
    const question = String(body.question ?? "").trim();
    const answer = String(body.answer ?? "").trim();
    const order = Number.isFinite(body.order) ? Number(body.order) : 0;
    const published = body.published !== false;

    if (question.length < 3) {
      return NextResponse.json({ ok: false, error: "پرسش را وارد کنید." }, { status: 422 });
    }
    if (answer.length < 3) {
      return NextResponse.json({ ok: false, error: "پاسخ را وارد کنید." }, { status: 422 });
    }

    const faq = await db.faq.create({
      data: { question, answer, order, published },
    });
    return NextResponse.json({ ok: true, faq });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[admin/faqs POST] error", err);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
