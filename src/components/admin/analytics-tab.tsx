"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  RefreshCw,
  Eye,
  Users,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Bot,
  TrendingUp,
  FileText,
  MapPin,
} from "lucide-react";
import { adminFetch } from "./admin-fetch";
import { cn } from "@/lib/utils";

interface AnalyticsTabProps {
  onSessionExpired: () => void;
}

interface Overview {
  totalVisits: number;
  uniqueVisitors: number;
  uniqueIps: number;
  visitsToday: number;
  botCount: number;
}

interface TimePoint {
  date: string;
  visits: number;
  unique: number;
}

interface CountItem {
  name?: string;
  path?: string;
  ip?: string;
  host?: string;
  count: number;
}

interface RecentVisit {
  ip: string | null;
  path: string;
  browser: string;
  platform: string;
  os: string;
  dateLabel: string;
}

interface AnalyticsData {
  ok: boolean;
  range: number;
  overview: Overview;
  timeSeries: TimePoint[];
  topPages: CountItem[];
  topBrowsers: CountItem[];
  topPlatforms: CountItem[];
  topOS: CountItem[];
  topIps: CountItem[];
  topReferers: CountItem[];
  recent: RecentVisit[];
}

const RANGES = [
  { value: 7, label: "۷ روز" },
  { value: 14, label: "۱۴ روز" },
  { value: 30, label: "۳۰ روز" },
];

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "دسکتاپ": Monitor,
  "موبایل": Smartphone,
  "تبلت": Tablet,
};

export function AnalyticsTab({ onSessionExpired }: AnalyticsTabProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(14);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/admin/analytics?range=${range}`, onSessionExpired);
      if (res.status === 401) return;
      const json = await res.json().catch(() => ({}));
      if (json.ok) setData(json);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [range, onSessionExpired]);

  useEffect(() => {
    load();
    const id = setInterval(load, 60000); // refresh every 60s
    return () => clearInterval(id);
  }, [load]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-border bg-card py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 py-12 text-center text-sm text-muted-foreground">
        بارگذاری آمار ناموفق بود.
      </div>
    );
  }

  const maxVisits = Math.max(...data.timeSeries.map((t) => t.visits), 1);
  const maxValue = (items: CountItem[]) => Math.max(...items.map((i) => i.count), 1);

  return (
    <div className="space-y-4">
      {/* Header with range selector */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-navy">آمار بازدید سایت</h2>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
            {RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRange(r.value)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  range === r.value ? "bg-navy text-white" : "text-muted-foreground hover:text-navy"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={load}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-navy"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={Eye} label="کل بازدیدها" value={data.overview.totalVisits} tone="navy" />
        <StatCard icon={Users} label="بازدیدکنندگان یکتا" value={data.overview.uniqueVisitors} tone="forest" />
        <StatCard icon={Globe} label="IPهای یکتا" value={data.overview.uniqueIps} tone="amber" />
        <StatCard icon={TrendingUp} label="بازدید امروز" value={data.overview.visitsToday} tone="navy" />
        <StatCard icon={Bot} label="ربات‌ها" value={data.overview.botCount} tone="red" />
      </div>

      {/* Time series chart */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-navy">روند بازدید در {range} روز اخیر</h3>
        <div className="flex items-end justify-between gap-1" style={{ height: "160px" }}>
          {data.timeSeries.map((point, i) => {
            const heightPct = (point.visits / maxVisits) * 100;
            return (
              <div key={i} className="group flex flex-1 flex-col items-center justify-end" style={{ height: "100%" }}>
                <div className="relative flex w-full justify-center" style={{ height: "100%" }}>
                  <div
                    className="w-full max-w-[24px] rounded-t-md bg-navy/70 transition-all hover:bg-navy"
                    style={{ height: `${Math.max(heightPct, 2)}%`, marginTop: "auto" }}
                    title={`${point.date}: ${point.visits} بازدید`}
                  />
                </div>
                {i % Math.ceil(data.timeSeries.length / 8) === 0 && (
                  <span className="mt-1.5 text-[9px] text-muted-foreground">{point.date}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Top pages + platforms */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top pages */}
        <BarChartCard
          title="صفحات پربازدید"
          icon={FileText}
          items={data.topPages}
          max={maxValue(data.topPages)}
          labelKey="path"
          dir="ltr"
        />
        {/* Platforms */}
        <BarChartCard
          title="پلتفرم"
          icon={Monitor}
          items={data.topPlatforms}
          max={maxValue(data.topPlatforms)}
          labelKey="name"
          icons={PLATFORM_ICONS}
        />
      </div>

      {/* Browsers + OS */}
      <div className="grid gap-4 lg:grid-cols-2">
        <BarChartCard
          title="مرورگرها"
          icon={Globe}
          items={data.topBrowsers}
          max={maxValue(data.topBrowsers)}
          labelKey="name"
        />
        <BarChartCard
          title="سیستم‌عامل"
          icon={Monitor}
          items={data.topOS}
          max={maxValue(data.topOS)}
          labelKey="name"
        />
      </div>

      {/* Top IPs + Referers */}
      <div className="grid gap-4 lg:grid-cols-2">
        <BarChartCard
          title="IPهای پرتکرار"
          icon={MapPin}
          items={data.topIps}
          max={maxValue(data.topIps)}
          labelKey="ip"
          dir="ltr"
        />
        <BarChartCard
          title="منابع ارجاع"
          icon={Globe}
          items={data.topReferers}
          max={maxValue(data.topReferers)}
          labelKey="host"
          dir="ltr"
        />
      </div>

      {/* Recent visits table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-bold text-navy">آخرین بازدیدها</h3>
        </div>
        <div className="kk-scroll max-h-96 overflow-y-auto">
          <table className="w-full text-right text-xs">
            <thead className="sticky top-0 bg-mist/80 text-muted-foreground backdrop-blur">
              <tr>
                <th className="px-3 py-2 font-medium">IP</th>
                <th className="px-3 py-2 font-medium">صفحه</th>
                <th className="px-3 py-2 font-medium">مرورگر</th>
                <th className="px-3 py-2 font-medium">پلتفرم</th>
                <th className="px-3 py-2 font-medium">سیستم‌عامل</th>
                <th className="px-3 py-2 font-medium">زمان</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.recent.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                    هنوز بازدیدی ثبت نشده است.
                  </td>
                </tr>
              ) : (
                data.recent.map((v, i) => (
                  <tr key={i} className="hover:bg-mist/40">
                    <td className="px-3 py-2">
                      <span className="kk-num text-[11px]" dir="ltr">{v.ip ?? "—"}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="kk-num max-w-[120px] truncate text-[11px] text-navy" dir="ltr" title={v.path}>
                        {v.path}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[11px]">{v.browser}</td>
                    <td className="px-3 py-2 text-[11px]">{v.platform}</td>
                    <td className="px-3 py-2 text-[11px]">{v.os}</td>
                    <td className="px-3 py-2 text-[11px] text-muted-foreground">{v.dateLabel}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: string;
}) {
  const colors: Record<string, string> = {
    navy: "bg-navy-soft text-navy",
    forest: "bg-forest-soft text-forest",
    amber: "bg-amber-soft text-amber-cta",
    red: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg", colors[tone])}>
        <Icon className="h-4 w-4" />
      </span>
      <p className="kk-num mt-2 text-xl font-bold text-navy">{value.toLocaleString("fa-IR")}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function BarChartCard({
  title,
  icon: Icon,
  items,
  max,
  labelKey,
  dir,
  icons,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: CountItem[];
  max: number;
  labelKey: "name" | "path" | "ip" | "host";
  dir?: "ltr" | "rtl";
  icons?: Record<string, React.ComponentType<{ className?: string }>>;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-navy" />
        <h3 className="text-sm font-bold text-navy">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted-foreground">داده‌ای موجود نیست.</p>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, i) => {
            const label = String(item[labelKey] ?? "—");
            const pct = (item.count / max) * 100;
            const Icon = icons?.[label];
            return (
              <div key={i} className="flex items-center gap-2">
                <div className="flex w-32 shrink-0 items-center gap-1.5 overflow-hidden">
                  {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                  <span
                    className={cn("truncate text-xs text-foreground", dir === "ltr" && "kk-num")}
                    dir={dir}
                    title={label}
                  >
                    {label}
                  </span>
                </div>
                <div className="h-5 flex-1 overflow-hidden rounded-md bg-mist">
                  <div
                    className="h-full rounded-md bg-navy/60 transition-all"
                    style={{ width: `${Math.max(pct, 3)}%` }}
                  />
                </div>
                <span className="kk-num w-8 shrink-0 text-left text-xs font-semibold text-navy">
                  {item.count.toLocaleString("fa-IR")}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
