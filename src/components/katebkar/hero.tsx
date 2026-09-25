"use client";

import { ChevronLeft, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-border bg-gradient-to-b from-mist via-background to-background"
    >
      {/* subtle decorative shapes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-navy-soft opacity-60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-10 h-56 w-56 rounded-full bg-forest-soft opacity-70 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-[1040px] px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          {/* Independence badge */}
          <span className="kk-rise inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-forest" />
            پلتفرم مستقل — وابسته به سازمان ثبت نیست
          </span>

          {/* Headline */}
          <h1
            className="kk-rise mt-6 text-balance text-3xl font-extrabold leading-[1.3] tracking-tight text-navy sm:text-4xl lg:text-[2.75rem]"
            style={{ animationDelay: "60ms" }}
          >
            برای ثبت ادعا در کاتب نیاز به راهنمایی دارید؟
          </h1>

          {/* Description */}
          <p
            className="kk-rise mx-auto mt-5 max-w-xl text-pretty text-base leading-8 text-muted-foreground sm:text-lg"
            style={{ animationDelay: "120ms" }}
          >
            اگر نمی‌دانید از کجا شروع کنید، چه مدارکی لازم دارید یا وضعیت
            ملک‌تان چگونه است، مسیر مناسب را با شما بررسی می‌کنیم.
          </p>

          {/* Primary CTA */}
          <div
            className="kk-rise mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "180ms" }}
          >
            <a
              href="#lead-form"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-cta px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:brightness-105 hover:shadow-lg active:scale-[0.98] sm:w-auto"
            >
              درخواست کمک
              <ChevronLeft className="h-4 w-4" />
            </a>
            <a
              href="#paths"
              className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-navy transition-colors hover:bg-mist sm:w-auto"
            >
              مشاهده مسیرها
            </a>
          </div>

          {/* Reassurance line */}
          <p
            className="kk-rise mt-6 text-xs text-muted-foreground"
            style={{ animationDelay: "240ms" }}
          >
            بدون تعهد اولیه — فقط اطلاعات اولیه برای راهنمایی
          </p>
        </div>
      </div>
    </section>
  );
}
