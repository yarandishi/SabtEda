import { db } from "@/lib/db";

// Characters that are easy to read/say aloud (no 0/O/1/I confusion)
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const CODE_LEN = 6;
const MAX_ATTEMPTS = 10;

/**
 * Generates a unique human-friendly tracking code like "KK-7A3F9X".
 * Retries on (very unlikely) collisions.
 */
export async function generateTrackingCode(): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let code = "";
    for (let i = 0; i < CODE_LEN; i++) {
      code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
    const full = `KK-${code}`;
    const exists = await db.lead.findUnique({
      where: { trackingCode: full },
      select: { id: true },
    });
    if (!exists) return full;
  }
  // Fallback with timestamp suffix to guarantee uniqueness
  const suffix = Date.now().toString(36).toUpperCase().slice(-4);
  return `KK-${suffix}`;
}

export function normalizeTrackingCode(raw: string): string | null {
  const cleaned = raw
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/^KK?[-]?/i, "");
  const m = cleaned.match(/^[A-Z2-9]{6}$/);
  if (!m) return null;
  return `KK-${cleaned}`;
}
