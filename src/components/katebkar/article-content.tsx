"use client";

import { useMemo } from "react";
import { renderMarkdown } from "./markdown";
import { ArticleHeader } from "./article-header";

interface ArticleContentProps {
  title: string;
  excerpt?: string | null;
  publishedAt: string | null;
  content: string;
}

export function ArticleContent({
  title,
  excerpt,
  publishedAt,
  content,
}: ArticleContentProps) {
  const html = useMemo(() => renderMarkdown(content), [content]);

  return (
    <>
      <ArticleHeader title={title} excerpt={excerpt} publishedAt={publishedAt} />
      <article className="mx-auto w-full max-w-[820px] px-4 py-8 sm:px-6 sm:py-10">
        <div
          className="kk-md"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="mt-10 rounded-2xl border border-forest/20 bg-forest-soft/50 p-5">
          <p className="text-sm font-bold text-navy">به کمک نیاز دارید؟</p>
          <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
            اگر برای ثبت ادعا در سامانه کاتب نیاز به راهنمایی دارید، می‌توانید
            درخواست تماس ثبت کنید.
          </p>
          <a
            href="/#lead-form"
            className="mt-3 inline-flex items-center justify-center rounded-xl bg-amber-cta px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:brightness-105"
          >
            ثبت درخواست
          </a>
        </div>
      </article>
    </>
  );
}
