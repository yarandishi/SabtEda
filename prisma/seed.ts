/**
 * Seed script: creates default admin user, demo referrer, sample FAQs, sample article.
 * Run with: bun run prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  // ===== Admin user =====
  const adminPass = await bcrypt.hash("admin12345", 10);
  const admin = await db.adminUser.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: adminPass,
      displayName: "مدیر کاتب‌کار",
    },
  });
  console.log("Admin user ready:", admin.username, "(password: admin12345)");

  // ===== Demo referrer (with password for self-login) =====
  const refPass = await bcrypt.hash("referrer123", 10);
  const ref = await db.referrer.upsert({
    where: { code: "K1024" },
    update: { passwordHash: refPass },
    create: {
      code: "K1024",
      displayName: "معرف نمونه",
      contact: "09120000000",
      passwordHash: refPass,
      active: true,
    },
  });
  console.log("Referrer ready:", ref.code, "(password: referrer123)");

  // ===== Sample leads attributed to K1024 =====
  const samples = [
    {
      trackingCode: "KK-DEMO01",
      fullName: "کاربر نمونه یک",
      mobile: "09121110001",
      city: "تهران",
      requestType: "claim",
      status: "contacted",
      referralCode: "K1024",
    },
    {
      trackingCode: "KK-DEMO02",
      fullName: "کاربر نمونه دو",
      mobile: "09121110002",
      city: "اصفهان",
      requestType: "question",
      status: "new",
      referralCode: "K1024",
    },
    {
      trackingCode: "KK-DEMO03",
      fullName: "کاربر نمونه سه",
      mobile: "09121110003",
      city: "شیراز",
      requestType: "assistance",
      status: "completed",
      referralCode: "K1024",
    },
  ];
  for (const s of samples) {
    await db.lead.upsert({
      where: { trackingCode: s.trackingCode },
      update: {},
      create: s,
    });
  }
  console.log("Sample leads ready:", samples.length);

  // ===== Default FAQs (in DB now, admin-managed) =====
  const defaultFaqs = [
    {
      question: "سامانه کاتب چیست؟",
      answer:
        "سامانه کاتب سامانه‌ای مرتبط با فرایندهای ثبتی اسناد و املاک است. هدف آن انجام بخشی از مراحل به‌صورت برخط است. کاتب‌کار به سامانه کاتب وابستگی رسمی ندارد و فقط در درک و طی کردن مسیر به شما کمک می‌کند.",
    },
    {
      question: "ثبت ادعا چیست؟",
      answer:
        "ثبت ادعا به معنای ثبت درخواست یا ادعای شما در سامانه برای بررسی وضعیت ملک یا انجام فرایند ثبتی است. جزئیات این فرایند بسته به نوع ملک و وضعیت ثبتی آن می‌تواند متفاوت باشد.",
    },
    {
      question: "چه مدارکی لازم است؟",
      answer:
        "مدارک موردنیاز به نوع ملک، وضعیت مالکیت و نوع ادعا بستگی دارد و ممکن است شامل مدارک هویتی، مدارک مالکیت و گواهی‌های مربوطه باشد. پس از ثبت درخواست، موارد لازم متناسب با وضعیت شما اعلام می‌شود.",
    },
    {
      question: "پلاک ثبتی را نمی‌دانم، چه کنم؟",
      answer:
        "اگر پلاک ثبتی ملک را نمی‌دانید، جای نگرانی نیست. می‌توانید درخواست تماس ثبت کنید تا برای بررسی وضعیت ثبتی و پیدا کردن مسیر درست راهنمایی شوید.",
    },
    {
      question: "آیا کاتب‌کار وابسته به سازمان ثبت است؟",
      answer:
        "خیر. کاتب‌کار یک پلتفرم مستقل است و وابستگی رسمی به سازمان ثبت اسناد و املاک کشور ندارد. هدف ما فقط راهنمایی کاربران در فرایند است و هیچ تضمینی برای نتیجه پرونده، صدور سند یا سرعت انجام فرایند دولتی ارائه نمی‌شود.",
    },
    {
      question: "هزینه راهنمایی یا خدمات چقدر است؟",
      answer:
        "ثبت درخواست اولیه برای راهنمایی رایگان است. در صورت نیاز به خدمات اجرایی یا کمک تخصصی‌تر، هزینه‌های احتمالی پیش از شروع کار شفاف اعلام می‌شود.",
    },
  ];
  for (let i = 0; i < defaultFaqs.length; i++) {
    const f = defaultFaqs[i];
    await db.faq.upsert({
      where: { id: `seed-faq-${i + 1}` },
      update: {},
      create: {
        id: `seed-faq-${i + 1}`,
        question: f.question,
        answer: f.answer,
        order: i,
        published: true,
      },
    });
  }
  console.log("Default FAQs ready:", defaultFaqs.length);

  // ===== Sample published article for SEO =====
  const articleSlug = "rahnamoy-sabt-edda-kateb";
  await db.article.upsert({
    where: { slug: articleSlug },
    update: {},
    create: {
      slug: articleSlug,
      title: "راهنمای گام‌به‌گام ثبت ادعا در سامانه کاتب",
      excerpt:
        "هر آنچه باید قبل از شروع ثبت ادعا در سامانه کاتب بدانید؛ از مدارک لازم تا مراحل اصلی و نکات مهم.",
      metaDescription:
        "راهنمای کامل و ساده ثبت ادعا در سامانه کاتب: مدارک لازم، مراحل گام‌به‌گام، وضعیت ملک و نکات مهم. کاتب‌کار، پلتفرم مستقل راهنمایی.",
      keywords: "ثبت ادعا, سامانه کاتب, مدارک ثبت ادعا, راهنمای کاتب",
      content: `# راهنمای گام‌به‌گام ثبت ادعا در سامانه کاتب

ثبت ادعا در سامانه کاتب می‌تواند برای کسانی که برای اولین‌بار با فرایندهای ثبتی مواجه می‌شوند، پیچیده به نظر برسد. در این مقاله مراحل کلی را به زبان ساده مرور می‌کنیم.

## ثبت ادعا چیست؟

ثبت ادعا به معنای ثبت درخواست شما در سامانه برای بررسی وضعیت ملک یا انجام فرایند ثبتی است. این فرایند بسته به نوع ملک و وضعیت ثبتی آن می‌تواند متفاوت باشد.

## مدارک لازم

مدارک موردنیار به وضعیت شما بستگی دارد اما معمولاً شامل این موارد است:

- مدارک هویتی
- مدارک مالکیت
- گواهی‌های مربوطه (مانند انحصار وراثت برای ملک وراثی)

## مراحل کلی

1. بررسی وضعیت ملک و پلاک ثبتی
2. آماده‌سازی مدارک اولیه
3. ورود به سامانه و ثبت ادعا
4. پیگیری وضعیت

## نکات مهم

- اگر پلاک ثبتی ندارید، ابتدا وضعیت ثبتی ملک را روشن کنید.
- برای ملک وراثی، هماهنگی سایر ورثه لازم است.
- هرگونه هزینه خدمات احتمالی باید پیش از شروع شفاف اعلام شود.

## کاتب‌کار چطور کمک می‌کند؟

کاتب‌کار یک پلتفرم مستقل است که در درک مسیر و پیدا کردن گام بعدی به شما کمک می‌کند. هیچ تضمینی برای نتیجه پرونده ارائه نمی‌شود و تصمیم نهایی همواره با مراجع ذی‌صلاح است.`,
      published: true,
      publishedAt: new Date(),
    },
  });
  console.log("Sample article ready:", articleSlug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
