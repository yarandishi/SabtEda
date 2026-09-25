"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "سامانه کاتب چیست؟",
    a: "سامانه کاتب سامانه‌ای مرتبط با فرایندهای ثبتی اسناد و املاک است. هدف آن انجام بخشی از مراحل به‌صورت برخط است. کاتب‌کار به سامانه کاتب وابستگی رسمی ندارد و فقط در درک و طی کردن مسیر به شما کمک می‌کند.",
  },
  {
    q: "ثبت ادعا چیست؟",
    a: "ثبت ادعا به معنای ثبت درخواست یا ادعای شما در سامانه برای بررسی وضعیت ملک یا انجام فرایند ثبتی است. جزئیات این فرایند بسته به نوع ملک و وضعیت ثبتی آن می‌تواند متفاوت باشد.",
  },
  {
    q: "چه مدارکی لازم است؟",
    a: "مدارک موردنیاز به نوع ملک، وضعیت مالکیت و نوع ادعا بستگی دارد و ممکن است شامل مدارک هویتی، مدارک مالکیت و گواهی‌های مربوطه باشد. پس از ثبت درخواست، موارد لازم متناسب با وضعیت شما به شما اعلام می‌شود.",
  },
  {
    q: "پلاک ثبتی را نمی‌دانم، چه کنم؟",
    a: "اگر پلاک ثبتی ملک را نمی‌دانید، جای نگرانی نیست. می‌توانید درخواست تماس ثبت کنید تا برای بررسی وضعیت ثبتی و پیدا کردن مسیر درست راهنمایی شوید.",
  },
  {
    q: "آیا کاتب‌کار وابسته به سازمان ثبت است؟",
    a: "خیر. کاتب‌کار یک پلتفرم مستقل است و وابستگی رسمی به سازمان ثبت اسناد و املاک کشور ندارد. هدف ما فقط راهنمایی کاربران در فرایند است و هیچ تضمینی برای نتیجه پرونده، صدور سند یا سرعت انجام فرایند دولتی ارائه نمی‌شود.",
  },
  {
    q: "هزینه راهنمایی یا خدمات چقدر است؟",
    a: "ثبت درخواست اولیه برای راهنمایی رایگان است. در صورت نیاز به خدمات اجرایی یا کمک تخصصی‌تر، هزینه‌های احتمالی پیش از شروع کار شفاف اعلام می‌شود تا با آگاهی کامل تصمیم بگیرید.",
  },
];

export function Faq() {
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
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="overflow-hidden rounded-2xl border border-border bg-card px-5 shadow-sm data-[state=open]:ring-1 data-[state=open]:ring-navy/15"
              >
                <AccordionTrigger className="py-4 text-right text-[15px] font-bold text-navy hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-[13.5px] leading-7 text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
