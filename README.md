# literary-portfolio — سایت شخصی و ادبی محمد قنبری

سایت شخصی و ادبی ساخته‌شده با **React + Vite** شامل شعرها، داستان‌ها و یادداشت‌های روزانه، با مدیریت محتوا از طریق **Decap CMS**.

## ✨ امکانات

- صفحه اصلی با سه بخش: یادداشت‌های روزانه، شعر تصویری، داستان‌ها
- صفحات مستقل برای شعرها، داستان‌ها و یادداشت‌ها با مسیرهای داینامیک (`/poems`، `/stories`، `/notes` و صفحه‌های جزئیات)
- مدیریت محتوا با **Decap CMS** در مسیر `/admin/index.html`
- طراحی راست‌به‌چپ (RTL) با فونت وزیرمتن
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

## 🛠 تکنولوژی‌ها

- React 19 + React Router 7
- Vite 8
- Decap CMS
- oxlint

## پنل محتوا

راهنمای ساده و قدم‌به‌قدم: [docs/rahnama-panel.md](docs/rahnama-panel.md)
