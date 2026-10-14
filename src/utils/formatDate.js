/**
 * نمایش تاریخ برای UI: شمسی + فقط تاریخ و ساعت (بدون ثانیه).
 * در RTL: سمت راست ساعت، سمت چپ تاریخ → رشته به صورت «ساعت، تاریخ».
 */
export function formatDate(value, { withTime = true } = {}) {
  if (value == null || value === '') return '';
  const raw = String(value).trim();
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    if (raw.includes('T')) return raw.split('T')[0];
    return raw;
  }

  const datePart = (() => {
    try {
      return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(parsed);
    } catch {
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(parsed);
    }
  })();

  if (!withTime) return datePart;

  const timePart = new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(parsed);

  // RTL: first token sits on the right → hour first, then date
  return `${timePart}، ${datePart}`;
}
