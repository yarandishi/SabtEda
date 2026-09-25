import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, AuthError, hashPassword, generateUniqueReferrerCode } from "@/lib/auth";

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

export async function GET() {
  try {
    await requireAdmin();
    const referrers = await db.referrer.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Count leads per referrer
    const leadCounts = await db.lead.groupBy({
      by: ["referralCode"],
      _count: { _all: true },
    });
    const countMap = new Map<string, number>();
    for (const c of leadCounts) {
      if (c.referralCode) countMap.set(c.referralCode, c._count._all);
    }

    return NextResponse.json({
      ok: true,
      referrers: referrers.map((r) => ({
        id: r.id,
        code: r.code,
        displayName: r.displayName,
        contact: r.contact,
        email: r.email,
        active: r.active,
        hasPassword: !!r.passwordHash,
        leadsCount: countMap.get(r.code) ?? 0,
        dateLabel: formatDate(r.createdAt),
      })),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[admin/referrers] error", err);
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

    const displayName = String(body.displayName ?? "").trim();
    const contact = body.contact ? String(body.contact).trim() : null;
    const code = body.code ? String(body.code).trim().toUpperCase() : await generateUniqueReferrerCode();
    const active = body.active !== false;

    if (displayName.length < 3) {
      return NextResponse.json(
        { ok: false, error: "نام معرف را وارد کنید." },
        { status: 422 }
      );
    }

    const existing = await db.referrer.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "این کد معرف قبلاً ثبت شده است." },
        { status: 409 }
      );
    }

    const referrer = await db.referrer.create({
      data: {
        code,
        displayName,
        contact,
        active,
        // Admin-created referrer has no password (can self-register later or admin sets)
      },
    });

    return NextResponse.json({
      ok: true,
      referrer: {
        id: referrer.id,
        code: referrer.code,
        displayName: referrer.displayName,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[admin/referrers create] error", err);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
