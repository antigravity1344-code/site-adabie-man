# site-adabie-man — سایت شخصی و ادبی محمد قنبری

سایت شخصی و ادبی ساخته‌شده با **React + Vite** شامل شعرها، داستان‌ها و یادداشت‌های روزانه، با مدیریت محتوا از طریق **Decap CMS**.

## ✨ امکانات

- صفحه اصلی با سه بخش: یادداشت‌های روزانه، شعر تصویری، داستان‌ها
- صفحات مستقل برای شعرها، داستان‌ها و یادداشت‌ها با مسیرهای داینامیک (`/poems`، `/stories`، `/notes` و صفحه‌های جزئیات)
- فرم «ارسال اثر» (`/submit`) برای ارسال شعر/داستان و عکس توسط بازدیدکننده‌ها
- فرم تماس (`/contact`) و کامنت زیر شعر/داستان/یادداشت — هر دو روی **Supabase**
- پخش صدا (پخش‌کننده‌ی اختصاصی) و ویدیو برای شعرها و داستان‌ها
- دکمه‌های «کپی متن» و «دانلود متن» روی هر مطلب
- فونت‌های فارسی اختصاصی (وزیرمتن، شبنم، نستعلیق)
- مدیریت محتوا با **Decap CMS** در مسیر `/admin/index.html`
- طراحی راست‌به‌چپ (RTL)
- استقرار آماده روی **Netlify** (با `netlify.toml`)

## 🗂 ساختار محتوا

محتوا به‌صورت فایل‌های Markdown با **frontmatter** در پوشه `src/content` نگهداری می‌شود:

```
src/content/
├── poems/     # شعرها (نمونه: dance-of-words.md)
├── stories/   # داستان‌ها
└── notes/     # یادداشت‌های روزانه
```

هر فایل می‌تواند فیلدهایی مانند `title`، `date`، `author`/`desc`، `image`/`img` و بدنه‌ی اصلی داشته باشد. این فایل‌ها هم به‌صورت دستی و هم از پنل `/admin/index.html` قابل ویرایش‌اند.

بارگذاری محتوا از طریق `src/utils/content.js` انجام می‌شود که فایل‌های Markdown را می‌خواند، frontmatter را تحلیل می‌کند و آنها را بر اساس تاریخ مرتب می‌کند.

## 🚀 اجرای پروژه

```bash
npm install       # نصب وابستگی‌ها
npm run dev       # اجرای سرور توسعه (پیش‌فرض روی پورت 5173)
npm run build     # ساخت نسخه تولید
npm run preview   # پیش‌نمایش نسخه تولید
npm run lint      # بررسی کد با oxlint
```

## 📦 استقرار

- **Netlify:** فایل `netlify.toml` تنظیمات build و ریدایرکت‌ها (ازجمله `/admin/index.html`) را مدیریت می‌کند.
- برای استفاده از پنل مدیریت روی Netlify باید «Netlify Identity» و «Git Gateway» فعال باشد.
- **Supabase (کامنت/تماس/ارسال اثر):** یک پروژه در supabase.com بساز، فایل
  `supabase-setup.sql` را در SQL Editor اجرا کن، سپس `VITE_SUPABASE_URL` و
  `VITE_SUPABASE_ANON_KEY` را در `.env.local` (محلی) و در تنظیمات Environment
  Variables هاست (Netlify) قرار بده. جزئیات بیشتر: [docs/supabase-rls.md](docs/supabase-rls.md)

## 🛠 تکنولوژی‌ها

- React 19 + React Router 7
- Vite 8
- Decap CMS
- oxlint

## پنل محتوا

راهنمای ساده و قدم‌به‌قدم: [docs/rahnama-panel.md](docs/rahnama-panel.md)
