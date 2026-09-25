import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const STATUS_LABELS: Record<string, string> = {
  new: "جدید",
  contacted: "تماس گرفته شد",
  service: "در حال انجام",
  completed: "تکمیل شد",
  cancelled: "لغو شد",
};

const TYPE_LABELS: Record<string, string> = {
  claim: "ثبت ادعا",
  question: "سؤال",
  assistance: "کمک در انجام",
};

function maskMobile(m: string): string {
  if (m.length < 7) return m;
  return m.slice(0, 4) + "***" + m.slice(-2);
}

function formatDate(d: Date): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

/**
 * Returns leads attributed to a referrer (by referralCode),
 * plus aggregate stats. Requires the referrer code to exist & be active.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = (url.searchParams.get("code") ?? "")
    .trim()
    .toUpperCase()
    .slice(0, 32);

  if (!code) {
    return NextResponse.json(
      { ok: false, error: "کد معرف الزامی است." },
      { status: 422 }
    );
  }

  const referrer = await db.referrer.findUnique({
    where: { code },
    select: { code: true, displayName: true, active: true },
  });

  if (!referrer) {
    return NextResponse.json(
      { ok: false, error: "کد معرف پیدا نشد." },
      { status: 404 }
    );
  }
  if (!referrer.active) {
    return NextResponse.json(
      { ok: false, error: "این کد معرف غیرفعال است." },
      { status: 403 }
    );
  }

  const leads = await db.lead.findMany({
    where: { referralCode: code },
    orderBy: { createdAt: "desc" },
    select: {
      trackingCode: true,
      fullName: true,
      mobile: true,
      city: true,
      requestType: true,
      status: true,
      createdAt: true,
    },
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
    referrer: {
      code: referrer.code,
      displayName: referrer.displayName,
    },
    stats,
    leads: leads.map((l) => ({
      trackingCode: l.trackingCode,
      fullName: l.fullName,
      mobileMasked: maskMobile(l.mobile),
      city: l.city,
      requestTypeLabel: TYPE_LABELS[l.requestType] ?? l.requestType,
      statusLabel: STATUS_LABELS[l.status] ?? l.status,
      status: l.status,
      dateLabel: formatDate(l.createdAt),
    })),
  });
}
