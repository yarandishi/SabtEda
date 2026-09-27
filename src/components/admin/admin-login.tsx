"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/katebkar/logo";
import { CaptchaField } from "@/components/shared/captcha-field";

interface AdminLoginProps {
  onLoggedIn: () => void;
}

export function AdminLogin({ onLoggedIn }: AdminLoginProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setCaptchaError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, captcha }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        if (data?.field === "captcha") {
          setCaptchaError(data.error);
        }
        throw new Error(data?.error || "ورود ناموفق بود.");
      }
      onLoggedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای نامشخص.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-mist to-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-center text-xl font-bold text-navy">
            ورود به پنل مدیریت
          </h1>
          <p className="mt-1.5 text-center text-xs text-muted-foreground">
            فقط برای کارکنان مجاز کاتب‌کار
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-username" className="text-sm font-medium text-navy">
                نام کاربری
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="h-12 pr-10"
                  autoComplete="username"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="text-sm font-medium text-navy">
                رمز عبور
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 pr-10"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
                {error}
              </p>
            )}

            <CaptchaField value={captcha} onChange={setCaptcha} error={captchaError} />

            <Button
              type="submit"
              disabled={loading || !username || !password || !captcha}
              className="h-12 w-full bg-navy font-semibold hover:bg-navy-dark"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "ورود"
              )}
            </Button>
          </form>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-xs text-muted-foreground transition-colors hover:text-navy"
          >
            بازگشت به سایت
          </button>
        </div>
      </div>
    </div>
  );
}
