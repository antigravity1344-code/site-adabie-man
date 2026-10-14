import { useState } from 'react';
import styles from './CopyDownload.module.css';

/**
 * دکمه‌های «کپی متن» و «دانلود متن» برای محتوای یک مطلب.
 * @param {{ title: string, text: string }} props
 */
function CopyDownload({ title = 'متن', text = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const content = text || '';
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      // در محیط‌هایی که Clipboard API در دسترس نیست
      const ta = document.createElement('textarea');
      ta.value = content;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([text || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.actions}>
      <button type="button" className={styles.button} onClick={handleCopy}>
        {copied ? 'کپی شد ✓' : 'کپی متن'}
      </button>
      <button type="button" className={styles.button} onClick={handleDownload}>
        دانلود متن
      </button>
    </div>
  );
}

export default CopyDownload;
