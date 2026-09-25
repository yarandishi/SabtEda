"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Lead {
  id: string;
  trackingCode: string;
  fullName: string;
  mobile: string;
  city: string;
  requestTypeLabel: string;
  status: string;
  statusLabel: string;
  referralCode: string | null;
  note: string | null;
  adminNote: string | null;
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

const STATUS_OPTIONS = [
  { value: "new", label: "جدید", color: "bg-amber-soft text-amber-cta" },
  { value: "contacted", label: "تماس گرفته شد", color: "bg-navy-soft text-navy" },
  { value: "service", label: "در حال انجام", color: "bg-forest-soft text-forest" },
  { value: "completed", label: "تکمیل شد", color: "bg-forest/10 text-forest" },
  { value: "cancelled", label: "لغو شد", color: "bg-destructive/10 text-destructive" },
];

const STATUS_BADGE: Record<string, string> = {
  new: "bg-amber-soft text-amber-cta",
  contacted: "bg-navy-soft text-navy",
  service: "bg-forest-soft text-forest",
  completed: "bg-forest/10 text-forest",
  cancelled: "bg-destructive/10 text-destructive",
};

export function LeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [openNote, setOpenNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/admin/leads?${params.toString()}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setLeads(data.leads);
        setStats(data.stats);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [statusFilter, q]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/leads/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === id
              ? {
                  ...l,
                  status,
                  statusLabel: STATUS_OPTIONS.find((s) => s.value === status)?.label ?? l.statusLabel,
                }
              : l
          )
        );
        // update stats
        setStats((prev) => {
          if (!prev) return prev;
          const next = { ...prev };
          const old = leads.find((l) => l.id === id)?.status;
          if (old) next[old as keyof Stats] = Math.max(0, next[old as keyof Stats] - 1);
          next[status as keyof Stats] = (next[status as keyof Stats] ?? 0) + 1;
          return next;
        });
      }
    } catch {
      /* ignore */
    } finally {
      setUpdatingId(null);
    }
  }

  async function saveAdminNote(id: string, note: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/leads/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote: note }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, adminNote: note } : l)));
        setOpenNote(null);
      }
    } catch {
      /* ignore */
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          <StatBox label="کل" value={stats.total} tone="navy" />
          <StatBox label="جدید" value={stats.new} tone="amber" />
          <StatBox label="تماس" value={stats.contacted} tone="navy" />
          <StatBox label="در حال انجام" value={stats.service} tone="forest" />
          <StatBox label="تکمیل" value={stats.completed} tone="forest" />
          <StatBox label="لغو" value={stats.cancelled} tone="red" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجو: نام، موبایل، کد رهگیری، شهر…"
            className="h-11 pr-10"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1">
          <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
            همه
          </FilterChip>
          {STATUS_OPTIONS.map((s) => (
            <FilterChip
              key={s.value}
              active={statusFilter === s.value}
              onClick={() => setStatusFilter(s.value)}
            >
              {s.label}
            </FilterChip>
          ))}
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-navy"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </button>
      </div>

      {/* Table (desktop) / cards (mobile) */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-card py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 py-12 text-center text-sm text-muted-foreground">
          هیچ ثبت‌نامی یافت نشد.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:block">
            <table className="w-full text-right text-sm">
              <thead className="bg-mist/60 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">کد رهگیری</th>
                  <th className="px-4 py-3 font-medium">نام</th>
                  <th className="px-4 py-3 font-medium">موبایل</th>
                  <th className="px-4 py-3 font-medium">شهر</th>
                  <th className="px-4 py-3 font-medium">نوع</th>
                  <th className="px-4 py-3 font-medium">معرف</th>
                  <th className="px-4 py-3 font-medium">تاریخ</th>
                  <th className="px-4 py-3 font-medium">وضعیت</th>
                  <th className="px-4 py-3 font-medium">یادداشت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-mist/40">
                    <td className="px-4 py-3">
                      <span className="kk-num font-semibold text-navy">{l.trackingCode}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{l.fullName}</td>
                    <td className="px-4 py-3">
                      <span className="kk-num text-xs" dir="ltr">{l.mobile}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{l.city}</td>
                    <td className="px-4 py-3 text-xs">{l.requestTypeLabel}</td>
                    <td className="px-4 py-3">
                      {l.referralCode ? (
                        <span className="kk-num rounded bg-mist px-1.5 py-0.5 text-[11px] text-navy">
                          {l.referralCode}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-muted-foreground">{l.dateLabel}</td>
                    <td className="px-4 py-3">
                      <select
                        value={l.status}
                        onChange={(e) => updateStatus(l.id, e.target.value)}
                        disabled={updatingId === l.id}
                        className={cn(
                          "rounded-lg border-0 px-2 py-1 text-xs font-semibold outline-none ring-1 ring-inset ring-border",
                          STATUS_BADGE[l.status]
                        )}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value} className="bg-white text-foreground">
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <NoteEditor
                        key={`${l.id}-${l.adminNote ?? ""}`}
                        lead={l}
                        open={openNote === l.id}
                        onToggle={() => setOpenNote(openNote === l.id ? null : l.id)}
                        onSave={(note) => saveAdminNote(l.id, note)}
                        saving={updatingId === l.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2.5 lg:hidden">
            {leads.map((l) => (
              <div key={l.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-navy">{l.fullName}</p>
                    <p className="kk-num mt-0.5 text-xs text-muted-foreground" dir="ltr">{l.mobile}</p>
                  </div>
                  <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", STATUS_BADGE[l.status])}>
                    {l.statusLabel}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                  <span>کد: <span className="kk-num font-semibold text-navy">{l.trackingCode}</span></span>
                  <span>شهر: {l.city}</span>
                  <span>نوع: {l.requestTypeLabel}</span>
                  <span>معرف: {l.referralCode ?? "—"}</span>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">{l.dateLabel}</p>
                <div className="mt-3 flex items-center gap-2">
                  <select
                    value={l.status}
                    onChange={(e) => updateStatus(l.id, e.target.value)}
                    disabled={updatingId === l.id}
                    className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-semibold"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setOpenNote(openNote === l.id ? null : l.id)}
                    className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground"
                  >
                    یادداشت
                  </button>
                </div>
                {openNote === l.id && (
                  <NoteEditor
                    key={`m-${l.id}-${l.adminNote ?? ""}`}
                    lead={l}
                    open
                    onToggle={() => setOpenNote(null)}
                    onSave={(note) => saveAdminNote(l.id, note)}
                    saving={updatingId === l.id}
                  />
                )}
              </div>
            ))}
          </div>
        </>
      )}
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

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "bg-navy text-white" : "text-muted-foreground hover:text-navy"
      )}
    >
      {children}
    </button>
  );
}

function NoteEditor({
  lead,
  open,
  onToggle,
  onSave,
  saving,
}: {
  lead: Lead;
  open: boolean;
  onToggle: () => void;
  onSave: (note: string) => void;
  saving: boolean;
}) {
  const [text, setText] = useState(lead.adminNote ?? "");

  if (!open) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="rounded-lg border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:text-navy"
      >
        {lead.adminNote ? "ویرایش" : "افزودن"}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="یادداشت داخلی (برای کاربر نمایش داده نمی‌شود)"
        className="kk-scroll h-16 w-40 resize-none rounded-lg border border-border bg-background p-2 text-[11px]"
      />
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => onSave(text)}
          disabled={saving}
          className="rounded bg-navy px-2 py-1 text-[11px] text-white disabled:opacity-50"
        >
          ذخیره
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="rounded border border-border px-2 py-1 text-[11px] text-muted-foreground"
        >
          لغو
        </button>
      </div>
    </div>
  );
}
