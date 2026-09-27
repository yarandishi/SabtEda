"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqItem } from "./types";

interface FaqProps {
  faqs: FaqItem[];
}

export function Faq({ faqs }: FaqProps) {
  return (
    <section id="faq" className="scroll-mt-16 bg-mist py-14 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1040px] px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-navy">
            سؤالات متداول
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            شاید همین سؤال‌ها را داشته باشید
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
            پاسخ‌ها کوتاه و کلی هستند و جایگزوی مشاوره رسمی نمی‌شوند.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-2xl">
          {faqs.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card/50 py-8 text-center text-sm text-muted-foreground">
              در حال حاضر پرسشی ثبت نشده است.
            </p>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((item, i) => (
                <AccordionItem
                  key={item.id}
                  value={`item-${i}`}
                  className="overflow-hidden rounded-2xl border border-border bg-card px-5 shadow-sm data-[state=open]:ring-1 data-[state=open]:ring-navy/15"
                >
                  <AccordionTrigger className="py-4 text-right text-[15px] font-bold text-navy hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-[13.5px] leading-7 text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </section>
  );
}
