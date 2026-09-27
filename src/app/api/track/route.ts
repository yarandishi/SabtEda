import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseUserAgent, getClientIp } from "@/lib/ua-parser";
import { isSecureRequest } from "@/lib/http";
import { cookies } from "next/headers";

const SESSION_COOKIE = "kk_vid"; // visitor id
const SESSION_TTL = 30 * 60; // 30 minutes

/**
 * POST /api/track
 * Public endpoint that records a page-view visit.
 * Called by the client-side VisitTracker on every route change.
 *
 * Body: { path: string, referer?: string }
 * Reads: User-Agent + IP from headers, sessionId from cookie
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.path !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const path = String(body.path).slice(0, 500);
    const referer = body.referer ? String(body.referer).slice(0, 500) : null;
    const userAgent = req.headers.get("user-agent") || null;
    const ip = getClientIp(req.headers);
    const { browser, platform, os, isBot } = parseUserAgent(userAgent);

    // Get or create a visitor session ID (cookie-based, 30-min)
    const store = await cookies();
    let sessionId = store.get(SESSION_COOKIE)?.value || null;
    if (!sessionId) {
      sessionId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
      const secure = isSecureRequest(req);
      store.set(SESSION_COOKIE, sessionId, {
        httpOnly: true,
        sameSite: secure ? "none" : "lax",
        secure,
        path: "/",
        maxAge: SESSION_TTL,
      });
    }

    // Insert the visit (fire-and-forget would be ideal, but Prisma is sync-ish)
    await db.visit.create({
      data: {
        ip,
        path,
        method: "GET",
        browser,
        platform,
        os,
        userAgent: userAgent ? userAgent.slice(0, 500) : null,
        referer,
        sessionId,
        isBot,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[track] error", err);
    // Don't throw — tracking should never break the page
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
