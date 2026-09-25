"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "./logo";
import { Search, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  onTrackClick: () => void;
}

const NAV_LINKS = [
  { href: "#paths", label: "مسیرها" },
  { href: "#why", label: "چرا کاتب‌کار؟" },
  { href: "#faq", label: "سؤالات" },
  { href: "#about", label: "درباره ما" },
];

export function SiteHeader({ onTrackClick }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-colors duration-300",
        scrolled
          ? "border-border bg-background/85 backdrop-blur-md"
          : "border-transparent bg-background"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1040px] items-center justify-between gap-2 px-4 sm:px-6">
        <a href="#top" className="shrink-0" aria-label="کاتب‌کار — خانه">
          <Logo />
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="ناوبری اصلی">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-mist hover:text-navy"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Tracking button — icon on mobile, text on desktop */}
          <button
            type="button"
            onClick={onTrackClick}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-sm font-medium text-navy transition-colors hover:bg-mist sm:h-10 sm:px-4"
            aria-label="پیگیری درخواست"
          >
            <Search className="h-4 w-4" strokeWidth={1.8} />
            <span className="hidden sm:inline">پیگیری درخواست</span>
          </button>

          {/* Referrer panel — link to /referrer */}
          <Link
            href="/referrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-forest/30 bg-forest-soft px-3 text-sm font-medium text-forest transition-colors hover:bg-forest/15 sm:h-10 sm:px-4"
            aria-label="ورود به پنل معرف"
          >
            <UserCog className="h-4 w-4" strokeWidth={1.8} />
            <span className="hidden sm:inline">پنل معرف</span>
          </Link>

          <a
            href="#lead-form"
            className="hidden rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-navy-dark hover:shadow md:inline-flex"
          >
            ثبت درخواست
          </a>
        </div>
      </div>
    </header>
  );
}
