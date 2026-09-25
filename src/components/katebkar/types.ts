export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverUrl: string | null;
  publishedAt: string | null;
}

export type RequestType = "claim" | "question" | "assistance";

export interface RequestTypeMeta {
  value: RequestType;
  title: string;
  short: string;
  description: string;
}

export const REQUEST_TYPES: RequestTypeMeta[] = [
  {
    value: "claim",
    title: "ثبت ادعا",
    short: "ثبت ادعا",
    description: "راهنمایی درباره شروع و مراحل ثبت ادعا در سامانه کاتب",
  },
  {
    value: "question",
    title: "فقط سؤال دارم",
    short: "سؤال دارم",
    description:
      "اگر هنوز نمی‌دانید چه کاری باید انجام دهید، سؤال خود را مطرح کنید.",
  },
  {
    value: "assistance",
    title: "کمک در انجام کار",
    short: "کمک در انجام",
    description:
      "اگر ترجیح می‌دهید مراحل با کمک یک ارائه‌دهنده خدمت انجام شود.",
  },
];

export function getRequestTypeMeta(value: RequestType): RequestTypeMeta {
  return REQUEST_TYPES.find((t) => t.value === value) ?? REQUEST_TYPES[0];
}
