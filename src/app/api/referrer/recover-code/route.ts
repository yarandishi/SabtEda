import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function normalizeMobile(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "");
  let m = digits;
  if (m.startsWith("+98")) m = "0" + m.slice(3);
  else if (m.startsWith("0098")) m = "0" + m.slice(4);
  else if (m.startsWith("98") && m.length === 12) m = "0" + m.slice(2);
  return /^09\d{9}$/.test(m) ? m : null;
}

/**
 * Recovers a referrer's code by their registered mobile number.
 * This is a lookup, not an auth — it reveals the code (which is semi-public anyway
 * since it appears in referral links) so the referrer can log back in.
 * Returns the code + displayName if a referrer with that mobile exists.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "درخواست نامعتبر است." }, { status: 400 });
    }
    const mobileRaw = String(body.mobile ?? "").trim();
    const mobile = normalizeMobile(mobileRaw);
    if (!mobile) {
      return NextResponse.json(
        { ok: false, error: "شماره موبایل معتبر نیست. مثال: 09123456789" },
        { status: 422 }
      );
    }

    const referrer = await db.referrer.findFirst({
      where: { contact: mobile },
      select: { code: true, displayName: true, active: true },
    });

    if (!referrer) {
      return NextResponse.json(
        { ok: false, error: "با این شماره هنوز ثبت‌نامی انجام نشده است. ابتدا ثبت‌نام کنید." },
        { status: 404 }
      );
    }
    if (!referrer.active) {
      return NextResponse.json(
        { ok: false, error: "این حساب معرف غیرفعال است. با پشتیبانی تماس بگیرید." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ok: true,
      code: referrer.code,
      displayName: referrer.displayName,
    });
  } catch (err) {
    console.error("[referrer/recover-code] error", err);
    return NextResponse.json(
      { ok: false, error: "خطای پیش‌بینی‌نشده رخ داد." },
      { status: 500 }
    );
  }
}
