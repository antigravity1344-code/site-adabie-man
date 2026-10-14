// مسیر فایل: src/utils/content.js
// خواندن یکپارچه‌ی محتوا از پوشه‌ی src/content
// هر مطلب یک فایل Markdown با frontmatter است که توسط پنل مدیریت (Decap CMS) نیز ویرایش می‌شود.

const mdModules = import.meta.glob('/src/content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, body: raw.trim() };
  }

  const [, fm, body] = match;
  const data = {};
  let currentKey = null;

  for (const line of fm.split(/\r?\n/)) {
    // اگر خط با فاصله شروع شود، یعنی ادامه متن چندخطیِ قبلی (مثل شعر) است
    if ((line.startsWith(' ') || line.startsWith('\t')) && currentKey) {
      data[currentKey] += '\n' + line.trim();
      continue;
    }

    const idx = line.indexOf(':');
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();

    // حذف علامت‌های متن چندخطی در سیستم CMS (مثل |- یا >)
    if (['|', '|-', '>', '>-'].includes(value)) {
      value = '';
    } else {
      try {
        value = JSON.parse(value);
      } catch {
        value = value.replace(/^["']|["']$/g, '');
      }
    }

    data[key] = value;
    currentKey = key;
  }

  // تمیز کردن فاصله‌ها و اینترهای اضافه از ابتدا و انتهای متن‌ها
  for (const key in data) {
    if (typeof data[key] === 'string') {
      data[key] = data[key].trim();
    }
  }

  return { data, body: body.replace(/^[\r\n]+/, '').trim() };
}

/**
 * محتوای یک مجموعه را برمی‌گرداند.
 * @param {'poems' | 'stories' | 'notes' | 'articles'} collectionName
 */
export function getContent(collectionName) {
  const prefix = `/src/content/${collectionName}/`;
  const items = [];

  for (const path in mdModules) {
    if (!path.startsWith(prefix)) continue;

    const fileBase = path.slice(prefix.length).replace(/\.md$/, '');
    const { data, body } = parseFrontmatter(mdModules[path]);

    items.push({
      id: data.slug || fileBase,
      ...data,
      body,
      content: body,
    });
  }

  // جدیدترین مطلب اول نمایش داده شود (تاریخ ISO یا شمسیِ قابل مقایسه)
  return items.sort((a, b) => String(b.date).localeCompare(String(a.date)));
}