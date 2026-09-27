"use client";

import Link from "next/link";
import { Logo } from "./logo";

interface SiteFooterProps {
  onTrackClick: () => void;
}

const FOOTER_LINKS = [
  {
    title: "مسیرها",
    links: [
      { label: "ثبت ادعا", href: "#paths" },
      { label: "طرح سؤال", href: "#paths" },
      { label: "کمک در انجام کار", href: "#paths" },
    ],
  },
  {
    title: "راهنما",
    links: [
      { label: "سؤالات متداول", href: "#faq" },
      { label: "بررسی وضعیت (ویزارد)", href: "#wizard" },
      { label: "درباره کاتب‌کار", href: "#about" },
    ],
  },
  {
    title: "تماس",
    links: [
      { label: "ثبت درخواست", href: "#lead-form" },
      { label: "چرا کاتب‌کار؟", href: "#why" },
    ],
  },
];

export function SiteFooter({ onTrackClick }: SiteFooterProps) {
  return (
    <footer className="mt-auto border-t border-border bg-navy-dark text-white">
      <div className="mx-auto w-full max-w-[1040px] px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-navy">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
                <path d="M13 3v4h4" />
                <path d="m9.5 13.5 2 2 3.5-3.5" />
              </svg>
            </span>
            <p className="mt-3 text-lg font-bold">
              کاتب<span className="text-forest">کار</span>
            </p>
            <p className="mt-2 max-w-xs text-[13px] leading-6 text-white/65">
              راهنمایی ساده و قابل فهم برای فرایند ثبت ادعا در سامانه کاتب.
            </p>
          </div>

          {/* Link groups */}
          {FOOTER_LINKS.map((g) => (
            <div key={g.title}>
              <h4 className="text-sm font-bold text-white/90">{g.title}</h4>
              <ul className="mt-3 space-y-2">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-[13px] text-white/65 transition-colors hover:text-white"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Independence note */}
        <div className="mt-10 rounded-xl bg-white/5 p-4">
          <p className="text-[12.5px] leading-6 text-white/70">
            کاتب‌کار یک پلتفرم مستقل است و وابستگی رسمی به سازمان ثبت اسناد و
            املاک کشور ندارد. هیچ تضمینی برای نتیجه پرونده، صدور سند یا سرعت
            انجام فرایند دولتی ارائه نمی‌شود.
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-center sm:flex-row sm:text-right">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-start">
            <button
              type="button"
              onClick={onTrackClick}
              className="text-xs text-white/65 transition-colors hover:text-white"
            >
              پیگیری درخواست
            </button>
            <Link
              href="/referrer"
              className="text-xs text-white/65 transition-colors hover:text-white"
            >
              ورود به پنل معرف
            </Link>
            <p className="text-xs text-white/55">
              © {new Date().getFullYear()} کاتب‌کار — تمامی حقوق محفوظ است.
            </p>
          </div>
          <p className="text-xs text-white/55">
            ساخته‌شده برای راهنمایی کاربران سامانه کاتب
          </p>
        </div>
      </div>
    </footer>
  );
}
