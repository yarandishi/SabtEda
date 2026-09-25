import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, AuthError } from "@/lib/auth";

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
 * Returns the logged-in referrer's leads + aggregate stats.
 * Authenticated via session cookie (not query param) for security.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.kind !== "referrer" || !session.code) {
      throw new AuthError("ورود معرف لازم است.", 401);
    }
    const code = session.code;

    const referrer = await db.referrer.findUnique({
      where: { code },
      select: { code: true, displayName: true, active: true },
    });

    if (!referrer) {
      throw new AuthError("کد معرف پیدا نشد.", 404);
    }
    if (!referrer.active) {
      throw new AuthError("این کد معرف غیرفعال است.", 403);
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
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[referrer/leads] error", err);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
