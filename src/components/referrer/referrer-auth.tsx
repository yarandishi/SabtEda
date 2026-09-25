"use client";

import { useState } from "react";
import {
  Loader2,
  Lock,
  User,
  Phone,
  ArrowRight,
  UserPlus,
  LogIn,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/katebkar/logo";

interface ReferrerAuthProps {
  onLoggedIn: () => void;
  onBack: () => void;
}

type Mode = "login" | "register";

export function ReferrerAuth({ onLoggedIn, onBack }: ReferrerAuthProps) {
  const [mode, setMode] = useState<Mode>("login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-forest-soft/40 to-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        {/* Mode toggle */}
        <div className="mb-5 flex gap-1 rounded-xl border border-border bg-card p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={
              "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all " +
              (mode === "login"
                ? "bg-forest text-white shadow-sm"
                : "text-muted-foreground hover:text-forest")
            }
          >
            <LogIn className="h-4 w-4" />
            ورود
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={
              "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all " +
              (mode === "register"
                ? "bg-forest text-white shadow-sm"
                : "text-muted-foreground hover:text-forest")
            }
          >
            <UserPlus className="h-4 w-4" />
            ثبت‌نام
          </button>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {mode === "login" ? (
            <LoginForm onLoggedIn={onLoggedIn} switchToRegister={() => setMode("register")} />
          ) : (
            <RegisterForm onLoggedIn={onLoggedIn} switchToLogin={() => setMode("login")} />
          )}
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-navy"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            بازگشت به سایت
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginForm({
  onLoggedIn,
  switchToRegister,
}: {
  onLoggedIn: () => void;
  switchToRegister: () => void;
}) {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/referrer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "ورود ناموفق بود.");
      }
      onLoggedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-center text-xl font-bold text-navy">ورود معرف</h1>
      <p className="mt-1.5 text-center text-xs text-muted-foreground">
        با کد و رمز عبور خود وارد شوید
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-navy">کد معرف</Label>
          <div className="relative">
            <User className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="مثلاً: K1024"
              className="kk-num h-12 pr-10 uppercase"
              dir="ltr"
              autoCapitalize="characters"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-navy">رمز عبور</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 pr-10"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-destructive/5 px-3 py-2.5 text-xs text-destructive">{error}</p>
        )}

        <Button
          type="submit"
          disabled={loading || !code || !password}
          className="h-12 w-full bg-forest font-semibold hover:bg-forest/90"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "ورود"}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        هنوز ثبت‌نام نکرده‌اید؟{" "}
        <button
          type="button"
          onClick={switchToRegister}
          className="font-semibold text-forest hover:underline"
        >
          ثبت‌نام کنید
        </button>
      </p>
    </>
  );
}

function RegisterForm({
  onLoggedIn,
  switchToLogin,
}: {
  onLoggedIn: () => void;
  switchToLogin: () => void;
}) {
  const [displayName, setDisplayName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/referrer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, mobile, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "ثبت‌نام ناموفق بود.");
      }
      onLoggedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-center text-xl font-bold text-navy">ثبت‌نام معرف</h1>
      <p className="mt-1.5 text-center text-xs text-muted-foreground">
        پس از ثبت‌نام، کد معرف اختصاصی دریافت می‌کنید
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-navy">نام و نام خانوادگی</Label>
          <div className="relative">
            <User className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="مثلاً: علی رضایی"
              className="h-12 pr-10"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-navy">شماره موبایل</Label>
          <div className="relative">
            <Phone className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="09123456789"
              className="kk-num h-12 pr-10"
              dir="ltr"
              inputMode="tel"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-navy">رمز عبور</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="حداقل ۶ کاراکتر"
              className="h-12 pr-10"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-destructive/5 px-3 py-2.5 text-xs text-destructive">{error}</p>
        )}

        <Button
          type="submit"
          disabled={loading || displayName.length < 3 || !mobile || password.length < 6}
          className="h-12 w-full bg-forest font-semibold hover:bg-forest/90"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "ثبت‌نام و ورود"}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        کد معرف دارید؟{" "}
        <button
          type="button"
          onClick={switchToLogin}
          className="font-semibold text-forest hover:underline"
        >
          وارد شوید
        </button>
      </p>
    </>
  );
}
