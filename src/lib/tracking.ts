import { db } from "@/lib/db";

/**
 * Generates a unique human-friendly tracking code like "KK-1234".
 * Numeric-only for easy noting/reading by general (non-technical) users.
 * 4 digits = 9000 possible codes (1-9999), retries on collision.
 */
const MAX_ATTEMPTS = 20;

export async function generateTrackingCode(): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // 4-digit number, 1000..9999 (avoid leading zeros for clarity)
    const num = Math.floor(Math.random() * 9000) + 1000;
    const full = `KK-${num}`;
    const exists = await db.lead.findUnique({
      where: { trackingCode: full },
      select: { id: true },
    });
    if (!exists) return full;
  }
  // Extremely unlikely fallback
  const suffix = Date.now().toString().slice(-5);
  return `KK-${suffix}`;
}

/**
 * Normalizes a user-entered tracking code.
 * Accepts numeric codes like "KK-1234", "1234", "kk1234".
 * Also still accepts legacy alphanumeric codes (4 or 6 chars) for backward compatibility.
 */
export function normalizeTrackingCode(raw: string): string | null {
  const cleaned = raw
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/^KK?[-]?/i, "");
  // New numeric format: 4 digits
  if (/^\d{4}$/.test(cleaned)) return `KK-${cleaned}`;
  // Legacy alphanumeric format: 4 or 6 unambiguous chars
  if (/^[A-Z2-9]{4}$|^[A-Z2-9]{6}$/.test(cleaned)) return `KK-${cleaned}`;
  return null;
}
