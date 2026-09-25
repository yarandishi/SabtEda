import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "درخواست نامعتبر است." }, { status: 400 });
    }
    const username = String(body.username ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: "نام کاربری و رمز عبور را وارد کنید." },
        { status: 422 }
      );
    }

    const admin = await db.adminUser.findUnique({ where: { username } });
    if (!admin) {
      return NextResponse.json(
        { ok: false, error: "نام کاربری یا رمز عبور نادرست است." },
        { status: 401 }
      );
    }
    const ok = await verifyPassword(password, admin.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "نام کاربری یا رمز عبور نادرست است." },
        { status: 401 }
      );
    }

    await createSession({
      kind: "admin",
      id: admin.id,
      username: admin.username,
    });

    return NextResponse.json({
      ok: true,
      admin: {
        username: admin.username,
        displayName: admin.displayName,
      },
    });
  } catch (err) {
    console.error("[admin/login] error", err);
    return NextResponse.json(
      { ok: false, error: "خطای پیش‌بینی‌نشده رخ داد." },
      { status: 500 }
    );
  }
}
