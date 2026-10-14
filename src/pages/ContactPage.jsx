import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import styles from './ContactPage.module.css';

const MAX_NAME = 80;
const MAX_MESSAGE = 4000;

function ContactPage() {
  const [formData, setFormData] = useState({ name: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const name = formData.name.trim();
    const message = formData.message.trim();

    if (!message) {
      setError('متن پیام را وارد کنید.');
      return;
    }
    if (name.length > MAX_NAME || message.length > MAX_MESSAGE) {
      setError('نام یا پیام بیش از حد مجاز است.');
      return;
    }

    setSubmitting(true);

    const { error: insertError } = await supabase.from('contact_messages').insert({
      author_name: name || null,
      body: message,
    });

    setSubmitting(false);

    if (insertError) {
      console.error('[contact]', insertError);
      setError(
        'ارسال پیام انجام نشد. اگر تازه جدول را ساخته‌اید، RLS و نام جدول contact_messages را در Supabase چک کنید.'
      );
      return;
    }

    setSubmitted(true);
    setFormData({ name: '', message: '' });
  };

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.backLink}>
        بازگشت به صفحه اصلی ⟵
      </Link>

      <div className={styles.card}>
        <h2>ارسال پیام</h2>
        <p>برای گفت‌وگو، همکاری یا پیام‌های شخصی، این فرم را پر کنید.</p>

        {submitted ? (
          <div className={styles.successMessage}>
            پیام شما دریافت شد و در پنل ذخیره شد. به‌زودی پاسخ می‌دهم.
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>نام</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="نام شما"
                maxLength={MAX_NAME}
                disabled={submitting}
              />
            </label>

            <label className={styles.field}>
              <span>پیام</span>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="پیام خود را بنویسید..."
                rows="6"
                maxLength={MAX_MESSAGE}
                required
                disabled={submitting}
              />
            </label>

            {error ? (
              <div style={{ color: '#b3261e', fontSize: '0.9rem' }}>{error}</div>
            ) : null}

            <button type="submit" className={styles.submitButton} disabled={submitting}>
              {submitting ? 'در حال ارسال...' : 'ارسال پیام'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ContactPage;
