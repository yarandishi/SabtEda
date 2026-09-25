import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Validates an Iranian mobile number (09xxxxxxxxx or +989xxxxxxxxx)
function normalizeMobile(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "");
  let m = digits;
  if (m.startsWith("+98")) m = "0" + m.slice(3);
  else if (m.startsWith("0098")) m = "0" + m.slice(4);
  else if (m.startsWith("98") && m.length === 12) m = "0" + m.slice(2);
  if (/^09\d{9}$/.test(m)) return m;
  return null;
}

const ALLOWED_TYPES = new Set(["claim", "question", "assistance"]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "درخواست نامعتبر است." },
        { status: 400 }
      );
    }

    const fullName = String(body.fullName ?? "").trim();
    const mobileRaw = String(body.mobile ?? "").trim();
    const city = String(body.city ?? "").trim();
    const requestType = String(body.requestType ?? "").trim();
    const note = body.note ? String(body.note).trim().slice(0, 500) : null;
    const referralCode = body.referralCode
      ? String(body.referralCode).trim().slice(0, 32)
      : null;

    // Validation
    if (fullName.length < 3) {
      return NextResponse.json(
        { ok: false, field: "fullName", error: "نام و نام خانوادگی را کامل وارد کنید." },
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
    if (city.length < 2) {
      return NextResponse.json(
        { ok: false, field: "city", error: "شهر / شهرستان را وارد کنید." },
        { status: 422 }
      );
    }
    if (!ALLOWED_TYPES.has(requestType)) {
      return NextResponse.json(
        { ok: false, field: "requestType", error: "نوع درخواست نامعتبر است." },
        { status: 422 }
      );
    }

    const userAgent = req.headers.get("user-storage") || req.headers.get("user-agent") || null;

    const lead = await db.lead.create({
      data: {
        fullName,
        mobile,
        city,
        requestType,
        note,
        referralCode: referralCode || null,
        userAgent: userAgent ? userAgent.slice(0, 255) : null,
        source: "web",
      },
    });

    return NextResponse.json({
      ok: true,
      id: lead.id,
      message: "درخواست شما ثبت شد. به‌زودی برای راهنمایی با شما تماس می‌گیریم.",
    });
  } catch (err) {
    console.error("[leads] create error", err);
    return NextResponse.json(
      { ok: false, error: "خطای پیش‌بینی‌نشده رخ داد. لطفاً دوباره تلاش کنید." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "katebkar-leads" });
}
