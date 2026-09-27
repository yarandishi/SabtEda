import "server-only";
import type { NextRequest } from "next/server";

/**
 * Determines whether the request is served over HTTPS, accounting for
 * reverse proxies (Caddy/Nginx) that set the X-Forwarded-Proto header.
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
  return process.env.NODE_ENV === "production";
}
