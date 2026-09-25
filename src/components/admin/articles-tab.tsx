"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Plus, Pencil, Trash2, Eye, RefreshCw, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
}

interface ArticleEditor {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaDescription: string;
  keywords: string;
  coverUrl: string;
  published: boolean;
}

const EMPTY_EDITOR: ArticleEditor = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  metaDescription: "",
  keywords: "",
  coverUrl: "",
  published: false,
};

export function ArticlesTab() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ArticleEditor | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/articles", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (data.ok) setArticles(data.articles);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function loadForEdit(a: Article) {
    try {
      const res = await fetch(`/api/admin/articles/${a.id}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (data.ok && data.article) {
        setEditing({
          id: data.article.id,
          title: data.article.title,
          slug: data.article.slug,
          excerpt: data.article.excerpt ?? "",
          content: data.article.content ?? "",
          metaDescription: data.article.metaDescription ?? "",
          keywords: data.article.keywords ?? "",
          coverUrl: data.article.coverUrl ?? "",
          published: data.article.published,
        });
      }
    } catch {
      /* ignore */
    }
  }

  async function deleteArticle(a: Article) {
    if (!confirm(`حذف «${a.title}»؟ این عمل قابل بازگشت نیست.`)) return;
    try {
      const res = await fetch(`/api/admin/articles/${a.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setArticles((prev) => prev.filter((x) => x.id !== a.id));
      }
    } catch {
      /* ignore */
    }
  }

  if (editing) {
    return (
      <ArticleEditorForm
        editor={editing}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          مجموع مقالات: <span className="kk-num font-bold text-navy">{articles.length}</span>
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={load}
            className="h-10 gap-1.5"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button
            type="button"
            onClick={() => setEditing({ ...EMPTY_EDITOR })}
            className="h-10 gap-1.5 bg-navy hover:bg-navy-dark"
          >
            <Plus className="h-4 w-4" />
            مقاله جدید
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-card py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 py-12 text-center text-sm text-muted-foreground">
          هنوز مقاله‌ای ایجاد نشده است.
        </div>
      ) : (
        <div className="space-y-2">
          {articles.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-navy">{a.title}</p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      a.published ? "bg-forest/10 text-forest" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {a.published ? "منتشر شده" : "پیش‌نویس"}
                  </span>
                </div>
                <p className="kk-num mt-0.5 truncate text-[11px] text-muted-foreground" dir="ltr">
                  /articles/{a.slug}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                {a.published && (
                  <a
                    href={`/articles/${a.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-navy"
                    title="مشاهده"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => loadForEdit(a)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-navy"
                  title="ویرایش"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteArticle(a)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/5"
                  title="حذف"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ArticleEditorForm({
  editor,
  onCancel,
  onSaved,
}: {
  editor: ArticleEditor;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<ArticleEditor>(editor);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ArticleEditor>(key: K, value: ArticleEditor[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function save() {
    if (saving) return;
    if (form.title.trim().length < 3) {
      toast({ variant: "destructive", title: "عنوان را وارد کنید." });
      return;
    }
    setSaving(true);
    try {
      const isEdit = !!form.id;
      const res = await fetch(isEdit ? `/api/admin/articles/${form.id}` : "/api/admin/articles", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "ذخیره ناموفق بود.");
      }
      toast({ title: "ذخیره شد", description: "مقاله با موفقیت ذخیره شد." });
      onSaved();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: err instanceof Error ? err.message : "ذخیره ناموفق بود.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-navy">{form.id ? "ویرایش مقاله" : "مقاله جدید"}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm">عنوان مقاله</Label>
          <Input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="مثلاً: راهنمای گام‌به‌گام ثبت ادعا در سامانه کاتب"
            className="h-11"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-sm">آدرس (slug)</Label>
            <Input
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="خودکار از عنوان"
              className="kk-num h-11"
              dir="ltr"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">آدرس کاور (اختیاری)</Label>
            <Input
              value={form.coverUrl}
              onChange={(e) => set("coverUrl", e.target.value)}
              placeholder="https://..."
              className="kk-num h-11"
              dir="ltr"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">خلاصه کوتاه (excerpt)</Label>
          <Input
            value={form.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            placeholder="یک جمله خلاصه برای لیست مقالات و موتور جستجو"
            className="h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">توضیحات متا (Meta Description) — برای سئو</Label>
          <Input
            value={form.metaDescription}
            onChange={(e) => set("metaDescription", e.target.value)}
            placeholder="توضیح ۱۵۰ کاراکتری برای گوگل"
            maxLength={160}
            className="h-11"
          />
          <p className="text-[11px] text-muted-foreground">
            {form.metaDescription.length}/۱۶۰ کاراکتر
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">کلمات کلیدی (با کاما جدا کنید)</Label>
          <Input
            value={form.keywords}
            onChange={(e) => set("keywords", e.target.value)}
            placeholder="ثبت ادعا, سامانه کاتب, مدارک"
            className="h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">محتوای مقاله (Markdown)</Label>
          <textarea
            value={form.content}
            onChange={(e) => set("content", e.target.value)}
            placeholder={"# عنوان\n\nمتن مقاله... (Markdown پشتیبانی می‌شود)"}
            className="kk-scroll h-72 w-full resize-y rounded-xl border border-border bg-background p-3 font-mono text-sm leading-7"
            dir="rtl"
          />
          <p className="text-[11px] text-muted-foreground">
            از Markdown استفاده کنید: # عنوان، ## زیرعنوان، **پررنگ**، - لیست
          </p>
        </div>

        <label className="flex items-center gap-2.5">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => set("published", e.target.checked)}
            className="h-4 w-4 rounded border-border accent-navy"
          />
          <span className="text-sm font-medium text-navy">منتشر شود</span>
        </label>

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={save}
            disabled={saving}
            className="h-11 gap-1.5 bg-forest hover:bg-forest/90"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            ذخیره
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="h-11">
            انصراف
          </Button>
        </div>
      </div>
    </div>
  );
}
