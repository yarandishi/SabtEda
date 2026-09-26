import "server-only";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";

const SESSION_COOKIE = "kk_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Determines whether the request is served over HTTPS, accounting for
 * reverse proxies (Caddy/Nginx) that set the X-Forwarded-Proto header.
 * Used to decide cookie flags: HTTPS needs SameSite=None+Secure so the
 * session cookie works inside cross-origin preview iframes; plain HTTP
 * (local dev) uses SameSite=Lax.
 */
export function isSecureRequest(req?: NextRequest): boolean {
  if (req) {
    const forwardedProto = req.headers.get("x-forwarded-proto");
    if (forwardedProto) return forwardedProto.toLowerCase().includes("https");
    try {
      if (new URL(req.url).protocol === "https:") return true;
    } catch {
      /* ignore */
    }
  }
  // Fallback: treat production as secure
  return process.env.NODE_ENV === "production";
}

/**
 * Session payload encoded into the signed cookie.
 * kind: "admin" | "referrer"
 */
export interface SessionPayload {
  kind: "admin" | "referrer";
  id: string;
  username?: string; // for admin
  code?: string; // for referrer
  iat: number; // issued at (epoch ms)
  exp: number; // expiration (epoch ms)
}

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) {
    // Fallback for dev only — never rely on this in production
    return "dev-only-insecure-secret-please-set-SESSION_SECRET";
  }
  return s;
}

async function sign(payload: SessionPayload): Promise<string> {
  const crypto = await import("node:crypto");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

async function verify(token: string): Promise<SessionPayload | null> {
  try {
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    const crypto = await import("node:crypto");
    const expected = crypto
      .createHmac("sha256", getSecret())
      .update(body)
      .digest("base64url");
    // timing-safe compare
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

export async function createSession(
  payload: Omit<SessionPayload, "iat" | "exp">,
  options?: { secure?: boolean }
) {
  const now = Date.now();
  const full: SessionPayload = {
    ...payload,
    iat: now,
    exp: now + SESSION_MAX_AGE * 1000,
  };
  const token = await sign(full);
  const secure = options?.secure ?? (process.env.NODE_ENV === "production");
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    // When served over HTTPS (preview iframe / production), the cookie must be
    // SameSite=None + Secure so that browsers accept it in cross-origin iframes.
    // For local HTTP dev, SameSite=Lax is enough and Secure can't be used.
    sameSite: secure ? "none" : "lax",
    secure,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verify(token);
}

export async function requireAdmin(): Promise<SessionPayload> {
  const s = await getSession();
  if (!s || s.kind !== "admin") {
    throw new AuthError("احراز هویت ادمین لازم است.", 401);
  }
  return s;
}

export async function requireReferrer(): Promise<SessionPayload> {
  const s = await getSession();
  if (!s || s.kind !== "referrer") {
    throw new AuthError("ورود معرف لازم است.", 401);
  }
  return s;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

// ===== Referrer code generation =====
const REF_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateReferrerCode(): string {
  // K + 4 digits-ish chars
  let code = "K";
  for (let i = 0; i < 4; i++) {
    code += REF_CODE_ALPHABET[Math.floor(Math.random() * REF_CODE_ALPHABET.length)];
  }
  return code;
}

export async function generateUniqueReferrerCode(): Promise<string> {
  for (let i = 0; i < 15; i++) {
    const code = generateReferrerCode();
    const exists = await db.referrer.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  // extremely unlikely fallback
  return `K${Date.now().toString(36).toUpperCase().slice(-5)}`;
}
