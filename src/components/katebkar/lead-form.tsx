"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Phone,
  User,
  MapPin,
  Send,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { REQUEST_TYPES, type RequestType } from "./types";
import { cn } from "@/lib/utils";

interface LeadFormProps {
  preselectType: RequestType | null;
  referralCode: string | null;
}

interface FieldErrors {
  fullName?: string;
  mobile?: string;
  city?: string;
  requestType?: string;
}

const PERSIAN_MOBILE_RE = /^09\d{9}$/;

function normalizeMobile(raw: string): string {
  let m = raw.replace(/[^\d+]/g, "");
  if (m.startsWith("+98")) m = "0" + m.slice(3);
  else if (m.startsWith("0098")) m = "0" + m.slice(4);
  else if (m.startsWith("98") && m.length === 12) m = "0" + m.slice(2);
  return m;
}

export function LeadForm({ preselectType, referralCode }: LeadFormProps) {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [requestType, setRequestType] = useState<RequestType | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const firstErrorRef = useRef<HTMLInputElement | null>(null);

  // Sync preselect from path cards
  useEffect(() => {
    if (preselectType) {
      setRequestType(preselectType);
      setErrors((e) => ({ ...e, requestType: undefined }));
    }
  }, [preselectType]);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (fullName.trim().length < 3) {
      next.fullName = "نام و نام خانوادگی را کامل وارد کنید.";
    }
    const m = normalizeMobile(mobile);
    if (!PERSIAN_MOBILE_RE.test(m)) {
      next.mobile = "شماره موبایل معتبر نیست. مثال: 09123456789";
    }
    if (city.trim().length < 2) {
      next.city = "شهر / شهرستان را وارد کنید.";
    }
    if (!requestType) {
      next.requestType = "یک مسیر را انتخاب کنید.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) {
      // focus first error
      const firstKey = Object.keys(errors)[0];
      if (firstKey) {
        const el = document.getElementById(`field-${firstKey}`);
        (el as HTMLElement | null)?.focus?.();
      }
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        mobile: normalizeMobile(mobile),
        city: city.trim(),
        requestType,
        referralCode: referralCode || null,
      };
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "ثبت درخواست ناموفق بود.");
      }
      setDone(true);
      toast({
        title: "درخواست ثبت شد",
        description:
          "به‌زودی برای راهنمایی با شما تماس می‌گیریم.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "خطا در ثبت",
        description:
          err instanceof Error ? err.message : "لطفاً دوباره تلاش کنید.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <section id="lead-form" className="scroll-mt-16 py-14 sm:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1040px] px-4 sm:px-6">
          <div className="mx-auto max-w-xl rounded-3xl border border-forest/20 bg-forest-soft p-8 text-center shadow-sm sm:p-10">
            <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-forest/10 text-forest">
              <CheckCircle2 className="h-8 w-8" strokeWidth={1.8} />
            </span>
            <h3 className="mt-5 text-xl font-bold text-navy">
              درخواست شما ثبت شد
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              اطلاعات اولیه شما دریافت شد. تیم راهنمایی کاتب‌کار به‌زودی برای
              بررسی وضعیت و راهنمایی با شما تماس می‌گیرد.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              در صورت نیاز، می‌توانید سؤالات خود را در بخش سؤالات متداول مرور
              کنید.
            </p>
            <a
              href="#faq"
              className="mt-6 inline-flex items-center justify-center rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-mist"
            >
              مرور سؤالات متداول
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="lead-form" className="scroll-mt-16 py-14 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1040px] px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            هنوز مطمئن نیستید از کجا شروع کنید؟
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
            اطلاعات اولیه را ثبت کنید تا برای راهنمایی با شما تماس بگیریم.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="mx-auto mt-8 max-w-xl rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7"
        >
          {/* Full name */}
          <div className="space-y-1.5">
            <Label htmlFor="field-fullName" className="text-sm font-medium text-navy">
              نام و نام خانوادگی
            </Label>
            <div className="relative">
              <User className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="field-fullName"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName)
                    setErrors((x) => ({ ...x, fullName: undefined }));
                }}
                placeholder="مثلاً: علی رضایی"
                className="h-12 pr-10 text-base"
                inputMode="text"
                autoComplete="name"
                aria-invalid={!!errors.fullName}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName}</p>
            )}
          </div>

          {/* Mobile + City grid */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="field-mobile" className="text-sm font-medium text-navy">
                شماره موبایل
              </Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="field-mobile"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value);
                    if (errors.mobile)
                      setErrors((x) => ({ ...x, mobile: undefined }));
                  }}
                  placeholder="09123456789"
                  className="kk-num h-12 pr-10 text-base tracking-normal"
                  inputMode="tel"
                  dir="ltr"
                  autoComplete="tel"
                  aria-invalid={!!errors.mobile}
                />
              </div>
              {errors.mobile && (
                <p className="text-xs text-destructive">{errors.mobile}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="field-city" className="text-sm font-medium text-navy">
                شهر / شهرستان
              </Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="field-city"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (errors.city) setErrors((x) => ({ ...x, city: undefined }));
                  }}
                  placeholder="مثلاً: تهران"
                  className="h-12 pr-10 text-base"
                  inputMode="text"
                  autoComplete="address-level2"
                  aria-invalid={!!errors.city}
                />
              </div>
              {errors.city && (
                <p className="text-xs text-destructive">{errors.city}</p>
              )}
            </div>
          </div>

          {/* Request type selector */}
          <fieldset className="mt-5 space-y-2">
            <legend className="text-sm font-medium text-navy">نوع درخواست</legend>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {REQUEST_TYPES.map((t) => {
                const active = requestType === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      setRequestType(t.value);
                      if (errors.requestType)
                        setErrors((x) => ({ ...x, requestType: undefined }));
                    }}
                    aria-pressed={active}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-center text-sm font-semibold transition-all",
                      active
                        ? "border-navy bg-navy-soft text-navy ring-1 ring-navy/20"
                        : "border-border bg-background text-muted-foreground hover:border-navy/30 hover:text-navy"
                    )}
                  >
                    {t.short}
                  </button>
                );
              })}
            </div>
            {errors.requestType && (
              <p className="text-xs text-destructive">{errors.requestType}</p>
            )}
          </fieldset>

          {/* Hidden referral (never shown to user) */}
          <input
            type="hidden"
            name="referralCode"
            value={referralCode ?? ""}
            readOnly
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-cta px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:brightness-105 hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                در حال ثبت…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                ثبت درخواست
              </>
            )}
          </button>

          <p className="mt-4 text-center text-xs leading-6 text-muted-foreground">
            با ثبت درخواست، فقط موافقت می‌کنید برای راهنمایی با شما تماس بگیریم.
            اطلاعات شما محرمانه نگه داشته می‌شود.
          </p>
        </form>
      </div>
    </section>
  );
}
