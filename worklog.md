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

---
Task ID: 2
Agent: main (Z.ai Code)
Task: Enhance KatebKar V3 with (1) more beautiful fonts, (2) request tracking system with tracking code + tracking dialog, (3) referrer panel login + dashboard.

Work Log:
- Fonts: Added El Messiri (display/headings) via next/font/google alongside Vazirmatn (body). Updated globals.css to apply El Messiri to h1/h2/h3/.font-display via @layer base, and registered --font-display in @theme inline.
- Prisma schema: Added `trackingCode String @unique` to Lead model. Reset DB (test data only) and re-pushed schema. Regenerated Prisma client.
- Seeded demo data via prisma/seed.ts: referrer K1024 ("معرف نمونه") + 3 sample leads (KK-DEMO01/02/03) with varied statuses (contacted/new/completed) so the referrer dashboard has content.
- Backend API:
  - src/lib/tracking.ts: generateTrackingCode() creates "KK-XXXXXX" using unambiguous alphabet (no 0/O/1/I), retries on collision; normalizeTrackingCode() for input validation.
  - Updated POST /api/leads to generate + return trackingCode in response.
  - Created GET /api/leads/track?code=... → returns lead summary + ordered timeline (new→contacted→service→completed, or cancelled branch) with done/current flags.
  - Created POST /api/referrer/login (validates code exists & active, returns referrer profile).
  - Created GET /api/referrer/leads?code=... → returns referrer profile, aggregate stats (total/new/contacted/service/completed/cancelled), and masked leads list.
- Frontend components:
  - lead-form.tsx: success state now prominently shows tracking code (font-display, copy-to-clipboard button), with "پیگیری وضعیت درخواست" button that opens tracking dialog pre-filled.
  - tracking-dialog.tsx: shadcn Dialog with code input → calls /api/leads/track → renders lead summary card + vertical timeline with stage icons (done=green check, current=amber dot, pending=grey circle, cancelled=red X).
  - referrer-panel.tsx: shadcn Dialog with login form (code input) → dashboard showing referrer code, 3 stat cards (total/contacted/completed), scrollable leads list with status badges + dates, invite link, logout. Persists session in sessionStorage for auto-login.
  - site-header.tsx: added "پیگیری درخواست" (search icon) and "پنل معرف" (user-cog icon) buttons — icon-only on mobile, icon+text on desktop.
  - site-footer.tsx: added پیگیری/پنل معرف text links in footer bottom bar.
  - page.tsx: wired both dialogs with open state + initialCode passthrough for tracking.
- Hit a caching issue: after DB reset + schema change, dev server kept running stale Prisma client (reported `trackingCode` as unknown arg + still referenced removed `referrer` relation). Fixed by killing dev server, clearing .next cache, and restarting — confirmed client now recognizes trackingCode.

Verification (Agent Browser end-to-end):
- Font upgrade: h1 computed font-family = "El Messiri" (confirmed via getComputedStyle). VLM verified headings look "significantly more elegant and distinctive" while body stays clean.
- Tracking flow: submitted a lead → success state shows code "KK-5VGXWR" → clicked پیگیری → dialog opens pre-filled → بررسی shows timeline with all 4 stages + current stage highlighted. VLM confirmed clean layout.
- Tracking validation: invalid code "KK-WRONG1" → shows "کد رهگیری معتبر نیست. مثال: KK-7A3F9X".
- Referrer flow: opened پنل معرف → entered K1024 → dashboard shows code K1024, stats (4 total, 1 contacted, 1 completed), and 4 leads including the just-submitted "سارا محمدی". VLM confirmed stat cards, lead list, and invite link all render correctly.
- Referrer validation: invalid code "BADCODE" → shows "کد معرف پیدا نشد." Auto-login from sessionStorage works on reopen.
- Header (desktop + mobile): both new buttons present; mobile shows icon-only buttons without crowding.
- Footer: پیگیری + پنل معرف links present in bottom bar.
- Sticky mobile CTA: still toggles correctly (visible at top, hides when form visible).
- Lint clean, dev server stable.

Stage Summary:
- All 3 enhancements complete and browser-verified.
- New files: src/lib/tracking.ts, src/app/api/leads/track/route.ts, src/app/api/referrer/login/route.ts, src/app/api/referrer/leads/route.ts, src/components/katebkar/tracking-dialog.tsx, src/components/katebkar/referrer-panel.tsx, prisma/seed.ts.
- Tracking code format: KK-XXXXXX (6 unambiguous chars). Stages: new → contacted → service → completed (with cancelled as a side branch).
- Referrer auth: simple code-based login (sessionStorage persistence). Dashboard shows masked leads + stats + invite link for the full future commission pipeline.
