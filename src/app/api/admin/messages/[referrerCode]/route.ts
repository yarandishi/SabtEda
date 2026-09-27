import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, AuthError } from "@/lib/auth";

function formatDate(d: Date): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

/** GET: admin reads full conversation with a specific referrer. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ referrerCode: string }> }
) {
  try {
    await requireAdmin();
    const { referrerCode } = await params;
    const code = referrerCode.toUpperCase();

    const referrer = await db.referrer.findUnique({
      where: { code },
      select: { code: true, displayName: true, contact: true },
    });

    const messages = await db.message.findMany({
      where: { referrerCode: code },
      orderBy: { createdAt: "asc" },
      take: 500,
    });
    // Mark referrer messages as read when admin opens the thread
    await db.message.updateMany({
      where: { referrerCode: code, senderType: "referrer", readAt: null },
      data: { readAt: new Date() },
    });

    return NextResponse.json({
      ok: true,
      referrer: referrer
        ? { code: referrer.code, displayName: referrer.displayName, contact: referrer.contact }
        : { code, displayName: null, contact: null },
      messages: messages.map((m) => ({
        id: m.id,
        senderType: m.senderType,
        body: m.body,
        dateLabel: formatDate(m.createdAt),
        mine: m.senderType === "admin",
      })),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[admin/messages/[code] GET] error", err);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}

/** POST: admin replies to a referrer. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ referrerCode: string }> }
) {
  try {
    await requireAdmin();
    const { referrerCode } = await params;
    const code = referrerCode.toUpperCase();
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "درخواست نامعتبر" }, { status: 400 });
    }
    const text = String(body.body ?? "").trim();
    if (text.length < 1) {
      return NextResponse.json({ ok: false, error: "پیام خالی است." }, { status: 422 });
    }
    const message = await db.message.create({
      data: {
        referrerCode: code,
        senderType: "admin",
        body: text.slice(0, 2000),
      },
    });
    return NextResponse.json({
      ok: true,
      message: {
        id: message.id,
        senderType: message.senderType,
        body: message.body,
        dateLabel: formatDate(message.createdAt),
        mine: true,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[admin/messages/[code] POST] error", err);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
