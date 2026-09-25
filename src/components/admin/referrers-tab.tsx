"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, RefreshCw, Plus, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Referrer {
  id: string;
  code: string;
  displayName: string | null;
  contact: string | null;
  email: string | null;
  active: boolean;
  hasPassword: boolean;
  leadsCount: number;
  dateLabel: string;
}

export function ReferrersTab() {
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/referrers", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (data.ok) setReferrers(data.referrers);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
                <th className="px-4 py-3 font-medium">تعداد کارها</th>
                <th className="px-4 py-3 font-medium">وضعیت</th>
                <th className="px-4 py-3 font-medium">رمز</th>
                <th className="px-4 py-3 font-medium">تاریخ عضویت</th>
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
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {r.hasPassword ? "دارد" : "—"}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-muted-foreground">{r.dateLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CreateReferrerForm({ onCreated }: { onCreated: () => void }) {
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
      const res = await fetch("/api/admin/referrers", {
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
