import { db } from "@/lib/db";

// Characters that are easy to read/say aloud (no 0/O/1/I confusion)
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
// Short, easy-to-note code: 4 chars (e.g. KK-7K3M) — ~1M combinations.
const CODE_LEN = 4;
const MAX_ATTEMPTS = 15;

/**
 * Generates a unique human-friendly tracking code like "KK-7K3M".
 * Short enough to easily note down and read over the phone.
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

/**
 * Normalizes a user-entered tracking code.
 * Accepts 4-char (new format, e.g. KK-7K3M) and 6-char (legacy, e.g. KK-7A3F9X).
 * Tolerant of missing "KK-" prefix, spaces, and lowercase.
 */
export function normalizeTrackingCode(raw: string): string | null {
  const cleaned = raw
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/^KK?[-]?/i, "");
  // Accept 4 OR 6 unambiguous chars (4 = new, 6 = legacy)
  const m = cleaned.match(/^[A-Z2-9]{4}$|^[A-Z2-9]{6}$/);
  if (!m) return null;
  return `KK-${cleaned}`;
}
