"server-only";

export interface ParsedUA {
  browser: string;
  platform: string; // desktop | mobile | tablet
  os: string;
  isBot: boolean;
}

/**
 * Lightweight User-Agent parser (no external deps).
 * Extracts browser, OS, platform type, and bot detection.
 */
export function parseUserAgent(ua: string | null | undefined): ParsedUA {
  const s = (ua || "").toLowerCase();
  if (!s) {
    return { browser: "نامشخص", platform: "نامشخص", os: "نامشخص", isBot: true };
  }

  // Bot detection
  const botPatterns = [
    "bot", "crawler", "spider", "crawl", "slurp", "baidu", "yandex",
    "facebookexternalhit", "twitterbot", "telegrambot", "whatsapp",
    "googlebot", "bingbot", "duckduckbot", "applebot", "linkedinbot",
    "discordbot", "semrush", "ahrefsbot", "mj12bot", "pingdom", "uptimerobot",
  ];
  const isBot = botPatterns.some((p) => s.includes(p));

  // Browser (check in order of specificity)
  let browser = "سایر";
  if (s.includes("edg/")) browser = "Edge";
  else if (s.includes("opr/") || s.includes("opera")) browser = "Opera";
  else if (s.includes("chrome/") && !s.includes("chromium")) browser = "Chrome";
  else if (s.includes("firefox/")) browser = "Firefox";
  else if (s.includes("safari/") && !s.includes("chrome")) browser = "Safari";
  else if (s.includes("samsungbrowser")) browser = "Samsung Internet";
  else if (s.includes("ucbrowser")) browser = "UC Browser";
  else if (s.includes("trident") || s.includes("msie")) browser = "Internet Explorer";

  // OS
  let os = "سایر";
  if (s.includes("windows nt 10")) os = "Windows 10/11";
  else if (s.includes("windows nt")) os = "Windows";
  else if (s.includes("mac os x") || s.includes("macintosh")) os = "macOS";
  else if (s.includes("android")) os = "Android";
  else if (s.includes("iphone") || s.includes("ipad") || s.includes("ios")) os = "iOS";
  else if (s.includes("linux")) os = "Linux";
  else if (s.includes("cros")) os = "Chrome OS";

  // Platform
  let platform = "دسکتاپ";
  if (s.includes("ipad") || s.includes("tablet") || (s.includes("android") && !s.includes("mobile"))) {
    platform = "تبلت";
  } else if (s.includes("mobile") || s.includes("iphone") || s.includes("android")) {
    platform = "موبایل";
  }

  return { browser, platform, os, isBot };
}

/** Extracts the client IP from request headers (handles proxies). */
export function getClientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}
