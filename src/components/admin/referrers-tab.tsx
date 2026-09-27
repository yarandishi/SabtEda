"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, RefreshCw, Plus, UserPlus, Trash2, QrCode, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { adminFetch } from "./admin-fetch";
import { QrInvite } from "@/components/shared/qr-invite";
import { cn } from "@/lib/utils";

interface ReferrersTabProps {
  onSessionExpired: () => void;
  onMessageReferrer: (code: string) => void;
}

interface Referrer {
  id: string;
  code: string;
  displayName: string | null;
  contact: string | null;
  email: string | null;
  iban: string | null;
  active: boolean;
  hasPassword: boolean;
  leadsCount: number;
  dateLabel: string;
}

export function ReferrersTab({ onSessionExpired, onMessageReferrer }: ReferrersTabProps) {
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [qrFor, setQrFor] = useState<Referrer | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/referrers", onSessionExpired);
      if (res.status === 401) return;
      const data = await res.json().catch(() => ({}));
      if (data.ok) setReferrers(data.referrers);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    load();
  }, [load]);

  async function deleteReferrer(id: string, name: string | null, code: string) {
    const label = name || code;
    if (!confirm(`حذف معرف «${label}»؟ ثبت‌نام‌های مرتبط حفظ می‌شوند ولی حساب معرف حذف می‌شود.`)) return;
    try {
      const res = await adminFetch(`/api/admin/referrers/${id}`, onSessionExpired, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setReferrers((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          مجموع معرف‌ها: <span className="kk-num font-bold text-navy">{referrers.length}</span>
        </p>
        <Button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="h-10 gap-1.5 bg-navy hover:bg-navy-dark"
        >
          {showCreate ? <RefreshCw className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreate ? "بستن فرم" : "افزودن معرف"}
        </Button>
      </div>

      {showCreate && (
        <CreateReferrerForm
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
          onSessionExpired={onSessionExpired}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-card py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : referrers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 py-12 text-center text-sm text-muted-foreground">
          هنوز معرفی ثبت نشده است.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-right text-sm">
            <thead className="bg-mist/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">کد</th>
                <th className="px-4 py-3 font-medium">نام</th>
                <th className="px-4 py-3 font-medium">موبایل</th>
                <th className="px-4 py-3 font-medium">شماره شبا</th>
                <th className="px-4 py-3 font-medium">تعداد کارها</th>
                <th className="px-4 py-3 font-medium">وضعیت</th>
                <th className="px-4 py-3 font-medium">تاریخ عضویت</th>
                <th className="px-4 py-3 font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {referrers.map((r) => (
                <tr key={r.id} className="hover:bg-mist/40">
                  <td className="px-4 py-3">
                    <span className="kk-num font-semibold text-navy">{r.code}</span>
                  </td>
                  <td className="px-4 py-3 font-medium">{r.displayName ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="kk-num text-xs" dir="ltr">{r.contact ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    {r.iban ? (
                      <span
                        className="kk-num inline-block max-w-[160px] truncate rounded bg-forest-soft px-2 py-0.5 text-[11px] text-forest"
                        dir="ltr"
                        title={r.iban}
                      >
                        {r.iban}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="kk-num inline-flex items-center justify-center rounded-full bg-navy-soft px-2.5 py-0.5 text-xs font-bold text-navy">
                      {r.leadsCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                        r.active ? "bg-forest/10 text-forest" : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {r.active ? "فعال" : "غیرفعال"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-muted-foreground">{r.dateLabel}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => onMessageReferrer(r.code)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-forest/30 text-forest transition-colors hover:bg-forest-soft"
                        aria-label="پیام به معرف"
                        title="پیام به معرف"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrFor(r)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-navy transition-colors hover:bg-mist"
                        aria-label="QR لینک معرف"
                        title="QR لینک معرف"
                      >
                        <QrCode className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteReferrer(r.id, r.displayName, r.code)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-destructive/30 text-destructive transition-colors hover:bg-destructive/5"
                        aria-label="حذف معرف"
                        title="حذف معرف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* QR modal */}
      {qrFor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setQrFor(null)}
        >
          <div
            className="w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-white">
                QR معرف {qrFor.code}
              </p>
              <button
                type="button"
                onClick={() => setQrFor(null)}
                className="rounded-lg bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
              >
                بستن
              </button>
            </div>
            <QrInvite
              url={
                typeof window !== "undefined"
                  ? `${window.location.origin}/?ref=${qrFor.code}`
                  : `/?ref=${qrFor.code}`
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CreateReferrerForm({
  onCreated,
  onSessionExpired,
}: {
  onCreated: () => void;
  onSessionExpired: () => void;
}) {
  const [displayName, setDisplayName] = useState("");
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/referrers", onSessionExpired, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, contact, code: code || undefined, active: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "ایجاد ناموفق بود.");
      }
      setDisplayName("");
      setContact("");
      setCode("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-navy/15 bg-navy-soft/40 p-4 shadow-sm sm:p-5"
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-navy">
        <UserPlus className="h-4 w-4" />
        ایجاد معرف جدید
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs">نام و نام خانوادگی</Label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="مثلاً: محمد رضایی"
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">شماره موبایل</Label>
          <Input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="09123456789"
            className="kk-num h-10"
            dir="ltr"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">کد معرف (اختیاری)</Label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="خودکار تولید می‌شود"
            className="kk-num h-10"
            dir="ltr"
          />
        </div>
      </div>
      {error && (
        <p className="mt-3 rounded-lg bg-destructive/5 px-3 py-2 text-xs text-destructive">{error}</p>
      )}
      <div className="mt-3">
        <Button type="submit" disabled={loading || displayName.length < 3} className="h-10 bg-forest hover:bg-forest/90">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "ایجاد معرف"}
        </Button>
      </div>
    </form>
  );
}
