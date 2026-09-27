"use client";

import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";
import type { ArticleSummary } from "./types";

interface ArticlesSectionProps {
  articles: ArticleSummary[];
}

export function ArticlesSection({ articles }: ArticlesSectionProps) {
  return (
    <section id="articles" className="scroll-mt-16 py-14 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1040px] px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-navy">
            مقالات راهنما
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            راهنماهای کاربردی
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
            مطالبی برای درک بهتر فرایند ثبت ادعا در سامانه کاتب.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {articles.slice(0, 6).map((a) => (
            <Link
              key={a.id}
              href={`/articles/${a.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy-soft text-navy">
                <FileText className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <h3 className="mt-4 text-base font-bold leading-7 text-navy group-hover:text-navy-light">
                {a.title}
              </h3>
              {a.excerpt && (
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-6 text-muted-foreground">
                  {a.excerpt}
                </p>
              )}
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy transition-colors group-hover:text-navy-light">
                ادامه مطلب
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
