import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, AuthError } from "@/lib/auth";

const TYPE_LABELS: Record<string, string> = {
  claim: "ثبت ادعا",
  question: "سؤال",
  assistance: "کمک در انجام",
};

const STATUS_LABELS: Record<string, string> = {
  new: "جدید",
  contacted: "تماس گرفته شد",
  service: "در حال انجام",
  completed: "تکمیل شد",
  cancelled: "لغو شد",
};

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

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || undefined;
    const q = url.searchParams.get("q") || undefined;

    const where: { status?: string; OR?: unknown[] } = {};
    if (status && status !== "all") where.status = status;
    if (q) {
      where.OR = [
        { fullName: { contains: q } },
        { mobile: { contains: q } },
        { trackingCode: { contains: q.toUpperCase() } },
        { city: { contains: q } },
      ];
    }

    const leads = await db.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    const stats = {
      total: leads.length,
      new: leads.filter((l) => l.status === "new").length,
      contacted: leads.filter((l) => l.status === "contacted").length,
      service: leads.filter((l) => l.status === "service").length,
      completed: leads.filter((l) => l.status === "completed").length,
      cancelled: leads.filter((l) => l.status === "cancelled").length,
    };

    return NextResponse.json({
      ok: true,
      stats,
      leads: leads.map((l) => ({
        id: l.id,
        trackingCode: l.trackingCode,
        fullName: l.fullName,
        mobile: l.mobile,
        city: l.city,
        requestType: l.requestType,
        requestTypeLabel: TYPE_LABELS[l.requestType] ?? l.requestType,
        status: l.status,
        statusLabel: STATUS_LABELS[l.status] ?? l.status,
        referralCode: l.referralCode,
        note: l.note,
        adminNote: l.adminNote,
        dateLabel: formatDate(l.createdAt),
        createdAt: l.createdAt,
      })),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[admin/leads] error", err);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
