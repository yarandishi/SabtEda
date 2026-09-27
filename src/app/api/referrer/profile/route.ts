import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, AuthError } from "@/lib/auth";

/** Normalizes an Iranian IBAN (شماره شبا). Returns canonical form or null. */
function normalizeIban(raw: string): string | null {
  let s = raw.replace(/\s+/g, "").toUpperCase();
  if (!s) return null;
  // Accept with or without leading "IR"
  if (!s.startsWith("IR")) {
    if (/^\d{22}$/.test(s)) {
      s = "IR" + s;
    } else {
      return null;
    }
  }
  // Iranian IBAN = IR + 24 digits
  if (!/^IR\d{24}$/.test(s)) return null;
  return s;
}

/** GET: referrer reads their own profile. */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.kind !== "referrer" || !session.code) {
      throw new AuthError("ورود معرف لازم است.", 401);
    }
    const referrer = await db.referrer.findUnique({
      where: { code: session.code },
      select: {
        code: true,
        displayName: true,
        contact: true,
        email: true,
        iban: true,
      },
    });
    if (!referrer) {
      return NextResponse.json({ ok: false, error: "حساب پیدا نشد." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, referrer });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[referrer/profile GET] error", err);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}

/** PATCH: referrer updates their own profile (currently only iban). */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.kind !== "referrer" || !session.code) {
      throw new AuthError("ورود معرف لازم است.", 401);
    }
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "درخواست نامعتبر" }, { status: 400 });
    }
    const data: { iban?: string | null } = {};
    if (body.iban !== undefined) {
      const raw = String(body.iban).trim();
      if (raw === "") {
        data.iban = null;
      } else {
        const iban = normalizeIban(raw);
        if (!iban) {
          return NextResponse.json(
            {
              ok: false,
              field: "iban",
              error: "شماره شبا معتبر نیست. فرمت: IR + 24 رقم",
            },
            { status: 422 }
          );
        }
        data.iban = iban;
      }
    }

    const updated = await db.referrer.update({
      where: { code: session.code },
      data,
      select: { code: true, iban: true },
    });
    return NextResponse.json({ ok: true, referrer: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[referrer/profile PATCH] error", err);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
