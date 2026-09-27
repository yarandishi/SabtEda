"use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sticky bottom CTA on mobile only.
 * Hides when the lead form section is visible in the viewport.
 */
export function StickyCta() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const formEl = document.getElementById("lead-form");
    if (!formEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHidden(entry.isIntersecting);
      },
      { rootMargin: "0px", threshold: 0.05 }
    );
    observer.observe(formEl);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md transition-transform duration-300 md:hidden",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        hidden ? "translate-y-full" : "translate-y-0"
      )}
      aria-hidden={hidden}
    >
      <a
        href="#lead-form"
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-cta px-6 py-3.5 text-sm font-bold text-white shadow-md active:scale-[0.99]"
      >
        ثبت درخواست
        <ChevronLeft className="h-4 w-4" />
      </a>
    </div>
  );
}
