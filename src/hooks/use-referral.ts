"use client";

import { useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "kk_referral_code";
const MAX_LEN = 32;

/**
 * Reads the referral code from the browser (URL ?ref=K1024, falling back to
 * sessionStorage). Uses useSyncExternalStore so the read is SSR-safe and
 * does not trigger cascading renders.
 *
 * The code is NEVER shown to the user — it is attached silently to the lead
 * payload for the future pipeline:
 *   Referrer → Visit → Lead → Contact → Service → Completed → Commission
 */

function readClient(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("ref");
    if (raw) {
      const clean = raw.trim().slice(0, MAX_LEN);
      if (clean) return clean;
    }
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) return stored.slice(0, MAX_LEN);
    } catch {
      /* sessionStorage unavailable */
    }
  } catch {
    /* ignore */
  }
  return null;
}

function readServer(): string | null {
  return null;
}

// Referral code does not change during a session, so subscribe is a no-op.
function subscribe(_callback: () => void): () => void {
  return () => {};
}

export function useReferral(): string | null {
  const code = useSyncExternalStore(subscribe, readClient, readServer);

  // Persist silently for later in-session use (no React state mutation).
  useEffect(() => {
    if (!code) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
  }, [code]);

  return code;
}
