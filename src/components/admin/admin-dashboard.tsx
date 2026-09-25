"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/katebkar/logo";
import { LogOut, FileText, Users, HelpCircle, ClipboardList, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeadsTab } from "./leads-tab";
import { ReferrersTab } from "./referrers-tab";
import { ArticlesTab } from "./articles-tab";
import { FaqsTab } from "./faqs-tab";

interface AdminDashboardProps {
  onLoggedOut: () => void;
}

type Tab = "leads" | "referrers" | "articles" | "faqs";

const TABS: { value: Tab; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
  { value: "leads", label: "ثبت‌نام‌ها", icon: ClipboardList },
  { value: "referrers", label: "معرف‌ها", icon: Users },
  { value: "articles", label: "مقالات", icon: FileText },
  { value: "faqs", label: "پرسش‌ها", icon: HelpCircle },
];

export function AdminDashboard({ onLoggedOut }: AdminDashboardProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("leads");
  const [loggingOut, setLoggingOut] = useState(false);

  // If any admin API returns 401, force back to login screen.
  const handleSessionExpired = () => {
    onLoggedOut();
  };

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    onLoggedOut();
  }

  return (
    <div className="min-h-screen bg-mist">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full bg-navy-soft px-2.5 py-0.5 text-[11px] font-medium text-navy sm:inline">
              پنل مدیریت
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-navy"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">مشاهده سایت</span>
            </button>
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-destructive/10 px-3 text-xs font-medium text-destructive transition-colors hover:bg-destructive/15"
            >
              <LogOut className="h-3.5 w-3.5" />
              خروج
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6">
        {/* Tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-1.5 shadow-sm">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTab(t.value)}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                  active
                    ? "bg-navy text-white shadow-sm"
                    : "text-muted-foreground hover:bg-mist hover:text-navy"
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.8} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {tab === "leads" && <LeadsTab onSessionExpired={handleSessionExpired} />}
        {tab === "referrers" && <ReferrersTab onSessionExpired={handleSessionExpired} />}
        {tab === "articles" && <ArticlesTab onSessionExpired={handleSessionExpired} />}
        {tab === "faqs" && <FaqsTab onSessionExpired={handleSessionExpired} />}
      </div>
    </div>
  );
}
