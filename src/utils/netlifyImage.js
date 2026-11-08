// در پروداکشن، تصویرهای خود سایت از CDN نتلیفای رد می‌شوند.
// در dev این مسیر وجود ندارد، پس همان آدرس اصلی برمی‌گردد.
// آدرس بیرونی (مثل picsum) دست نمی‌خورد.
export function netlifyImage(src, width) {
  if (!src || typeof src !== 'string') return src;
  if (!import.meta.env.PROD) return src;
  if (/^(https?:|blob:|data:)/i.test(src)) return src;

  const params = new URLSearchParams();
  params.set('url', src);
  if (width) params.set('w', String(width));
  params.set('q', '75');
  params.set('fm', 'webp');
  return `/.netlify/images?${params.toString()}`;
}
