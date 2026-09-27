import "server-only";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import crypto from "node:crypto";
import { isSecureRequest } from "@/lib/http";

const CAPTCHA_COOKIE = "kk_captcha";
const CAPTCHA_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    "dev-only-insecure-secret-please-set-SESSION_SECRET"
  );
}

export interface CaptchaChallenge {
  question: string;
  answer: string;
  expiresAt: number;
}

function sign(payload: CaptchaChallenge): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

export function verifyCaptchaToken(
  token: string,
  userAnswer: string
): boolean {
  try {
    const [body, sig] = token.split(".");
    if (!body || !sig) return false;
    const expected = crypto
      .createHmac("sha256", getSecret())
      .update(body)
      .digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as CaptchaChallenge;
    if (payload.expiresAt < Date.now()) return false;
    // Normalize: convert Persian/Arabic digits to Latin, strip non-digits
    const normalize = (s: string) =>
      s
        .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
        .trim();
    return normalize(payload.answer) === normalize(userAnswer);
  } catch {
    return false;
  }
}

/**
 * Generates a simple math captcha challenge (e.g. "۳ + ۷ = ؟"),
 * sets it as a signed cookie, and returns the question for display.
 */
export async function issueCaptcha(req?: NextRequest): Promise<{
  question: string;
}> {
  const a = Math.floor(Math.random() * 9) + 1; // 1..9
  const b = Math.floor(Math.random() * 9) + 1; // 1..9
  const ops = ["+", "-"] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  let answerNum: number;
  let question: string;
  if (op === "+") {
    answerNum = a + b;
    question = `${toPersianDigits(a)} + ${toPersianDigits(b)} = ؟`;
  } else {
    // ensure non-negative
    const [x, y] = a >= b ? [a, b] : [b, a];
    answerNum = x - y;
    question = `${toPersianDigits(x)} − ${toPersianDigits(y)} = ؟`;
  }
  const payload: CaptchaChallenge = {
    question,
    answer: String(answerNum),
    expiresAt: Date.now() + CAPTCHA_TTL_MS,
  };
  const token = sign(payload);
  const store = await cookies();
  const secure = isSecureRequest(req);
  store.set(CAPTCHA_COOKIE, token, {
    httpOnly: true,
    sameSite: secure ? "none" : "lax",
    secure,
    path: "/",
    maxAge: Math.floor(CAPTCHA_TTL_MS / 1000),
  });
  return { question };
}

export async function consumeCaptcha(userAnswer: string): Promise<boolean> {
  const store = await cookies();
  const token = store.get(CAPTCHA_COOKIE)?.value;
  if (!token) return false;
  const ok = verifyCaptchaToken(token, userAnswer);
  // Always clear after an attempt (single-use)
  store.delete(CAPTCHA_COOKIE);
  return ok;
}

export function toPersianDigits(n: number | string): string {
  const map = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(n).replace(/\d/g, (d) => map[Number(d)]);
}
