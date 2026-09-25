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
import { useReferral } from "@/hooks/use-referral";
import type { RequestType } from "@/components/katebkar/types";

export default function Home() {
  const referralCode = useReferral();
  const [preselectType, setPreselectType] = useState<RequestType | null>(null);

  function handlePathSelect(type: RequestType) {
    setPreselectType(type);
    // smooth-scroll to form; allow state to apply first
    requestAnimationFrame(() => {
      const el = document.getElementById("lead-form");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* 1. Hero — no form, single CTA */}
        <Hero />

        {/* 2. Path selection */}
        <PathCards onSelect={handlePathSelect} />

        {/* 3. Trust building */}
        <TrustSection />

        {/* 4. Request form (independent section) */}
        <LeadForm preselectType={preselectType} referralCode={referralCode} />

        {/* 5. Optional helper wizard */}
        <Wizard />

        {/* 6. FAQ */}
        <Faq />

        {/* 7. About / independence */}
        <About />
      </main>

      <SiteFooter />

      {/* 8. Sticky mobile CTA — hidden when form is visible */}
      <StickyCta />
    </div>
  );
}
