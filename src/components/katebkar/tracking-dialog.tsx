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
  Search,
  Loader2,
  CircleCheck,
  CircleDot,
  Circle,
  XCircle,
  Calendar,
  MapPin,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCode?: string;
}

interface TimelineItem {
  stage: string;
  label: string;
  desc: string;
  done: boolean;
  current: boolean;
}

interface TrackResult {
  ok: boolean;
  lead?: {
    trackingCode: string;
    fullName: string;
    requestTypeLabel: string;
    city: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  timeline?: TimelineItem[];
  isCancelled?: boolean;
  isCompleted?: boolean;
  error?: string;
}

export function TrackingDialog({
  open,
  onOpenChange,
  initialCode,
}: TrackingDialogProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Reset / prefill when opening
  useEffect(() => {
    if (open) {
      setCode(initialCode ?? "");
      setResult(null);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open, initialCode]);

  async function onSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!code.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const url = `/api/leads/track?code=${encodeURIComponent(code.trim())}`;
      const res = await fetch(url, { method: "GET" });
      const data = (await res.json().catch(() => ({}))) as TrackResult;
      setResult(data);
    } catch {
      setResult({
        ok: false,
        error: "خطای ارتباط با سرور. دوباره تلاش کنید.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-y-auto rounded-3xl p-0 sm:max-w-md">
        <DialogHeader className="px-6 pt-6">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy-soft text-navy">
              <Search className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <div>
              <DialogTitle className="text-lg text-navy">
                پیگیری درخواست
              </DialogTitle>
              <DialogDescription className="text-xs">
                کد رهگیری را وارد کنید تا وضعیت درخواست را ببینید.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-2">
          <form onSubmit={onSearch} className="flex gap-2">
            <Input
              ref={inputRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="مثلاً: KK-7A3F9X"
              className="kk-num h-12 text-base tracking-wider"
              dir="ltr"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
            />
            <Button
              type="submit"
              disabled={loading || !code.trim()}
              className="h-12 bg-navy px-5 font-semibold hover:bg-navy-dark"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "بررسی"
              )}
            </Button>
          </form>
          {result && !result.ok && result.error && (
            <p className="mt-3 rounded-xl bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
              {result.error}
            </p>
          )}
        </div>

        {/* Result */}
        {result && result.ok && result.lead && result.timeline && (
          <div className="px-6 pb-6">
            {/* Lead summary */}
            <div className="rounded-2xl border border-border bg-mist/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">کد رهگیری</p>
                  <p className="kk-num font-display text-xl font-bold tracking-wider text-navy">
                    {result.lead.trackingCode}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    result.isCancelled
                      ? "bg-destructive/10 text-destructive"
                      : result.isCompleted
                      ? "bg-forest/10 text-forest"
                      : "bg-amber-soft text-amber-cta"
                  )}
                >
                  {result.isCancelled
                    ? "لغو شده"
                    : result.isCompleted
                    ? "تکمیل شده"
                    : "در حال پیگیری"}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                <span className="inline-flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  {result.lead.requestTypeLabel}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {result.lead.city}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Intl.DateTimeFormat("fa-IR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }).format(new Date(result.lead.createdAt))}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <p className="mt-5 mb-3 text-xs font-medium text-navy">
              مراحل درخواست
            </p>
            <ol className="relative space-y-1">
              {result.timeline.map((item, idx) => {
                const Icon = item.current
                  ? item.stage === "cancelled"
                    ? XCircle
                    : CircleDot
                  : item.done
                  ? CircleCheck
                  : Circle;
                const iconColor = item.current
                  ? item.stage === "cancelled"
                    ? "text-destructive"
                    : "text-amber-cta"
                  : item.done
                  ? "text-forest"
                  : "text-muted-foreground/40";
                return (
                  <li
                    key={item.stage}
                    className="relative flex gap-3 pb-4 last:pb-0"
                  >
                    {idx < result.timeline!.length - 1 && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute right-[11px] top-7 h-[calc(100%-1.25rem)] w-0.5",
                          item.done ? "bg-forest/30" : "bg-border"
                        )}
                      />
                    )}
                    <Icon
                      className={cn("relative z-10 mt-0.5 h-6 w-6 shrink-0 bg-card", iconColor)}
                      strokeWidth={2}
                    />
                    <div className="pt-0.5">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          item.current || item.done
                            ? "text-navy"
                            : "text-muted-foreground"
                        )}
                      >
                        {item.label}
                      </p>
                      <p className="text-[12px] leading-6 text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
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
