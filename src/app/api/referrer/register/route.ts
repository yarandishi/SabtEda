import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, hashPassword, generateUniqueReferrerCode, isSecureRequest } from "@/lib/auth";
import { consumeCaptcha } from "@/lib/captcha";

function normalizeMobile(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "");
  let m = digits;
  if (m.startsWith("+98")) m = "0" + m.slice(3);
  else if (m.startsWith("0098")) m = "0" + m.slice(4);
  else if (m.startsWith("98") && m.length === 12) m = "0" + m.slice(2);
  return /^09\d{9}$/.test(m) ? m : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "درخواست نامعتبر است." }, { status: 400 });
    }
    const displayName = String(body.displayName ?? "").trim();
    const mobileRaw = String(body.mobile ?? "").trim();
    const password = String(body.password ?? "");
    const captcha = String(body.captcha ?? "").trim();

    if (displayName.length < 3) {
      return NextResponse.json(
        { ok: false, field: "displayName", error: "نام و نام خانوادگی را کامل وارد کنید." },
        { status: 422 }
      );
    }
    const mobile = normalizeMobile(mobileRaw);
    if (!mobile) {
      return NextResponse.json(
        { ok: false, field: "mobile", error: "شماره موبایل معتبر نیست. مثال: 09123456789" },
        { status: 422 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, field: "password", error: "رمز عبور حداقل ۶ کاراکتر باشد." },
        { status: 422 }
      );
    }
    const captchaOk = await consumeCaptcha(captcha);
    if (!captchaOk) {
      return NextResponse.json(
        { ok: false, field: "captcha", error: "پاسخ کپچا نادرست است." },
        { status: 422 }
      );
    }

    // Prevent duplicate mobile
    const existingMobile = await db.referrer.findFirst({
      where: { contact: mobile },
      select: { id: true },
    });
    if (existingMobile) {
      return NextResponse.json(
        { ok: false, field: "mobile", error: "این شماره قبلاً ثبت شده است. وارد شوید." },
        { status: 409 }
      );
    }

    const code = await generateUniqueReferrerCode();
    const passwordHash = await hashPassword(password);

    const referrer = await db.referrer.create({
      data: {
        code,
        displayName,
        contact: mobile,
        passwordHash,
        active: true,
      },
    });

    await createSession(
      {
        kind: "referrer",
        id: referrer.id,
        code: referrer.code,
      },
      { secure: isSecureRequest(req) }
    );

    return NextResponse.json({
      ok: true,
      referrer: {
        code: referrer.code,
        displayName: referrer.displayName,
      },
    });
  } catch (err) {
    console.error("[referrer/register] error", err);
    return NextResponse.json(
      { ok: false, error: "خطای پیش‌بینی‌نشده رخ داد." },
      { status: 500 }
    );
  }
}
