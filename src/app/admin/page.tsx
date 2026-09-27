"use client";

import { useEffect, useState } from "react";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setAuthed(!!d.authenticated);
      })
      .catch(() => {
        if (!cancelled) setAuthed(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist">
        <div className="text-sm text-muted-foreground">در حال بررسی نشست…</div>
      </div>
    );
  }

  if (!authed) {
    return <AdminLogin onLoggedIn={() => setAuthed(true)} />;
  }

  return <AdminDashboard onLoggedOut={() => setAuthed(false)} />;
}
