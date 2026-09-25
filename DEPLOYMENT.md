# راهنمای استقرار کاتب‌کار روی هاست

این فایل راهنمای کامل برای اجرای پروژه روی هاست خریداری‌شده (اشتراکی یا VPS) است.

## پیش‌نیازها

- **Node.js نسخه ۱۸ یا بالاتر** (پیشنهادی: ۲۰)
- **Bun** (اختیاری ولی سریع‌تر — برای نصب: `curl -fsSL https://bun.sh/install | bash`)
- هاستی که **Node.js** را پشتیبانی کند (هاست‌های Node مانند لیارا، پارس‌پک، یا VPS)

> ⚠️ اگر هاست شما فقط PHP/آپاچی است (هاست اشتراکی سنتی)، پروژه Node.js روی آن اجرا نمی‌شود. باید هاست Node یا VPS بگیرید.

---

## مراحل استقرار

### ۱. آماده‌سازی فایل‌ها

کد پروژه را روی هاست آپلود کنید (از طریق Git یا FTP). سپس در پوشه پروژه:

```bash
# نصب پکیج‌ها
bun install
# یا اگر Node دارید:
npm install
```

### ۲. تنظیم متغیرهای محیطی

فایل `.env` بسازید (از `.env.example` کپی کنید):

```bash
cp .env.example .env
```

و مقادیر را ویرایش کنید:

```env
DATABASE_URL="file:./db/katebkar.db"
SESSION_SECRET="یک-رشته-تصادفی-بلند-اینجا"   # openssl rand -hex 32
SITE_URL="https://your-domain.com"
NODE_ENV="production"
```

> 🔐 **مهم:** حتماً `SESSION_SECRET` را به یک رشته تصادفی بلند (۳۲ کاراکتر هگز) تغییر دهید. در غیر این صورت امنیت نشست‌ها به خطر می‌افتد.

### ۳. ساخت دیتابیس و seed اولیه

```bash
# ساخت جداول
bun run db:push
# یا: npx prisma db push

# ایجاد ادمین پیش‌فرض + معرف نمونه + سؤالات و مقاله نمونه
bun run prisma/seed.ts
```

پس از seed:
- **ادمین پیش‌فرض:** نام کاربری `admin` / رمز `admin12345`
- **معرف نمونه:** کد `K1024` / رمز `referrer123`

> 🔐 **بلافاصله پس از اولین ورود به پنل ادمین، رمز عبور را تغییر دهید** (یا ادمین جدید بسازید و ادمین پیش‌فرض را حذف کنید).

### ۴. Build پروژه

```bash
bun run build
# یا: npm run build
```

### ۵. اجرا

```bash
bun run start
# یا: npm run start
```

سرور روی پورت **۳۰۰۰** اجرا می‌شود.

---

## پیکربندی پورت و Reverse Proxy

### روی VPS با Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

سپس با SSL (Certbot/Let's Encrypt) آن را امن کنید.

### روی پلتفرم‌های Node (لیارا، پارس‌پک، رندر، Railway)

این پلتفرم‌ها معمولاً پورت را خودشان مدیریت می‌کنند. کافیست پروژه را push کنید و متغیرهای محیطی را در داشبوردشان تنظیم کنید. برای دیتابیس SQLite، مطمئن شوید فایل DB در volume دائمی ذخیره می‌شود (نه در فضای ephemeral).

---

## اجرای دائمی با PM2 (پیشنهادی روی VPS)

```bash
npm install -g pm2
pm2 start npm --name "katebkar" -- start
pm2 save
pm2 startup   # برای اجرای خودکار بعد از ریبوت
```

---

## آدرس‌های مهم پس از استقرار

| صفحه | آدرس |
|---|---|
| سایت عمومی | `/` |
| پنل ادمین | `/admin` |
| پنل معرف (ثبت‌نام و ورود) | `/referrer` |
| مقاله‌ها | `/articles/[slug]` |
| نقشه سایت | `/sitemap.xml` |
| robots | `/robots.txt` |

---

## بک‌آپ دیتابیس

دیتابیس SQLite یک فایل است در مسیر `db/katebkar.db`. برای بک‌آپ، کافیست این فایل را کپی کنید:

```bash
cp db/katebkar.db db/katebkar-backup-$(date +%Y%m%d).db
```

توصیه می‌شود یک cron job روزانه برای بک‌آپ خودکار تنظیم کنید.

---

## ارتقا به PostgreSQL (برای ترافیک بالا)

SQLite برای سایت‌های کوچک و متوسط کاملاً کافی است. اگر ترافیک بسیار بالا دارید:

1. `provider` در `prisma/schema.prisma` را به `postgresql` تغییر دهید
2. `DATABASE_URL` را به آدرس PostgreSQL تغییر دهید
3. `bun run db:push` را دوباره اجرا کنید

---

## نکات امنیتی

- ✅ همیشه `SESSION_SECRET` را تنظیم کنید
- ✅ رمز ادمین پیش‌فرض را تغییر دهید
- ✅ HTTPS را فعال کنید (SSL رایگان از Let's Encrypt)
- ✅ فایل `.env` هرگز در Git commit نشود (در `.gitignore` هست)
- ✅ پوشه `db/` را از دسترسی عمومی وب مخفی نگه دارید
