"use client";

/**
 * Wrapper around fetch for admin API calls.
 * If the response is 401 (session expired/invalid), calls onUnauthorized
 * so the dashboard can redirect to the login screen.
 */
export async function adminFetch(
  input: string,
  onUnauthorized: () => void,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(input, { ...init, cache: "no-store" });
  if (res.status === 401) {
    onUnauthorized();
  }
  return res;
}
