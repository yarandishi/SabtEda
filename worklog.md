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

---
Task ID: 3
Agent: main (Z.ai Code)
Task: Build a fully working admin panel (manage articles, FAQs, leads with statuses/tracking, referrers with counts), referrer self-registration + login + dashboard, excellent SEO, and easy hosting deployment.

Work Log:
- Database: installed bcryptjs. Extended Prisma schema with AdminUser, Article, Faq models; added passwordHash to Referrer; added adminNote to Lead. Force-reset DB and re-pushed. Regenerated client.
- Seed (prisma/seed.ts): creates default admin (admin/admin12345), demo referrer K1024 (password referrer123) + 3 sample leads, 6 default FAQs, 1 sample published article.
- Auth foundation (src/lib/auth.ts): bcrypt password hashing, HMAC-signed session token in httpOnly cookie (7-day expiry), timing-safe verification, createSession/destroySession/getSession helpers, requireAdmin/requireReferrer guards, generateUniqueReferrerCode (K + 4 unambiguous chars).
- Auth APIs: /api/admin/login|logout|me, /api/referrer/register|login|logout|me. Referrer login now requires password (legacy admin-created referrers without password must self-register).
- Admin APIs (all guarded by requireAdmin): GET /api/admin/leads (with stats + search + status filter), PATCH /api/admin/leads/[id]/status (status + adminNote), GET+POST /api/admin/referrers (list with lead counts, create), GET /api/admin/articles + POST, GET/PATCH/DELETE /api/admin/articles/[id], GET+POST /api/admin/faqs, PATCH/DELETE /api/admin/faqs/[id].
- Referrer leads API rewritten: was query-param-based (422 error), now uses session cookie for security.
- Admin panel (/admin route): login page + dashboard with 4 tabs. LeadsTab: stats cards, search/filter, table (desktop) + cards (mobile), inline status dropdown, admin note editor. ReferrersTab: list with lead counts + create form. ArticlesTab: list + full editor (title, slug, excerpt, metaDescription with char counter, keywords, coverUrl, markdown content, publish checkbox). FaqsTab: list + editor (question, answer, order, publish).
- Referrer panel (/referrer route): toggle login/register. Register: name + mobile + password → auto-generated code (e.g. KYRVK) → auto-login. Login: code + password. Dashboard: referrer code with copy-invite-link, stats cards, leads list with status badges + dates, logout.
- Public site refactor: converted / from client to Server Component that SSR-fetches published FAQs + articles, passes to HomeClient. Added ArticlesSection on homepage. Removed old referrer-panel dialog (replaced by /referrer route). Updated site-header & site-footer: "پنل معرف" now links to /referrer (was dialog).
- SEO: (1) FAQPage JSON-LD on homepage with all DB FAQs. (2) Article pages /articles/[slug] as Server Components with generateMetadata (title/description/keywords/canonical/OpenGraph twitter-article), Article JSON-LD, generateStaticParams. (3) Organization + WebSite JSON-LD globally in layout. (4) metadataBase + robots config. (5) Dynamic sitemap.ts (/ + all published articles). (6) Dynamic robots.ts (allows /, disallows /admin and /api/, declares sitemap). Removed static public/robots.txt. (7) Markdown renderer for article content with styled headings/lists/paragraphs.
- Deployment: created .env.example (DATABASE_URL, SESSION_SECRET, SITE_URL, NODE_ENV) and DEPLOYMENT.md (full Persian guide: prerequisites, env setup, db push + seed, build/start, Nginx reverse proxy config, PM2, backup, PostgreSQL upgrade path, security notes).

Verification (Agent Browser end-to-end):
- Public page: 6 FAQs + 1 article rendered server-side; JSON-LD types present = ["Organization","WebSite","FAQPage"].
- Article page /articles/[slug]: title, meta description, og:type=article, og:url, og:site_name all correct; Article JSON-LD present; markdown content rendered.
- robots.txt: allows /, disallows /admin + /api/, declares sitemap. sitemap.xml: lists homepage + published articles.
- Admin /admin: login form → admin/admin12345 → dashboard with 4 tabs. Leads tab: stats + filter chips + table with inline status select (verified options). Articles tab: created & saved test article "مدارک لازم برای ثبت ادعا" (saved as draft; published via DB; appears in public articles section). 
- Referrer /referrer: login K1024/referrer123 → dashboard shows code K1024, stats (3 total/1 new/1 contacted/1 completed), leads list with badges. Logout → register "محمد کریمی" → auto-generated code KYRVK → auto-login → dashboard with invite link http://localhost:3000/?ref=KYRVK + empty state. Verified new referrer persisted in DB.
- Lint clean, dev server stable.

Stage Summary:
- All requested features complete and browser-verified.
- Routes: / (public SSR), /admin (admin panel), /referrer (referrer register+login+dashboard), /articles/[slug] (SEO article pages), /sitemap.xml, /robots.txt.
- Credentials: admin → admin/admin12345 (CHANGE in production); demo referrer → K1024/referrer123.
- New files: src/lib/auth.ts, src/lib/data.ts, src/lib/tracking.ts (existing), src/app/admin/page.tsx, src/app/referrer/page.tsx, src/app/articles/[slug]/page.tsx, src/app/sitemap.ts, src/app/robots.ts, src/components/admin/* (login, dashboard, 4 tabs), src/components/referrer/* (auth, dashboard), src/components/katebkar/{home-client,articles-section,article-header,article-content,markdown}.ts, .env.example, DEPLOYMENT.md.
- Production-ready for self-hosted Node hosting (VPS/Node host); SQLite file-based DB; see DEPLOYMENT.md for full guide.

---
Task ID: 4
Agent: main (Z.ai Code)
Task: Fix the referrer UX gap — registration generates a code automatically but the user never sees it, so they can't log back in later (the login form requires the code).

Work Log:
- Diagnosed the issue: /api/referrer/register generates a unique code (e.g. KYRVK) and the old client just called onLoggedIn() immediately, sending the user to the dashboard without ever showing the code. On next visit, the login form asks for a code the user never knew.
- Created POST /api/referrer/recover-code: given a registered mobile number, returns the referrer code + displayName (code is semi-public — it appears in referral links anyway). Validates mobile format and account existence/active state with clear Persian errors.
- Rewrote src/components/referrer/referrer-auth.tsx:
  (1) RegisterForm now shows a dedicated SUCCESS SCREEN after registration: large auto-generated code in a highlighted card (font-display, tracking-wider), a copy-code button, an amber warning "این کد را در جای امنی یادداشت کنید...", and a "ورود به پنل" button to proceed to the dashboard. The form no longer auto-redirects.
  (2) LoginForm now has a "کد معرف را نمی‌دانم / فراموش کرده‌ام" link below the form that opens a RecoverCodeForm: enter mobile → fetches /api/referrer/recover-code → shows recovered code prominently with copy button → "بازگشت به ورود" pre-fills the recovered code into the login form's code field so the user only needs to type their password.
- Cleaned up unused onRegistered prop from RegisterForm signature.

Verification (Agent Browser end-to-end):
- Registered new referrer "رضا نوری" with mobile 09127776655 / password test1234 → success screen shows code KCUQN prominently with copy button + amber warning + "ورود به پنل" button (VLM-confirmed).
- Logged out → clicked "کد معرف را نمی‌دانم / فراموش کرده‌ام" → entered 09127776655 → recovered code KCUQN displayed with copy button.
- Clicked "بازگشت به ورود" → login form pre-filled with KCUQN → typed password → submitted → successfully logged into dashboard.
- Lint clean.

Stage Summary:
- The registration→login UX gap is fully resolved.
- Two complementary recovery paths: (1) immediate success screen right after registration (primary), (2) mobile-based code recovery for returning users who forgot (secondary).
- New files: src/app/api/referrer/recover-code/route.ts. Modified: src/components/referrer/referrer-auth.tsx.
