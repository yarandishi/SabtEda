import type { Metadata } from "next";
import { Vazirmatn, El_Messiri } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const elMessiri = El_Messiri({
  variable: "--font-el-messiri",
  subsets: ["arabic", "latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const SITE_URL = process.env.SITE_URL || "https://katebkar.ir";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "کاتب‌کار | راهنمایی ثبت ادعا در سامانه کاتب",
    template: "%s | کاتب‌کار",
  },
  description:
    "کاتب‌کار پلتفرمی مستقل برای راهنمایی فرایند ثبت ادعا در سامانه کاتب است. اگر نمی‌دانید از کجا شروع کنید یا چه مدارکی لازم دارید، مسیر مناسب را با شما بررسی می‌کنیم.",
  keywords: [
    "کاتب",
    "ثبت ادعا",
    "کاتب‌کار",
    "سامانه کاتب",
    "راهنمایی ثبت ادعا",
    "اسناد و املاک",
    "پلاک ثبتی",
  ],
  authors: [{ name: "KatebKar" }],
  creator: "KatebKar",
  publisher: "KatebKar",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "کاتب‌کار | راهنمایی ثبت ادعا در سامانه کاتب",
    description:
      "راهنمایی ساده و قابل فهم برای ثبت ادعا در سامانه کاتب. مسیر مناسب را با هم پیدا می‌کنیم.",
    siteName: "کاتب‌کار",
    type: "website",
    locale: "fa_IR",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "کاتب‌کار | راهنمایی ثبت ادعا در سامانه کاتب",
    description:
      "راهنمایی ساده و قابل فهم برای ثبت ادعا در سامانه کاتب.",
  },
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "کاتب‌کار",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    description:
      "پلتفرم مستقل راهنمایی فرایند ثبت ادعا در سامانه کاتب.",
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "کاتب‌کار",
    url: SITE_URL,
    inLanguage: "fa-IR",
    publisher: { "@type": "Organization", name: "کاتب‌کار" },
  };

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazirmatn.variable} ${elMessiri.variable} font-sans antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
