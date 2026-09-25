import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Simple referrer "login" by code.
 * Returns referrer profile if the code exists and is active.
 * (No real auth — for demo purposes the code itself is the credential.)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "درخواست نامعتبر است." },
        { status: 400 }
      );
    }
    const code = String(body.code ?? "")
      .trim()
      .toUpperCase()
      .slice(0, 32);

    if (!code) {
      return NextResponse.json(
        { ok: false, error: "کد معرف را وارد کنید." },
        { status: 422 }
      );
    }

    const referrer = await db.referrer.findUnique({
      where: { code },
      select: {
        code: true,
        displayName: true,
        active: true,
        createdAt: true,
      },
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

    return NextResponse.json({
      ok: true,
      referrer: {
        code: referrer.code,
        displayName: referrer.displayName,
        memberSince: referrer.createdAt,
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
