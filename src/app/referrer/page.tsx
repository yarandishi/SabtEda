"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReferrerAuth } from "@/components/referrer/referrer-auth";
import { ReferrerDashboard } from "@/components/referrer/referrer-dashboard";

export default function ReferrerPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/referrer/me", { cache: "no-store" })
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
        <div className="text-sm text-muted-foreground">در حال بررسی…</div>
      </div>
    );
  }

  if (!authed) {
    return (
      <ReferrerAuth
        onLoggedIn={() => setAuthed(true)}
        onBack={() => router.push("/")}
      />
    );
  }

  return <ReferrerDashboard onLoggedOut={() => setAuthed(false)} />;
}
