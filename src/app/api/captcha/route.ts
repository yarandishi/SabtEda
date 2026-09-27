import { NextRequest, NextResponse } from "next/server";
import { issueCaptcha } from "@/lib/captcha";

/**
 * Issues a new math captcha challenge.
 * GET /api/captcha → { ok: true, question: "۳ + ۷ = ؟" }
 * Sets the kk_captcha signed cookie (httpOnly).
 */
export async function GET(req: NextRequest) {
  const { question } = await issueCaptcha(req);
  return NextResponse.json({ ok: true, question });
}
