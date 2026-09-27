"use client";

import { ShieldCheck, Info } from "lucide-react";

export function About() {
  return (
    <section id="about" className="scroll-mt-16 py-14 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1040px] px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          {/* About */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-navy">
              درباره کاتب‌کار
            </h2>
            <p className="mt-3 text-sm leading-8 text-muted-foreground">
              کاتب‌کار با هدف ساده‌سازی فرایند ثبت ادعا در سامانه کاتب شکل گرفته
              است. بسیاری از کاربران نمی‌دانند از کجا شروع کنند، چه مدارکی لازم
              است یا وضعیت ملک‌شان چگونه ارزیابی می‌شود. ما در درک این مسیر و
              پیدا کردن گام بعدی به شما کمک می‌کنیم.
            </p>
            <p className="mt-3 text-sm leading-8 text-muted-foreground">
              خدمات ما شامل راهنمایی اولیه و — در صورت تمایل شما — کمک در انجام
              مراحل توسط ارائه‌دهنده خدمت است.
            </p>

            <ul className="mt-5 space-y-2.5">
              {[
                "راهنمایی گام‌به‌گام متناسب با وضعیت شما",
                "امکان طرح سؤال بدون تعهد به ثبت درخواست کامل",
                "شفافیت درباره هزینه خدمات احتمالی",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-soft text-forest">
                    <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.2} />
                  </span>
                  <span className="text-[13.5px] leading-6 text-foreground">
                    {t}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Independence + disclaimer */}
          <div className="rounded-3xl border border-navy/15 bg-navy p-6 text-white shadow-sm sm:p-8">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white">
                <Info className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <h3 className="text-lg font-bold">استقلال و شفافیت</h3>
            </div>
            <p className="mt-3 text-sm leading-8 text-white/80">
              کاتب‌کار یک پلتفرم مستقل است و وابستگی رسمی به سازمان ثبت اسناد و
              املاک کشور ندارد. هدف ما کمک به درک مسیر است، نه جایگزینی نهادهای
              رسمی.
            </p>
            <div className="mt-4 rounded-xl bg-white/10 p-4">
              <p className="text-[13px] leading-7 text-white/85">
                هیچ تضمینی برای نتیجه پرونده، صدور سند، تأیید درخواست یا سرعت
                انجام فرایند دولتی ارائه نمی‌شود. تصمیم نهایی همواره با مراجع
                ذی‌صلاح است.
              </p>
            </div>
            <a
              href="#faq"
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-white/90 underline-offset-4 hover:underline"
            >
              مشاهده سؤالات متداول
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
