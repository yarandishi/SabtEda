"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  UserCog,
  Loader2,
  LogIn,
  LogOut,
  Users,
  PhoneCall,
  Wrench,
  CheckCircle2,
  XCircle,
  Clock,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReferrerPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Referrer {
  code: string;
  displayName: string | null;
  memberSince?: string;
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

interface Dashboard {
  referrer: { code: string; displayName: string | null };
  stats: {
    total: number;
    new: number;
    contacted: number;
    service: number;
    completed: number;
    cancelled: number;
  };
  leads: LeadRow[];
}

const STATUS_BADGE: Record<string, string> = {
  new: "bg-amber-soft text-amber-cta",
  contacted: "bg-navy-soft text-navy",
  service: "bg-forest-soft text-forest",
  completed: "bg-forest/10 text-forest",
  cancelled: "bg-destructive/10 text-destructive",
};

export function ReferrerPanel({ open, onOpenChange }: ReferrerPanelProps) {
  const [code, setCode] = useState("");
  const [referrer, setReferrer] = useState<Referrer | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDash, setLoadingDash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storedCode, setStoredCode] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // On open: try to restore a stored referrer session
  useEffect(() => {
    if (!open) return;
    setError(null);
    try {
      const saved = sessionStorage.getItem("kk_referrer_code");
      if (saved) {
        setStoredCode(saved);
        setCode(saved);
        // Auto-login with stored code
        void doLogin(saved, true);
        return;
      }
    } catch {
      /* ignore */
    }
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  async function doLogin(codeValue: string, silent = false) {
    if (!codeValue.trim()) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/referrer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeValue.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "ورود ناموفق بود.");
      }
      setReferrer(data.referrer);
      try {
        sessionStorage.setItem("kk_referrer_code", codeValue.trim().toUpperCase());
      } catch {
        /* ignore */
      }
      setStoredCode(codeValue.trim().toUpperCase());
      await loadDashboard(codeValue.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطای نامشخص.");
      setReferrer(null);
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadDashboard(codeValue: string) {
    setLoadingDash(true);
    try {
      const res = await fetch(
        `/api/referrer/leads?code=${encodeURIComponent(codeValue)}`,
        { method: "GET" }
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setDashboard(data);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingDash(false);
    }
  }

  function logout() {
    setReferrer(null);
    setDashboard(null);
    setCode("");
    setStoredCode(null);
    try {
      sessionStorage.removeItem("kk_referrer_code");
    } catch {
      /* ignore */
    }
    setTimeout(() => inputRef.current?.focus(), 80);
  }

  function onLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    void doLogin(code);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-y-auto rounded-3xl p-0 sm:max-w-lg">
        <DialogHeader className="px-6 pt-6">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-forest-soft text-forest">
              <UserCog className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <div>
              <DialogTitle className="text-lg text-navy">
                پنل معرف
              </DialogTitle>
              <DialogDescription className="text-xs">
                با کد معرف خود وارد شوید تا سرنخ‌های معرفی‌شده را ببینید.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Login form */}
        {!referrer && (
          <div className="px-6 pb-2">
            <form onSubmit={onLoginSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="referrer-code" className="text-sm font-medium text-navy">
                  کد معرف
                </label>
                <Input
                  id="referrer-code"
                  ref={inputRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="مثلاً: K1024"
                  className="kk-num h-12 text-base tracking-wider"
                  dir="ltr"
                  inputMode="text"
                  autoCapitalize="characters"
                  autoComplete="off"
                />
              </div>
              {error && (
                <p className="rounded-xl bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={loading || !code.trim()}
                className="h-12 w-full bg-forest font-semibold hover:bg-forest/90"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    ورود به پنل
                  </>
                )}
              </Button>
              <p className="text-center text-[11px] leading-5 text-muted-foreground">
                کد معرف را از زمان ثبت‌نام به‌عنوان معرف دریافت کرده‌اید.
              </p>
            </form>
          </div>
        )}

        {/* Dashboard */}
        {referrer && (
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-mist/60 p-4">
              <div>
                <p className="text-xs text-muted-foreground">کد معرف</p>
                <p className="kk-num font-display text-lg font-bold tracking-wider text-navy">
                  {referrer.code}
                </p>
                {referrer.displayName && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {referrer.displayName}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="h-9 gap-1.5 text-xs"
              >
                <LogOut className="h-3.5 w-3.5" />
                خروج
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-3">
              <StatCard
                icon={Users}
                label="کل سرنخ‌ها"
                value={dashboard?.stats.total ?? 0}
                accent="navy"
              />
              <StatCard
                icon={PhoneCall}
                label="تماس‌گرفته‌شده"
                value={dashboard?.stats.contacted ?? 0}
                accent="forest"
              />
              <StatCard
                icon={CheckCircle2}
                label="تکمیل‌شده"
                value={dashboard?.stats.completed ?? 0}
                accent="forest"
              />
            </div>

            {/* Leads list */}
            <div className="mt-5">
              <p className="mb-2 text-xs font-medium text-navy">
                سرنخ‌های اخیر
              </p>
              {loadingDash ? (
                <div className="flex items-center justify-center rounded-2xl border border-border bg-card py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : dashboard && dashboard.leads.length > 0 ? (
                <ul className="kk-scroll max-h-72 space-y-2 overflow-y-auto pl-1">
                  {dashboard.leads.map((l) => (
                    <li
                      key={l.trackingCode}
                      className="rounded-xl border border-border bg-card p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-navy">
                            {l.fullName}
                          </p>
                          <p className="kk-num mt-0.5 text-[11px] text-muted-foreground">
                            {l.mobileMasked} · {l.city}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            STATUS_BADGE[l.status] ?? "bg-muted text-muted-foreground"
                          )}
                        >
                          {l.statusLabel}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          <span className="kk-num">{l.trackingCode}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {l.dateLabel}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card/50 py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    هنوز سرنشی ثبت نشده است.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    با اشتراک لینک همراه کد معرف خود، سرنخ‌ها اینجا نمایش داده
                    می‌شوند.
                  </p>
                </div>
              )}
            </div>

            {/* Share link */}
            <div className="mt-4 rounded-xl bg-navy-soft p-3">
              <p className="text-[11px] font-medium text-navy">لینک دعوت شما</p>
              <p className="kk-num mt-1 break-all text-[11px] text-muted-foreground" dir="ltr">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/?ref=${referrer.code}`
                  : `/?ref=${referrer.code}`}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            بستن
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: number;
  accent: "navy" | "forest";
}) {
  const colors =
    accent === "navy"
      ? "bg-navy-soft text-navy"
      : "bg-forest-soft text-forest";
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center">
      <span
        className={cn(
          "mx-auto inline-flex h-8 w-8 items-center justify-center rounded-lg",
          colors
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <p className="kk-num mt-1.5 text-lg font-bold text-navy">{value}</p>
      <p className="text-[10px] leading-4 text-muted-foreground">{label}</p>
    </div>
  );
}
