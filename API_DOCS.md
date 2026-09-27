# راهنمای API آمار ادمین برای MacroDroid

این مستند توضیح می‌دهد چطور از طریق گوشی موبایل (با نرم‌افزار MacroDroid) تعداد ثبت‌نام‌های جدید و سایر آمارها را چک کنید.

---

## مقدمه

یک API سبک به‌صورت زیر ساخته شده:

```
GET /api/admin/stats
```

این API با **توکن اختصاصی** محافظت می‌شود (نه با نشست مرورگر) تا بتوانید از هر نرم‌افزاری مثل MacroDroid آن را صدا بزنید.

---

## توکن API

توکن در فایل `.env` شما، متغیر `ADMIN_API_TOKEN` قرار دارد.

برای تولید یک توکن جدید:
```bash
openssl rand -hex 16
```

سپس آن را در `.env` قرار دهید:
```env
ADMIN_API_TOKEN="توکن-شما-اینجا"
```

> ⚠️ این توکن را محرمانه نگه دارید. هرکس آن را داشته باشد می‌تواند آمار را ببیند (ولی نمی‌تواند داده‌ای تغییر دهد).

---

## نحوه فراخوانی

### با cURL (تست سریع)

```bash
curl -H "Authorization: Bearer توکن-شما" https://your-domain.com/api/admin/stats
```

### پاسخ (JSON)

```json
{
  "ok": true,
  "newLeadsToday": 3,
  "newThisWeek": 12,
  "totalLeads": 45,
  "byStatus": {
    "new": 8,
    "contacted": 5,
    "service": 2,
    "completed": 28,
    "cancelled": 2
  },
  "unreadMessages": 2,
  "totalReferrers": 14,
  "generatedAt": "2026-09-27T01:30:28.318Z"
}
```

### توضیح فیلدها

| فیلد | معنی |
|---|---|
| `newLeadsToday` | ثبت‌نام‌های جدید امروز |
| `newThisWeek` | ثبت‌نام‌های ۷ روز گذشته |
| `totalLeads` | کل ثبت‌نام‌ها |
| `byStatus` | تفکیک بر اساس وضعیت |
| `unreadMessages` | پیام‌های خوانده‌نشده از معرف‌ها |
| `totalReferrers` | تعداد کل معرف‌ها |

---

## تنظیم در MacroDroid

### مرحله ۱: ساخت Macro جدید

در MacroDroid:
1. روی **+** بزنید → **Add Macro**
2. یک نام بدهید، مثلاً «بررسی ثبت‌نام کاتب‌کار»

### مرحله ۲: اضافه کردن Trigger (محرك)

روی **Trigger** بزنید → انتخاب کنید:
- **Date/Time** → **Repeat** → هر روز ساعت ۹ صبح
- یا **Notification** → وقتی نوتیفیکیشن خاصی دریافت شد
- یا دستی (یک ویجت روی صفحه)

### مرحله ۳: اضافه کردن Action

روی **Action** بزنید:
1. **Connectivity** → **HTTP Request**
2. تنظیم کنید:
   - **Method:** `GET`
   - **URL:** `https://your-domain.com/api/admin/stats`
   - **Headers:**
     - `Authorization` : `Bearer توکن-شما`
   - **Response:** روی متغیر بگذارید، مثلاً `{response}`

### مرحله ۴: استخراج تعداد ثبت‌نام‌های امروز

یک Action دیگر اضافه کنید:
- **MacroDroid Specific** → **Set Variable**
- متغیر جدید بسازید، مثلاً `newToday`
- مقدار: `{json_extract={response}|newLeadsToday}`

### مرحله ۵: نمایش نوتیفیکیشن

- **Notification** → **Display Notification**
- Title: «کاتب‌کار»
- Text: `ثبت‌نام جدید امروز: {newToday}`

### مرحله ۶ (اختیاری): هشدار وقتی ثبت‌نام جدید دارید

- **Conditions** → **If** → `{newToday}` بزرگتر از ۰
- داخل If: **Vibrate** + **Notification** با صدای خاص

---

## نمونه سناریوهای کاربردی

### ۱. اطلاع‌رسانی روزانه
هر روز ساعت ۹ صبح، یک نوتیف می‌گیرید: «ثبت‌نام جدید امروز: ۳»

### ۲. هشدار فوری
هر ۳۰ دقیقه چک کنید؛ اگر `newLeadsToday > 0`، ویبره بزنید.

### ۳. چک پیام‌های خوانده‌نشده
اگر `unreadMessages > 0`، نوتیف «پیام جدید از معرف» بدهید.

### ۴. گزارش هفتگی
هر شنبه صبح، `newThisWeek` و `totalLeads` را در یک نوتیف نشان دهید.

---

## امنیت

- ✅ توکن در هدر `Authorization` ارسال می‌شود (نه در URL)
- ✅ فقط روی HTTPS کار می‌کند (توکن رمزنگاری‌شده)
- ✅ این API فقط **خواندن** است (نمی‌تواند داده‌ای تغییر دهد)
- ❌ هرگز توکن را در چت/گیت‌هابر عمومی نگذارید
- ❌ اگر توکن لو رفت، در `.env` یک توکن جدید بگذارید و سرور را ری‌استارت کنید

---

## تست سریع

برای مطمئن شدن از کار کردن، این دستور را در ترمینال بزنید:

```bash
curl -H "Authorization: Bearer توکن-شما" https://your-domain.com/api/admin/stats
```

اگر `{"ok":true,...}` دیدید، همه چیز آماده است.
