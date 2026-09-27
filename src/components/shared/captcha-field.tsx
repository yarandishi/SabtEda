"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, Loader2, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CaptchaFieldProps {
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
}

/**
 * Simple math captcha field.
 * Fetches a challenge from /api/captcha (sets a signed httpOnly cookie),
 * displays the question, and lets the user refresh it.
 */
export function CaptchaField({ value, onChange, error }: CaptchaFieldProps) {
  const [question, setQuestion] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/captcha", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (data.ok && data.question) {
        setQuestion(data.question);
        onChange("");
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-navy">کپچا</Label>
      <div className="flex items-stretch gap-2">
        <div className="flex min-w-[7rem] shrink-0 items-center justify-center rounded-xl border border-border bg-navy-soft px-3">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-navy" />
          ) : (
            <span className="kk-num font-display text-lg font-bold tracking-wider text-navy" dir="ltr">
              {question}
            </span>
          )}
        </div>
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="پاسخ"
          className="kk-num h-12 w-24 text-center text-base"
          inputMode="numeric"
          autoComplete="off"
          aria-label="پاسخ کپچا"
        />
        <button
          type="button"
          onClick={refresh}
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-mist hover:text-navy"
          aria-label="کپچای جدید"
          title="کپچای جدید"
        >
          <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
        </button>
      </div>
      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <ShieldCheck className="h-3 w-3" />
        برای امنیت، پاسخ سوال را وارد کنید
      </p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
