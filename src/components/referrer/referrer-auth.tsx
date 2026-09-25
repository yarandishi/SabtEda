"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Lock,
  User,
  Phone,
  ArrowRight,
  UserPlus,
  LogIn,
  CheckCircle2,
  Copy,
  Check,
  HelpCircle,
  KeyRound,
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
  const router = useRouter();
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
            <RegisterForm
              onLoggedIn={onLoggedIn}
              switchToLogin={() => setMode("login")}
            />
          )}
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => router.push("/")}
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
  const [showRecover, setShowRecover] = useState(false);

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

  if (showRecover) {
    return (
      <RecoverCodeForm
        onBack={() => setShowRecover(false)}
        onRecovered={(recoveredCode) => {
          setCode(recoveredCode);
          setShowRecover(false);
        }}
      />
    );
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

      <div className="mt-4 space-y-2 text-center">
        <button
          type="button"
          onClick={() => setShowRecover(true)}
          className="inline-flex items-center justify-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-forest"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          کد معرف را نمی‌دانم / فراموش کرده‌ام
        </button>
        <p className="text-xs text-muted-foreground">
          هنوز ثبت‌نام نکرده‌اید؟{" "}
          <button
            type="button"
            onClick={switchToRegister}
            className="font-semibold text-forest hover:underline"
          >
            ثبت‌نام کنید
          </button>
        </p>
      </div>
    </>
  );
}

function RecoverCodeForm({
  onBack,
  onRecovered,
}: {
  onBack: () => void;
  onRecovered: (code: string) => void;
}) {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ code: string; displayName: string | null } | null>(null);
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/referrer/recover-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "یافتن کد ناموفق بود.");
      }
      setResult({ code: data.code, displayName: data.displayName });
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا.");
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  if (result) {
    return (
      <>
        <div className="flex items-center justify-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-forest/10 text-forest">
            <CheckCircle2 className="h-6 w-6" strokeWidth={1.8} />
          </span>
        </div>
        <h1 className="mt-3 text-center text-lg font-bold text-navy">کد معرف شما</h1>
        {result.displayName && (
          <p className="mt-1 text-center text-xs text-muted-foreground">{result.displayName}</p>
        )}
        <div className="mt-4 rounded-2xl border border-forest/25 bg-forest-soft/50 p-4 text-center">
          <p className="font-display kk-num text-3xl font-bold tracking-wider text-navy">
            {result.code}
          </p>
          <button
            type="button"
            onClick={copyCode}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-navy hover:underline"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-forest" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "کپی شد" : "کپی کد"}
          </button>
        </div>
        <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">
          این کد را در صفحه ورود وارد کنید. برای امنیت بیشتر، این کد را در جای امنی یادداشت کنید.
        </p>
        <Button
          type="button"
          onClick={() => onRecovered(result.code)}
          className="mt-4 h-11 w-full bg-forest font-semibold hover:bg-forest/90"
        >
          بازگشت به ورود
        </Button>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-forest-soft text-forest">
          <KeyRound className="h-6 w-6" strokeWidth={1.8} />
        </span>
      </div>
      <h1 className="mt-3 text-center text-lg font-bold text-navy">بازیابی کد معرف</h1>
      <p className="mt-1.5 text-center text-xs text-muted-foreground">
        شماره موبایلی که با آن ثبت‌نام کرده‌اید را وارد کنید
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
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

        {error && (
          <p className="rounded-xl bg-destructive/5 px-3 py-2.5 text-xs text-destructive">{error}</p>
        )}

        <Button
          type="submit"
          disabled={loading || !mobile}
          className="h-12 w-full bg-forest font-semibold hover:bg-forest/90"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "یافتن کد معرف"}
        </Button>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="mt-4 block w-full text-center text-xs font-medium text-muted-foreground transition-colors hover:text-navy"
      >
        بازگشت به ورود
      </button>
    </>
  );
}

interface RegisterResult {
  code: string;
  displayName: string | null;
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
  const [success, setSuccess] = useState<RegisterResult | null>(null);
  const [copied, setCopied] = useState(false);

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
      setSuccess({
        code: data.referrer.code,
        displayName: data.referrer.displayName,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا.");
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    if (!success) return;
    try {
      await navigator.clipboard.writeText(success.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  // ===== Success screen: show the auto-generated code prominently =====
  if (success) {
    return (
      <>
        <div className="flex items-center justify-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-forest/10 text-forest">
            <CheckCircle2 className="h-7 w-7" strokeWidth={1.8} />
          </span>
        </div>
        <h1 className="mt-4 text-center text-xl font-bold text-navy">
          ثبت‌نام موفق بود
        </h1>
        {success.displayName && (
          <p className="mt-1 text-center text-sm text-muted-foreground">
            {success.displayName} عزیز، خوش آمدید
          </p>
        )}

        <div className="mt-5 rounded-2xl border border-forest/25 bg-forest-soft/60 p-5 text-center">
          <p className="text-xs font-medium text-muted-foreground">کد معرف اختصاصی شما</p>
          <p className="font-display kk-num mt-1.5 text-3xl font-bold tracking-[0.15em] text-navy">
            {success.code}
          </p>
          <button
            type="button"
            onClick={copyCode}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-navy transition-colors hover:bg-mist"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-forest" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "کپی شد" : "کپی کد"}
          </button>
        </div>

        <div className="mt-4 rounded-xl bg-amber-soft/60 p-3.5">
          <p className="text-[12px] leading-6 text-amber-cta">
            ⚠️ این کد را در جای امنی یادداشت کنید. برای ورود دوباره به پنل معرف، به این کد و رمز عبور خود نیاز خواهید داشت.
          </p>
        </div>

        <Button
          type="button"
          onClick={onLoggedIn}
          className="mt-4 h-12 w-full bg-forest font-semibold hover:bg-forest/90"
        >
          ورود به پنل
        </Button>
      </>
    );
  }

  // ===== Registration form =====
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "ثبت‌نام"}
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
