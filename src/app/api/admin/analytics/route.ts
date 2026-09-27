import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, AuthError } from "@/lib/auth";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateKey(d: Date): string {
  return new Intl.DateTimeFormat("fa-IR", {
    month: "short",
    day: "numeric",
  }).format(d);
}

/**
 * GET /api/admin/analytics?range=7|14|30
 * Returns aggregated visit statistics for the admin analytics dashboard.
 */
export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const rangeDays = Math.min(Math.max(parseInt(url.searchParams.get("range") || "14", 10) || 14, 1), 90);
    const since = daysAgo(rangeDays - 1);

    // Fetch all visits in range (we'll aggregate in JS for simplicity;
    // for very large datasets this could be optimized with SQL groupBy)
    const visits = await db.visit.findMany({
      where: { createdAt: { gte: since } },
      select: {
        id: true,
        ip: true,
        path: true,
        browser: true,
        platform: true,
        os: true,
        referer: true,
        sessionId: true,
        isBot: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5000,
    });

    // Filter out bots for "human" stats
    const humanVisits = visits.filter((v) => !v.isBot);

    // --- Overview ---
    const totalVisits = humanVisits.length;
    const uniqueVisitors = new Set(humanVisits.map((v) => v.sessionId).filter(Boolean)).size;
    const uniqueIps = new Set(humanVisits.map((v) => v.ip).filter(Boolean)).size;
    const todayStart = startOfDay(new Date());
    const visitsToday = humanVisits.filter((v) => v.createdAt >= todayStart).length;

    // --- Time series (visits per day) ---
    const dayMap = new Map<string, { date: string; visits: number; unique: Set<string> }>();
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = daysAgo(i);
      const key = formatDateKey(d);
      dayMap.set(key, { date: key, visits: 0, unique: new Set() });
    }
    for (const v of humanVisits) {
      const key = formatDateKey(v.createdAt);
      const entry = dayMap.get(key);
      if (entry) {
        entry.visits++;
        if (v.sessionId) entry.unique.add(v.sessionId);
      }
    }
    const timeSeries = [...dayMap.values()].map((e) => ({
      date: e.date,
      visits: e.visits,
      unique: e.unique.size,
    }));

    // --- Top pages ---
    const pageCounts = new Map<string, number>();
    for (const v of humanVisits) {
      pageCounts.set(v.path, (pageCounts.get(v.path) || 0) + 1);
    }
    const topPages = [...pageCounts.entries()]
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // --- Top browsers ---
    const browserCounts = new Map<string, number>();
    for (const v of humanVisits) {
      const b = v.browser || "نامشخص";
      browserCounts.set(b, (browserCounts.get(b) || 0) + 1);
    }
    const topBrowsers = [...browserCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // --- Top platforms ---
    const platformCounts = new Map<string, number>();
    for (const v of humanVisits) {
      const p = v.platform || "نامشخص";
      platformCounts.set(p, (platformCounts.get(p) || 0) + 1);
    }
    const topPlatforms = [...platformCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // --- Top OS ---
    const osCounts = new Map<string, number>();
    for (const v of humanVisits) {
      const o = v.os || "نامشخص";
      osCounts.set(o, (osCounts.get(o) || 0) + 1);
    }
    const topOS = [...osCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // --- Top IPs ---
    const ipCounts = new Map<string, number>();
    for (const v of humanVisits) {
      if (v.ip) ipCounts.set(v.ip, (ipCounts.get(v.ip) || 0) + 1);
    }
    const topIps = [...ipCounts.entries()]
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // --- Top referers ---
    const refererCounts = new Map<string, number>();
    for (const v of humanVisits) {
      if (v.referer) {
        try {
          const u = new URL(v.referer);
          const host = u.hostname;
          refererCounts.set(host, (refererCounts.get(host) || 0) + 1);
        } catch {
          // invalid referer, skip
        }
      }
    }
    const topReferers = [...refererCounts.entries()]
      .map(([host, count]) => ({ host, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // --- Recent visits (last 20) ---
    const recent = humanVisits.slice(0, 20).map((v) => ({
      ip: v.ip,
      path: v.path,
      browser: v.browser || "—",
      platform: v.platform || "—",
      os: v.os || "—",
      dateLabel: new Intl.DateTimeFormat("fa-IR", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(v.createdAt),
    }));

    // --- Bot count ---
    const botCount = visits.filter((v) => v.isBot).length;

    return NextResponse.json({
      ok: true,
      range: rangeDays,
      overview: {
        totalVisits,
        uniqueVisitors,
        uniqueIps,
        visitsToday,
        botCount,
      },
      timeSeries,
      topPages,
      topBrowsers,
      topPlatforms,
      topOS,
      topIps,
      topReferers,
      recent,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[admin/analytics] error", err);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
