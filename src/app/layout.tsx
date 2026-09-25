import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "کاتب‌کار | راهنمایی ثبت ادعا در سامانه کاتب",
  description:
    "کاتب‌کار پلتفرمی مستقل برای راهنمایی فرایند ثبت ادعا در سامانه کاتب است. اگر نمی‌دانید از کجا شروع کنید یا چه مدارکی لازم دارید، مسیر مناسب را با شما بررسی می‌کنیم.",
  keywords: [
    "کاتب",
    "ثبت ادعا",
    "کاتب‌کار",
    "سامانه کاتب",
    "راهنمایی ثبت ادعا",
    "اسناد و املاک",
  ],
  authors: [{ name: "KatebKar" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "کاتب‌کار | راهنمایی ثبت ادعا در سامانه کاتب",
    description:
      "راهنمایی ساده و قابل فهم برای ثبت ادعا در سامانه کاتب. مسیر مناسب را با هم پیدا می‌کنیم.",
    siteName: "کاتب‌کار",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazirmatn.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
