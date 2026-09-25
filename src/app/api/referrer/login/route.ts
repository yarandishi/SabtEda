import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "درخواست نامعتبر است." }, { status: 400 });
    }
    const code = String(body.code ?? "").trim().toUpperCase();
    const password = String(body.password ?? "");

    if (!code || !password) {
      return NextResponse.json(
        { ok: false, error: "کد معرف و رمز عبور را وارد کنید." },
        { status: 422 }
      );
    }

    const referrer = await db.referrer.findUnique({ where: { code } });
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
    // Legacy admin-created referrers without password: ask to register first
    if (!referrer.passwordHash) {
      return NextResponse.json(
        { ok: false, error: "برای این کد هنوز رمز عبوری تعریف نشده است. ابتدا ثبت‌نام کنید." },
        { status: 403 }
      );
    }
    const ok = await verifyPassword(password, referrer.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "کد معرف یا رمز عبور نادرست است." },
        { status: 401 }
      );
    }

    await createSession({
      kind: "referrer",
      id: referrer.id,
      code: referrer.code,
    });

    return NextResponse.json({
      ok: true,
      referrer: {
        code: referrer.code,
        displayName: referrer.displayName,
      },
    });
  } catch (err) {
    console.error("[referrer/login] error", err);
    return NextResponse.json(
      { ok: false, error: "خطای پیش‌بینی‌نشده رخ داد." },
      { status: 500 }
    );
  }
}
