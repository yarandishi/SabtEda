"use client";

import {
  BookOpen,
  Compass,
  Timer,
  ShieldCheck,
  Building2,
} from "lucide-react";

const POINTS = [
  {
    icon: BookOpen,
    title: "راهنمایی ساده و قابل فهم",
    text: "مراحل ثبت ادعا را به زبان ساده توضیح می‌دهیم.",
    accent: "navy",
  },
  {
    icon: Compass,
    title: "پیدا کردن مسیر مناسب",
    text: "با توجه به وضعیت ملک شما، مسیر درست را بررسی می‌کنیم.",
    accent: "forest",
  },
  {
    icon: Timer,
    title: "ثبت درخواست سریع",
    text: "اطلاعات اولیه را در کمتر از یک دقیقه وارد می‌کنید.",
    accent: "amber",
  },
  {
    icon: ShieldCheck,
    title: "شفافیت درباره هزینه",
    text: "هرگونه هزینه خدمات احتمالی را شفاف اعلام می‌کنیم.",
    accent: "navy",
  },
  {
    icon: Building2,
    title: "مستقل از سازمان ثبت",
    text: "کاتب‌کار وابستگی رسمی به سازمان ثبت اسناد و املاک ندارد.",
    accent: "forest",
  },
];

const ACCENT: Record<string, { bg: string; text: string }> = {
  navy: { bg: "bg-navy-soft", text: "text-navy" },
  forest: { bg: "bg-forest-soft", text: "text-forest" },
  amber: { bg: "bg-amber-soft", text: "text-amber-cta" },
};

export function TrustSection() {
  return (
    <section id="why" className="scroll-mt-16 bg-mist py-14 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1040px] px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-forest">
            اعتمادسازی
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            چرا کاتب‌کار؟
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
            هدف ما این است که قبل از هر تصمیمی، تصویر روشنی از مسیر داشته
            باشید.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {POINTS.map((p) => {
            const Icon = p.icon;
            const a = ACCENT[p.accent];
            return (
              <div
                key={p.title}
                className="flex items-start gap-3.5 rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <span
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.bg} ${a.text}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-navy">{p.title}</h3>
                  <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
                    {p.text}
                  </p>
                </div>
              </div>
            );
          })}
          {/* filler card to keep grid balanced on lg */}
          <div className="hidden items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-5 text-center lg:flex">
            <p className="text-[13px] leading-6 text-muted-foreground">
              اگر هنوز مطمئن نیستید، فقط سؤال خود را مطرح کنید — نیازی به ثبت
              درخواست کامل نیست.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
