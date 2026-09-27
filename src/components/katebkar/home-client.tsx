"use client";

import { useState } from "react";
import { SiteHeader } from "./site-header";
import { Hero } from "./hero";
import { PathCards } from "./path-cards";
import { TrustSection } from "./trust";
import { LeadForm } from "./lead-form";
import { Wizard } from "./wizard";
import { Faq } from "./faq";
import { About } from "./about";
import { SiteFooter } from "./site-footer";
import { StickyCta } from "./sticky-cta";
import { TrackingDialog } from "./tracking-dialog";
import { ArticlesSection } from "./articles-section";
import { useReferral } from "@/hooks/use-referral";
import type { RequestType } from "./types";
import type { FaqItem, ArticleSummary } from "./types";

interface HomeClientProps {
  faqs: FaqItem[];
  articles: ArticleSummary[];
}

export function HomeClient({ faqs, articles }: HomeClientProps) {
  const referralCode = useReferral();
  const [preselectType, setPreselectType] = useState<RequestType | null>(null);

  // Tracking dialog state
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | undefined>(undefined);

  function handlePathSelect(type: RequestType) {
    setPreselectType(type);
    requestAnimationFrame(() => {
      const el = document.getElementById("lead-form");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function openTracking(code?: string) {
    setTrackingCode(code);
    setTrackingOpen(true);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader onTrackClick={() => openTracking()} />

      <main className="flex-1">
        {/* 1. Hero — no form, single CTA */}
        <Hero />

        {/* 2. Path selection */}
        <PathCards onSelect={handlePathSelect} />

        {/* 3. Trust building */}
        <TrustSection />

        {/* 4. Request form (independent section) */}
        <LeadForm
          preselectType={preselectType}
          referralCode={referralCode}
          onTrackRequest={(code) => openTracking(code)}
        />

        {/* 5. Optional helper wizard */}
        <Wizard />

        {/* 6. Articles (SEO content) */}
        {articles.length > 0 && <ArticlesSection articles={articles} />}

        {/* 7. FAQ (DB-driven, SSR for SEO) */}
        <Faq faqs={faqs} />

        {/* 8. About / independence */}
        <About />
      </main>

      <SiteFooter onTrackClick={() => openTracking()} />

      {/* 9. Sticky mobile CTA — hidden when form is visible */}
      <StickyCta />

      {/* 10. Tracking dialog */}
      <TrackingDialog
        open={trackingOpen}
        onOpenChange={setTrackingOpen}
        initialCode={trackingCode}
      />
    </div>
  );
}
