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

/** GET: admin sees the list of all conversations (one per referrer). */
export async function GET() {
  try {
    await requireAdmin();
    // Group messages by referrerCode via raw aggregation
    const referrerCodes = await db.message.findMany({
      distinct: ["referrerCode"],
      select: { referrerCode: true },
    });
    const codes = referrerCodes.map((r) => r.referrerCode);

    const referrers = codes.length
      ? await db.referrer.findMany({
          where: { code: { in: codes } },
          select: { code: true, displayName: true },
        })
      : [];
    const refMap = new Map(referrers.map((r) => [r.code, r.displayName]));

    const conversations = [];
    for (const code of codes) {
      const last = await db.message.findFirst({
        where: { referrerCode: code },
        orderBy: { createdAt: "desc" },
      });
      const unreadCount = await db.message.count({
        where: { referrerCode: code, senderType: "referrer", readAt: null },
      });
      if (last) {
        conversations.push({
          referrerCode: code,
          referrerName: refMap.get(code) ?? null,
          lastMessage: last.body.slice(0, 80),
          lastSenderType: last.senderType,
          lastDateLabel: formatDate(last.createdAt),
          lastAt: last.createdAt,
          unreadCount,
        });
      }
    }
    // Sort by most recent
    conversations.sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1));

    return NextResponse.json({ ok: true, conversations });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[admin/messages GET] error", err);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
