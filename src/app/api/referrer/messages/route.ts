import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, AuthError } from "@/lib/auth";

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

/** GET: referrer reads their conversation history with admin. */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.kind !== "referrer" || !session.code) {
      throw new AuthError("ورود معرف لازم است.", 401);
    }
    const messages = await db.message.findMany({
      where: { referrerCode: session.code },
      orderBy: { createdAt: "asc" },
      take: 200,
    });
    // Mark admin messages as read when referrer opens the thread
    await db.message.updateMany({
      where: {
        referrerCode: session.code,
        senderType: "admin",
        readAt: null,
      },
      data: { readAt: new Date() },
    });
    return NextResponse.json({
      ok: true,
      messages: messages.map((m) => ({
        id: m.id,
        senderType: m.senderType,
        body: m.body,
        dateLabel: formatDate(m.createdAt),
        mine: m.senderType === "referrer",
      })),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[referrer/messages GET] error", err);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}

/** POST: referrer sends a message to admin. */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.kind !== "referrer" || !session.code) {
      throw new AuthError("ورود معرف لازم است.", 401);
    }
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
        referrerCode: session.code,
        senderType: "referrer",
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
    console.error("[referrer/messages POST] error", err);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
