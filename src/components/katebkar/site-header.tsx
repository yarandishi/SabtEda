"use client";

import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#paths", label: "مسیرها" },
  { href: "#why", label: "چرا کاتب‌کار؟" },
  { href: "#faq", label: "سؤالات" },
  { href: "#about", label: "درباره ما" },
];

export function SiteHeader() {
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
      <div className="mx-auto flex h-16 w-full max-w-[1040px] items-center justify-between px-4 sm:px-6">
        <a href="#top" className="shrink-0" aria-label="کاتب‌کار — خانه">
          <Logo />
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="ناوبری اصلی">
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

        <a
          href="#lead-form"
          className="hidden rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-navy-dark hover:shadow md:inline-flex"
        >
          ثبت درخواست
        </a>
      </div>
    </header>
  );
}
