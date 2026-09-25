"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ExternalLink, Copy, Check, RefreshCw, Loader2 } from "lucide-react";
import { Logo } from "@/components/katebkar/logo";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ReferrerDashboardProps {
  onLoggedOut: () => void;
}

interface ReferrerInfo {
  code: string;
  displayName: string | null;
}
interface LeadRow {
  trackingCode: string;
  fullName: string;
  mobileMasked: string;
  city: string;
  requestTypeLabel: string;
  statusLabel: string;
  status: string;
  dateLabel: string;
}
interface Stats {
  total: number;
  new: number;
  contacted: number;
  service: number;
  completed: number;
  cancelled: number;
}

const STATUS_BADGE: Record<string, string> = {
  new: "bg-amber-soft text-amber-cta",
  contacted: "bg-navy-soft text-navy",
  service: "bg-forest-soft text-forest",
  completed: "bg-forest/10 text-forest",
  cancelled: "bg-destructive/10 text-destructive",
};

export function ReferrerDashboard({ onLoggedOut }: ReferrerDashboardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [referrer, setReferrer] = useState<ReferrerInfo | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/referrer/leads", { cache: "no-store" });
      if (res.status === 401) {
        onLoggedOut();
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setReferrer(data.referrer);
        setStats(data.stats);
        setLeads(data.leads);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [onLoggedOut]);

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    try {
      await fetch("/api/referrer/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    onLoggedOut();
  }

  async function copyInvite() {
    if (!referrer) return;
    const link = `${window.location.origin}/?ref=${referrer.code}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast({ title: "کپی شد", description: "لینک دعوت کپی شد." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "کپی ناموفق" });
    }
  }

  if (loading && !referrer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1000px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full bg-forest-soft px-2.5 py-0.5 text-[11px] font-medium text-forest sm:inline">
              پنل معرف
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-navy"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">مشاهده سایت</span>
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-destructive/10 px-3 text-xs font-medium text-destructive transition-colors hover:bg-destructive/15"
            >
              <LogOut className="h-3.5 w-3.5" />
              خروج
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1000px] px-4 py-6 sm:px-6">
        {/* Welcome + invite link */}
        {referrer && (
          <div className="mb-5 rounded-2xl border border-forest/20 bg-forest-soft/50 p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-muted-foreground">کد معرف شما</p>
                <p className="kk-num font-display text-2xl font-bold tracking-wider text-navy">
                  {referrer.code}
                </p>
                {referrer.displayName && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{referrer.displayName}</p>
                )}
              </div>
              <button
                type="button"
                onClick={copyInvite}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-medium text-navy shadow-sm transition-colors hover:bg-mist"
              >
                {copied ? <Check className="h-4 w-4 text-forest" /> : <Copy className="h-4 w-4" />}
                کپی لینک دعوت
              </button>
            </div>
            <div className="mt-3 rounded-lg bg-card/60 p-2.5">
              <p className="kk-num break-all text-[11px] text-muted-foreground" dir="ltr">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/?ref=${referrer.code}`
                  : `/?ref=${referrer.code}`}
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="mb-5 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
            <StatBox label="کل" value={stats.total} tone="navy" />
            <StatBox label="جدید" value={stats.new} tone="amber" />
            <StatBox label="تماس" value={stats.contacted} tone="navy" />
            <StatBox label="در حال انجام" value={stats.service} tone="forest" />
            <StatBox label="تکمیل" value={stats.completed} tone="forest" />
            <StatBox label="لغو" value={stats.cancelled} tone="red" />
          </div>
        )}

        {/* Leads */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy">سرنخ‌های شما</h2>
          <button
            type="button"
            onClick={load}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground hover:text-navy"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            به‌روزرسانی
          </button>
        </div>

        {leads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 py-12 text-center">
            <p className="text-sm text-muted-foreground">هنوز سرنشی ثبت نشده است.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              لینک دعوت خود را با دیگران به اشتراک بگذارید.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {leads.map((l) => (
              <div
                key={l.trackingCode}
                className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-navy">{l.fullName}</p>
                  <p className="kk-num mt-0.5 text-xs text-muted-foreground" dir="ltr">
                    {l.mobileMasked} · {l.city}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      کد: <span className="kk-num font-semibold text-navy">{l.trackingCode}</span>
                    </span>
                    <span>{l.requestTypeLabel}</span>
                    <span>{l.dateLabel}</span>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    STATUS_BADGE[l.status] ?? "bg-muted text-muted-foreground"
                  )}
                >
                  {l.statusLabel}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, tone }: { label: string; value: number; tone: string }) {
  const colors: Record<string, string> = {
    navy: "bg-navy-soft text-navy",
    amber: "bg-amber-soft text-amber-cta",
    forest: "bg-forest-soft text-forest",
    red: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center shadow-sm">
      <p className={cn("kk-num text-xl font-bold", colors[tone])}>{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
