"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Client-side visit tracker.
 * Fires a beacon to /api/track on every route change (including SPA navigations).
 * Silent — never blocks or errors the page.
 */
export function VisitTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    const fullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    // Avoid double-tracking the same path
    if (fullPath === lastTracked.current) return;
    lastTracked.current = fullPath;

    // Skip tracking admin/referrer/API pages (internal panels)
    if (fullPath.startsWith("/admin") || fullPath.startsWith("/api/")) {
      return;
    }

    const body = JSON.stringify({
      path: fullPath,
      referer: typeof document !== "undefined" ? document.referrer || null : null,
    });

    // Use sendBeacon if available (non-blocking, survives page unload)
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      const ok = navigator.sendBeacon("/api/track", blob);
      if (ok) return;
    }
    // Fallback to fetch with keepalive
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      /* silent */
    });
  }, [pathname, searchParams]);

  return null;
}
