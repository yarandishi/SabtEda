---
Task ID: 1
Agent: main (Z.ai Code)
Task: Redesign KatebKar.ir (V3) — a Persian RTL landing page guiding users through the "ثبت ادعا" (claim registration) process in the Kateb system, with a trust-first UX (question → understanding → trust → path selection → help request), referral capture, wizard, FAQ, and independence disclaimer.

Work Log:
- Examined existing project structure: blank Next.js 16 scaffold (page.tsx was a logo placeholder).
- Designed a Navy/Green/Amber color system in globals.css with CSS variables (--navy, --forest, --amber-cta, --mist, etc.) exposed as Tailwind 4 theme colors.
- Switched layout to Vazirmatn Persian font (next/font/google) with dir="rtl" and lang="fa", plus Persian SEO metadata.
- Created Prisma schema: Lead model (fullName, mobile, city, requestType, note, referralCode, status pipeline, source) + Referrer model (code, displayName, active) for future commission pipeline. Initially used a FK relation but hit a foreign-key constraint on unregistered referral codes — refactored to a plain indexed string so lead creation never fails for legacy/unregistered codes.
- Built POST /api/leads route with Iranian mobile normalization (09xxxxxxxxx), field validation, and DB persistence.
- Built modular section components in src/components/katebkar/:
  - logo.tsx (navy document+check SVG mark)
  - site-header.tsx (sticky, blur-on-scroll, desktop nav, header CTA)
  - hero.tsx (independence badge + h1 + description + single "درخواست کمک" CTA — NO form)
  - path-cards.tsx (3 cards: ثبت ادعا / فقط سؤال دارم / کمک در انجام کار; click pre-selects requestType and scrolls to form)
  - trust.tsx (چرا کاتب‌کار؟ — 5 trust points with Lucide icons)
  - lead-form.tsx (fullName, mobile, city, requestType selector, hidden referralCode, success state, toast feedback)
  - wizard.tsx (3-step optional helper: ownership/plaque/owners → context-aware guidance result + restart)
  - faq.tsx (shadcn Accordion, 6 cautious non-legal answers)
  - about.tsx (about + navy independence/disclaimer card)
  - site-footer.tsx (sticky-to-bottom mt-auto footer with link groups + independence note)
  - sticky-cta.tsx (mobile-only fixed bottom CTA, hidden via IntersectionObserver when form visible, respects safe-area)
- useReferral hook using useSyncExternalStore (SSR-safe, no cascading renders) to capture ?ref=K1024 into sessionStorage silently.
- Orchestrated all sections in page.tsx with the required order: Header → Hero → Paths → Trust → Form → Wizard → FAQ → About → Footer → Sticky CTA.

Verification (Agent Browser end-to-end):
- Page renders with all sections, Persian title, no console/page errors.
- Path card click → pre-selects requestType (verified aria-pressed) + scrolls to form.
- Form submission → success state + lead persisted to DB (verified via direct Prisma query).
- Referral capture: ?ref=K1024 stored in sessionStorage and sent with lead payload (verified DB row has referralCode: "K1024").
- Wizard: 3-step flow completes and shows context-aware guidance (e.g. "ملک وراثی", "وضعیت پلاک ثبتی روشن نیست").
- FAQ accordion expands/collapses correctly.
- Sticky mobile CTA: visible at top, hides when form in viewport, reappears on scroll away (IntersectionObserver), hidden on desktop (md:hidden).
- Desktop: path cards in 3-column grid, header nav visible, container ~1040px.
- VLM visual review (desktop + mobile screenshots): cohesive palette, strong hierarchy, modern landing-page feel, readable RTL typography, no overflow/bugs.

Stage Summary:
- V3 redesign complete and browser-verified. All 16 user requirements addressed.
- Key artifacts: src/app/page.tsx, src/app/layout.tsx, src/app/globals.css, src/app/api/leads/route.ts, prisma/schema.prisma, src/components/katebkar/*.tsx, src/hooks/use-referral.ts.
- Lint clean, dev server stable, DB schema pushed.
- Referral pipeline structure ready for future: Referrer → Visit → Lead → Contact → Service → Completed → Commission.
