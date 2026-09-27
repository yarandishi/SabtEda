"use client";

import { FileText, HelpCircle, Handshake, ChevronLeft } from "lucide-react";
import type { RequestType } from "./types";
import { cn } from "@/lib/utils";

interface PathCardsProps {
  onSelect: (type: RequestType) => void;
}

const CARDS = [
  {
    value: "claim" as RequestType,
    title: "ثبت ادعا",
    description: "راهنمایی درباره شروع و مراحل ثبت ادعا در سامانه کاتب",
    icon: FileText,
    accent: "navy",
  },
  {
    value: "question" as RequestType,
    title: "فقط سؤال دارم",
    description:
      "اگر هنوز نمی‌دانید چه کاری باید انجام دهید، سؤال خود را مطرح کنید.",
    icon: HelpCircle,
    accent: "forest",
  },
  {
    value: "assistance" as RequestType,
    title: "کمک در انجام کار",
    description:
      "اگر ترجیح می‌دهید مراحل با کمک یک ارائه‌دهنده خدمت انجام شود.",
    icon: Handshake,
    accent: "amber",
  },
];

const ACCENT: Record<
  string,
  { iconBg: string; iconText: string; ring: string; hoverRing: string }
> = {
  navy: {
    iconBg: "bg-navy-soft",
    iconText: "text-navy",
    ring: "ring-border",
    hoverRing: "hover:ring-navy/30",
  },
  forest: {
    iconBg: "bg-forest-soft",
    iconText: "text-forest",
    ring: "ring-border",
    hoverRing: "hover:ring-forest/30",
  },
  amber: {
    iconBg: "bg-amber-soft",
    iconText: "text-amber-cta",
    ring: "ring-border",
    hoverRing: "hover:ring-amber-cta/30",
  },
};

export function PathCards({ onSelect }: PathCardsProps) {
  return (
    <section id="paths" className="scroll-mt-16 py-14 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1040px] px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            چطور می‌توانیم کمکتان کنیم؟
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
            مسیری که بیشتر به شرایط شما نزدیک است را انتخاب کنید. در هر حال
            می‌توانید فقط سؤال بپرسید یا درخواست تماس ثبت کنید.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:gap-5 md:grid-cols-3">
          {CARDS.map((card) => {
            const Icon = card.icon;
            const a = ACCENT[card.accent];
            return (
              <button
                key={card.value}
                type="button"
                onClick={() => onSelect(card.value)}
                className={cn(
                  "group relative flex flex-col items-start rounded-2xl border border-border bg-card p-6 text-right shadow-sm ring-1 ring-transparent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                  a.hoverRing
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-12 w-12 items-center justify-center rounded-xl",
                    a.iconBg,
                    a.iconText
                  )}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                </span>

                <h3 className="mt-4 text-lg font-bold text-navy">
                  {card.title}
                </h3>
                <p className="mt-1.5 text-sm leading-7 text-muted-foreground">
                  {card.description}
                </p>

                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy transition-colors group-hover:text-navy-light">
                  ادامه
                  <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
