import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Lightweight stats endpoint for external automation (e.g. MacroDroid).
 * Authenticated via a bearer token (ADMIN_API_TOKEN env var).
 *
 * Usage from MacroDroid HTTP request:
 *   GET https://your-domain.com/api/admin/stats
 *   Header: Authorization: Bearer <your-token>
 *
 * Returns compact JSON:
 *   { ok, newLeadsToday, totalLeads, newThisWeek, byStatus, unreadMessages, totalReferrers }
 */
function getToken(): string | null {
  const t = process.env.ADMIN_API_TOKEN;
  if (!t) return null;
  return t.trim();
}

function isToday(d: Date): boolean {
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isThisWeek(d: Date): boolean {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return d >= weekAgo;
}

export async function GET(req: NextRequest) {
  const token = getToken();
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_API_TOKEN تنظیم نشده است." },
      { status: 503 }
    );
  }
  const auth = req.headers.get("authorization") || "";
  const provided = auth.replace(/^Bearer\s+/i, "").trim();
  if (!provided || provided !== token) {
    return NextResponse.json(
      { ok: false, error: "توکن نامعتبر است." },
      { status: 401 }
    );
  }

  const leads = await db.lead.findMany({
    select: { status: true, createdAt: true },
  });
  const totalReferrers = await db.referrer.count();
  const unreadMessages = await db.message.count({
    where: { senderType: "referrer", readAt: null },
  });

  const newLeadsToday = leads.filter((l) => isToday(l.createdAt)).length;
  const newThisWeek = leads.filter((l) => isThisWeek(l.createdAt)).length;

  const byStatus = {
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    service: leads.filter((l) => l.status === "service").length,
    completed: leads.filter((l) => l.status === "completed").length,
    cancelled: leads.filter((l) => l.status === "cancelled").length,
  };

  return NextResponse.json({
    ok: true,
    newLeadsToday,
    newThisWeek,
    totalLeads: leads.length,
    byStatus,
    unreadMessages,
    totalReferrers,
    generatedAt: new Date().toISOString(),
  });
}
