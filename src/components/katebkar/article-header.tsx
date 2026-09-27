import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/katebkar/logo";

interface ArticleHeaderProps {
  title: string;
  excerpt?: string | null;
  publishedAt: string | null;
}

export function ArticleHeader({ title, excerpt, publishedAt }: ArticleHeaderProps) {
  const dateLabel = publishedAt
    ? new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(publishedAt))
    : null;

  return (
    <header className="border-b border-border bg-gradient-to-b from-mist to-background">
      <div className="mx-auto w-full max-w-[820px] px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <a href="/" aria-label="کاتب‌کار — خانه">
            <Logo />
          </a>
          <Link
            href="/#articles"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-navy"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            بازگشت به سایت
          </Link>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[820px] px-4 pb-10 pt-6 sm:px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-navy">
          مقاله راهنما
        </span>
        <h1 className="mt-4 text-balance text-2xl font-extrabold leading-tight tracking-tight text-navy sm:text-3xl">
          {title}
        </h1>
        {excerpt && (
          <p className="mt-3 text-pretty text-base leading-8 text-muted-foreground">
            {excerpt}
          </p>
        )}
        {dateLabel && (
          <p className="mt-4 text-xs text-muted-foreground">
            منتشر شده در {dateLabel}
          </p>
        )}
      </div>
    </header>
  );
}
