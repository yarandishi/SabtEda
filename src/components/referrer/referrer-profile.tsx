"use client";

import { useEffect, useState, useCallback } from "react";
import { CreditCard, Loader2, Save, Check, Edit3, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ReferrerProfileProps {
  referrerCode: string;
}

interface Profile {
  code: string;
  displayName: string | null;
  contact: string | null;
  email: string | null;
  iban: string | null;
}

export function ReferrerProfile({ referrerCode }: ReferrerProfileProps) {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [iban, setIban] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/referrer/profile", { cache: "no-store" });
      if (res.status === 401) return;
      const data = await res.json().catch(() => ({}));
      if (data.ok && data.referrer) {
        setProfile(data.referrer);
        setIban(data.referrer.iban ?? "");
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (saving) return;
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/referrer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ iban: iban.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "ذخیره ناموفق بود.");
      }
      setProfile((p) => (p ? { ...p, iban: data.referrer.iban } : p));
      setEditing(false);
      toast({ title: "ذخیره شد", description: "شماره شبا ذخیره شد." });
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا.");
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setIban(profile?.iban ?? "");
    setError(null);
    setEditing(false);
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <CreditCard className="h-4 w-4 text-forest" />
        <p className="text-sm font-bold text-navy">اطلاعات حساب بانکی</p>
      </div>
      <div className="p-4">
        <p className="mb-3 text-[12px] leading-6 text-muted-foreground">
          شماره شبا (IBAN) خود را برای واریز سود معرفی وارد کنید. این اطلاعات فقط برای مدیریت قابل مشاهده است.
        </p>

        {loading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            در حال بارگذاری...
          </div>
        ) : editing ? (
          <div className="space-y-2">
            <Label htmlFor="iban-input" className="text-xs font-medium text-navy">
              شماره شبا (IR + 24 رقم)
            </Label>
            <Input
              id="iban-input"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              placeholder="IR062960000000100324200001"
              className="kk-num h-11 text-sm"
              dir="ltr"
              inputMode="text"
              autoComplete="off"
            />
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                onClick={save}
                disabled={saving}
                className="h-9 gap-1.5 bg-forest text-xs hover:bg-forest/90"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                ذخیره
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={cancelEdit}
                className="h-9 gap-1.5 text-xs"
              >
                <X className="h-3.5 w-3.5" />
                انصراف
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              {profile?.iban ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-forest/10 text-forest">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span
                    className="kk-num truncate text-sm font-semibold text-navy"
                    dir="ltr"
                    title={profile.iban}
                  >
                    {profile.iban}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  هنوز ثبت نشده است
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-navy transition-colors hover:bg-mist"
            >
              <Edit3 className="h-3.5 w-3.5" />
              {profile?.iban ? "ویرایش" : "افزودن"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
