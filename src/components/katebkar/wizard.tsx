"use client";

import { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Lightbulb,
  Building,
  ScrollText,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Ownership = "owner" | "heir" | "waqf" | "other";
type Plaque = "have" | "none" | "unknown";
type Owners = "one" | "few" | "many";

interface Step {
  key: "ownership" | "plaque" | "owners";
}

const STEPS: Step[] = [
  { key: "ownership" },
  { key: "plaque" },
  { key: "owners" },
];

const OWNERSHIP_OPTIONS: { value: Ownership; label: string; hint?: string }[] = [
  { value: "owner", label: "مالک", hint: "به‌نام خودم" },
  { value: "heir", label: "وراث", hint: "به‌نام متوفی" },
  { value: "waqf", label: "موقوفه", hint: "امر خیری" },
  { value: "other", label: "سایر", hint: "مثلاً اجاره‌ای" },
];

const PLAQUE_OPTIONS: { value: Plaque; label: string; hint?: string }[] = [
  { value: "have", label: "پلاک ثبتی دارم" },
  { value: "none", label: "پلاک ثبتی ندارم" },
  { value: "unknown", label: "نمی‌دانم" },
];

const OWNERS_OPTIONS: { value: Owners; label: string; hint?: string }[] = [
  { value: "one", label: "یک نفر" },
  { value: "few", label: "۲ تا ۴ نفر" },
  { value: "many", label: "بیشتر از ۴ نفر" },
];

function buildGuidance(o: Ownership, p: Plaque, ow: Owners) {
  const parts: { title: string; text: string }[] = [];

  // Plaque-based guidance
  if (p === "have") {
    parts.push({
      title: "پلاک ثبتی را دارید",
      text: "داشتن پلاک ثبتی معمولاً شروع مسیر را روشن‌تر می‌کند. می‌توانید با پلاک در سامانه کاتب وارد مراحل ثبت ادعا شوید.",
    });
  } else if (p === "unknown") {
    parts.push({
      title: "وضعیت پلاک ثبتی روشن نیست",
      text: "ابتدا بررسی کنید آیا برای ملک شما پلاک ثبتی صادر شده یا خیر. این موضوع مسیر بعدی را مشخص می‌کند.",
    });
  } else {
    parts.push({
      title: "پلاک ثبتی ندارید",
      text: "برای ملک‌های بدون پلاک ثبتی، معمولاً ابتدا باید وضعیت ثبتی ملک روشن شود. این مرحله ممکن است نیازمند مدارک مالکیت باشد.",
    });
  }

  // Ownership-based guidance
  if (o === "heir") {
    parts.push({
      title: "ملک وراثی",
      text: "برای ملک وراثی معمولاً به مدارک وراثت (مثل گواهی انحصار وراثت) نیاز دارید. هماهنگی سایر ورثه نیز ممکن است لازم باشد.",
    });
  } else if (o === "waqf") {
    parts.push({
      title: "ملک موقوفه",
      text: "املاک موقوفه معمولاً نیازمند توجه ویژه و مدارک مربوط به متولی/وقف است. مسیر آن می‌تواند متفاوت باشد.",
    });
  } else if (o === "other") {
    parts.push({
      title: "وضعیت مالکیت خاص",
      text: "برای وضعیت‌های خاص، بهتر است جزئیات را با راهنما در میان بگذارید تا مسیر مناسب بررسی شود.",
    });
  }

  // Owners count
  if (ow === "many") {
    parts.push({
      title: "تعداد مالکان زیاد است",
      text: "هرچه تعداد مالکان بیشتر باشد، هماهنگی و جمع‌آوری مدارک زمان‌برتر است. بهتر است از همان ابتدا هماهنگی‌ها را داشته باشید.",
    });
  } else if (ow === "few") {
    parts.push({
      title: "چند مالک",
      text: "با چند مالک، هماهنگی برای ثبت ادعا معمولاً ساده‌تر است ولی نیازمند توافق همه طرفین است.",
    });
  }

  return parts;
}

export function Wizard() {
  const [step, setStep] = useState(0);
  const [ownership, setOwnership] = useState<Ownership | null>(null);
  const [plaque, setPlaque] = useState<Plaque | null>(null);
  const [owners, setOwners] = useState<Owners | null>(null);
  const [finished, setFinished] = useState(false);

  const current = STEPS[step];
  const canNext =
    (current.key === "ownership" && ownership) ||
    (current.key === "plaque" && plaque) ||
    (current.key === "owners" && owners);

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setFinished(true);
    }
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  function restart() {
    setStep(0);
    setOwnership(null);
    setPlaque(null);
    setOwners(null);
    setFinished(false);
  }

  const guidance =
    finished && ownership && plaque && owners
      ? buildGuidance(ownership, plaque, owners)
      : [];

  return (
    <section id="wizard" className="scroll-mt-16 py-14 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1040px] px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-mist px-3 py-1 text-xs font-medium text-navy">
            ابزار کمکی — اختیاری
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            می‌خواهید اول وضعیت خودتان را بررسی کنید؟
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
            به چند سؤال کوتاه پاسخ دهید تا مسیر مناسب برایتان مشخص شود. این
            بررسی الزامی نیست و بدون آن هم می‌توانید درخواست ثبت کنید.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
          {!finished ? (
            <>
              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    مرحله <span className="kk-num">{step + 1}</span> از{" "}
                    <span className="kk-num">{STEPS.length}</span>
                  </span>
                  <span className="font-medium text-navy">
                    {current.key === "ownership"
                      ? "نوع مالکیت"
                      : current.key === "plaque"
                      ? "پلاک ثبتی"
                      : "تعداد مالکان"}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-mist">
                  <div
                    className="h-full rounded-full bg-navy transition-all duration-300"
                    style={{
                      width: `${((step + 1) / STEPS.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Question */}
              {current.key === "ownership" && (
                <Question
                  icon={Building}
                  title="نوع مالکیت ملک چیست؟"
                  options={OWNERSHIP_OPTIONS}
                  value={ownership}
                  onSelect={(v) => setOwnership(v as Ownership)}
                />
              )}
              {current.key === "plaque" && (
                <Question
                  icon={ScrollText}
                  title="آیا برای ملک پلاک ثبتی دارید؟"
                  options={PLAQUE_OPTIONS}
                  value={plaque}
                  onSelect={(v) => setPlaque(v as Plaque)}
                />
              )}
              {current.key === "owners" && (
                <Question
                  icon={Users}
                  title="تعداد مالکان چقدر است؟"
                  options={OWNERS_OPTIONS}
                  value={owners}
                  onSelect={(v) => setOwners(v as Owners)}
                />
              )}

              {/* Nav */}
              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={back}
                  disabled={step === 0}
                  className="inline-flex items-center gap-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-mist disabled:opacity-40"
                >
                  <ArrowRight className="h-4 w-4" />
                  قبلی
                </button>
                <button
                  type="button"
                  onClick={next}
                  disabled={!canNext}
                  className="inline-flex items-center gap-1 rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-navy-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {step === STEPS.length - 1 ? "مشاهده راهنمایی" : "بعدی"}
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            /* Result */
            <div>
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-soft text-amber-cta">
                  <Lightbulb className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <h3 className="text-lg font-bold text-navy">
                  بررسی وضعیت شما
                </h3>
              </div>

              <div className="mt-4 space-y-3">
                {guidance.map((g, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-mist/60 p-4"
                  >
                    <p className="text-sm font-bold text-navy">{g.title}</p>
                    <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
                      {g.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-forest/20 bg-forest-soft p-4">
                <p className="text-[13px] leading-6 text-muted-foreground">
                  این بررسی فقط یک نقطه شروع است و جایگزوی مشاوره رسمی نیست.
                  برای راهنمایی دقیق‌تر متناسب با پرونده شما، درخواست تماس ثبت
                  کنید.
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                <a
                  href="#lead-form"
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-amber-cta px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:brightness-105"
                >
                  ثبت درخواست تماس
                </a>
                <button
                  type="button"
                  onClick={restart}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-navy transition-colors hover:bg-mist"
                >
                  <RotateCcw className="h-4 w-4" />
                  شروع دوباره
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

interface QuestionProps<T extends string> {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  options: { value: T; label: string; hint?: string }[];
  value: T | null;
  onSelect: (v: T) => void;
}

function Question<T extends string>({
  icon: Icon,
  title,
  options,
  value,
  onSelect,
}: QuestionProps<T>) {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-navy-soft text-navy">
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </span>
        <h3 className="text-base font-bold text-navy">{title}</h3>
      </div>
      <div className="mt-4 grid gap-2.5">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onSelect(o.value)}
              aria-pressed={active}
              className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-3.5 text-right transition-all",
                active
                  ? "border-navy bg-navy-soft ring-1 ring-navy/20"
                  : "border-border bg-background hover:border-navy/30 hover:bg-mist/60"
              )}
            >
              <span
                className={cn(
                  "text-sm font-semibold",
                  active ? "text-navy" : "text-foreground"
                )}
              >
                {o.label}
              </span>
              {o.hint && (
                <span className="text-xs text-muted-foreground">{o.hint}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
