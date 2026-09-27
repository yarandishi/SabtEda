"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Plus, Pencil, Trash2, Save, X, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "./admin-fetch";
import { cn } from "@/lib/utils";

interface FaqsTabProps {
  onSessionExpired: () => void;
}

interface Faq {
  id: string;
  question: string;
  answer: string;
  order: number;
  published: boolean;
}

interface FaqEditor {
  id?: string;
  question: string;
  answer: string;
  order: number;
  published: boolean;
}

const EMPTY: FaqEditor = { question: "", answer: "", order: 0, published: true };

export function FaqsTab({ onSessionExpired }: FaqsTabProps) {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FaqEditor | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/faqs", onSessionExpired);
      if (res.status === 401) return;
      const data = await res.json().catch(() => ({}));
      if (data.ok) setFaqs(data.faqs);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    load();
  }, [load]);

  async function deleteFaq(f: Faq) {
    if (!confirm(`حذف پرسش «${f.question}»؟`)) return;
    try {
      const res = await adminFetch(`/api/admin/faqs/${f.id}`, onSessionExpired, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setFaqs((prev) => prev.filter((x) => x.id !== f.id));
      }
    } catch {
      /* ignore */
    }
  }

  if (editing) {
    return (
      <FaqEditorForm
        editor={editing}
        onSessionExpired={onSessionExpired}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          مجموع پرسش‌ها: <span className="kk-num font-bold text-navy">{faqs.length}</span>
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={load} className="h-10">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button
            type="button"
            onClick={() => setEditing({ ...EMPTY })}
            className="h-10 gap-1.5 bg-navy hover:bg-navy-dark"
          >
            <Plus className="h-4 w-4" />
            پرسش جدید
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-card py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : faqs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 py-12 text-center text-sm text-muted-foreground">
          هنوز پرسشی ثبت نشده است.
        </div>
      ) : (
        <div className="space-y-2">
          {faqs.map((f) => (
            <div
              key={f.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="kk-num rounded bg-mist px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {f.order}
                  </span>
                  <p className="font-semibold text-navy">{f.question}</p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      f.published ? "bg-forest/10 text-forest" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {f.published ? "منتشر" : "پنهان"}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs leading-6 text-muted-foreground">
                  {f.answer}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setEditing({
                      id: f.id,
                      question: f.question,
                      answer: f.answer,
                      order: f.order,
                      published: f.published,
                    })
                  }
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-navy"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteFaq(f)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/5"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FaqEditorForm({
  editor,
  onSessionExpired,
  onCancel,
  onSaved,
}: {
  editor: FaqEditor;
  onSessionExpired: () => void;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<FaqEditor>(editor);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (saving) return;
    if (form.question.trim().length < 3 || form.answer.trim().length < 3) {
      toast({ variant: "destructive", title: "پرسش و پاسخ را کامل وارد کنید." });
      return;
    }
    setSaving(true);
    try {
      const isEdit = !!form.id;
      const res = await adminFetch(isEdit ? `/api/admin/faqs/${form.id}` : "/api/admin/faqs", onSessionExpired, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "ذخیره ناموفق بود.");
      }
      toast({ title: "ذخیره شد" });
      onSaved();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: err instanceof Error ? err.message : "ذخیره ناموفق بود.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-navy">{form.id ? "ویرایش پرسش" : "پرسش جدید"}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">پرسش</Label>
        <Input
          value={form.question}
          onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
          placeholder="مثلاً: سامانه کاتب چیست؟"
          className="h-11"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">پاسخ</Label>
        <textarea
          value={form.answer}
          onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))}
          placeholder="پاسخ کامل و ساده..."
          className="kk-scroll h-32 w-full resize-y rounded-xl border border-border bg-background p-3 text-sm leading-7"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-sm">ترتیب نمایش</Label>
          <Input
            type="number"
            value={form.order}
            onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) || 0 }))}
            className="kk-num h-11"
            dir="ltr"
          />
          <p className="text-[11px] text-muted-foreground">عدد کمتر = بالاتر</p>
        </div>
        <label className="flex items-center gap-2.5 self-end pb-2">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))}
            className="h-4 w-4 rounded border-border accent-navy"
          />
          <span className="text-sm font-medium text-navy">منتشر شود</span>
        </label>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={save}
          disabled={saving}
          className="h-11 gap-1.5 bg-forest hover:bg-forest/90"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          ذخیره
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="h-11">
          انصراف
        </Button>
      </div>
    </div>
  );
}
