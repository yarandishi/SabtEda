"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/katebkar/site-header";
import { Hero } from "@/components/katebkar/hero";
import { PathCards } from "@/components/katebkar/path-cards";
import { TrustSection } from "@/components/katebkar/trust";
import { LeadForm } from "@/components/katebkar/lead-form";
import { Wizard } from "@/components/katebkar/wizard";
import { Faq } from "@/components/katebkar/faq";
import { About } from "@/components/katebkar/about";
import { SiteFooter } from "@/components/katebkar/site-footer";
import { StickyCta } from "@/components/katebkar/sticky-cta";
import { TrackingDialog } from "@/components/katebkar/tracking-dialog";
import { ReferrerPanel } from "@/components/katebkar/referrer-panel";
import { useReferral } from "@/hooks/use-referral";
import type { RequestType } from "@/components/katebkar/types";

export default function Home() {
  const referralCode = useReferral();
  const [preselectType, setPreselectType] = useState<RequestType | null>(null);

  // Dialog state
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | undefined>(undefined);
  const [referrerOpen, setReferrerOpen] = useState(false);

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

  function openReferrer() {
    setReferrerOpen(true);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader
        onTrackClick={() => openTracking()}
        onReferrerClick={openReferrer}
      />

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

        {/* 6. FAQ */}
        <Faq />

        {/* 7. About / independence */}
        <About />
      </main>

      <SiteFooter
        onTrackClick={() => openTracking()}
        onReferrerClick={openReferrer}
      />

      {/* 8. Sticky mobile CTA — hidden when form is visible */}
      <StickyCta />

      {/* 9. Tracking dialog */}
      <TrackingDialog
        open={trackingOpen}
        onOpenChange={setTrackingOpen}
        initialCode={trackingCode}
      />

      {/* 10. Referrer panel dialog */}
      <ReferrerPanel open={referrerOpen} onOpenChange={setReferrerOpen} />
    </div>
  );
}
