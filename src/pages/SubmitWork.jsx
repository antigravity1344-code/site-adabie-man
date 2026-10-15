import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

function SubmitWork() {
  const [contentType, setContentType] = useState('poem');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
  // این محدودیت‌ها باید دقیقاً با محدودیت‌های Row Level Security در supabase-setup.sql هم‌خوان باشند
  const MAX_TITLE_LENGTH = 200;
  const MAX_AUTHOR_NAME_LENGTH = 80;
  const MAX_BODY_LENGTH = 20000;

  // ساخت/آزادسازی پیش‌نمایش عکس انتخاب‌شده
  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  function handleImageChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      setImageFile(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('فایل انتخاب‌شده باید عکس باشد');
      setImageFile(null);
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('حجم عکس باید کمتر از ۵ مگابایت باشد');
      setImageFile(null);
      return;
    }
    setError('');
    setImageFile(file);
  }

  function removeImage() {
    setImageFile(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!name.trim() || !title.trim() || !body.trim()) {
      setError('لطفاً نام، عنوان و متن اثر را وارد کنید');
      return;
    }

    if (name.trim().length > MAX_AUTHOR_NAME_LENGTH) {
      setError(`نام شما باید کمتر از ${MAX_AUTHOR_NAME_LENGTH} حرف باشد`);
      return;
    }

    if (title.trim().length > MAX_TITLE_LENGTH) {
      setError(`عنوان اثر باید کمتر از ${MAX_TITLE_LENGTH} حرف باشد`);
      return;
    }

    if (body.trim().length > MAX_BODY_LENGTH) {
      setError(`متن اثر باید کمتر از ${MAX_BODY_LENGTH} حرف باشد`);
      return;
    }

    setSubmitting(true);

    let imageUrl = null;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('submission-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        setSubmitting(false);
        setError('آپلود عکس با خطا مواجه شد. لطفاً دوباره تلاش کنید.');
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('submission-images')
        .getPublicUrl(filePath);

      imageUrl = publicUrlData?.publicUrl || null;
    }

    const { error: insertError } = await supabase
      .from('submissions')
      .insert({
        content_type: contentType,
        title: title.trim(),
        body: body.trim(),
        author_name: name.trim(),
        author_email: email.trim() || null,
        image_url: imageUrl,
      });

    setSubmitting(false);

    if (insertError) {
      setError('ارسال اثر با خطا مواجه شد. لطفاً دوباره تلاش کنید.');
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="page">
        <Link to="/" className="back-link">← بازگشت به صفحه اصلی</Link>
        <h1 className="page-title">اثر شما ارسال شد</h1>

        <div className="submit-success">
          <span className="submit-success-icon">✓</span>
          <p className="detail-text" style={{ margin: 0 }}>
            با تشکر از ارسال اثرتان. پیش از انتشار، آن را بررسی خواهیم کرد و در صورت تأیید، روی سایت منتشر می‌شود.
          </p>
          <Link to="/" className="submit-button" style={{ textDecoration: 'none', display: 'inline-block' }}>
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/" className="back-link">← بازگشت به صفحه اصلی</Link>
      <h1 className="page-title">ارسال شعر یا داستان</h1>
      <p className="page-lead">
        اثر خود را برای بررسی و انتشار احتمالی در سایت ارسال کنید.
      </p>

      <form onSubmit={handleSubmit} className="submit-form">
        <div className="submit-field">
          <span className="submit-label">نوع اثر</span>
          <div className="submit-type-group">
            <label className={`submit-type-option ${contentType === 'poem' ? 'is-active' : ''}`}>
              <input
                type="radio"
                name="contentType"
                value="poem"
                checked={contentType === 'poem'}
                onChange={() => setContentType('poem')}
              />
              شعر
            </label>
            <label className={`submit-type-option ${contentType === 'story' ? 'is-active' : ''}`}>
              <input
                type="radio"
                name="contentType"
                value="story"
                checked={contentType === 'story'}
                onChange={() => setContentType('story')}
              />
              داستان
            </label>
          </div>
        </div>

        <div className="submit-field">
          <label className="submit-label" htmlFor="submit-name">نام شما</label>
          <input
            id="submit-name"
            type="text"
            placeholder="مثلاً: محمد قنبری"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="submit-input"
          />
        </div>

        <div className="submit-field">
          <label className="submit-label" htmlFor="submit-email">ایمیل (اختیاری، برای پاسخ)</label>
          <input
            id="submit-email"
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="submit-input"
          />
        </div>

        <div className="submit-field">
          <label className="submit-label" htmlFor="submit-title">عنوان اثر</label>
          <input
            id="submit-title"
            type="text"
            placeholder="عنوان شعر یا داستان"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="submit-input"
          />
          <span className={`submit-char-count ${title.length > MAX_TITLE_LENGTH * 0.9 ? 'is-near-limit' : ''}`}>
            {title.length} / {MAX_TITLE_LENGTH}
          </span>
        </div>

        <div className="submit-field">
          <label className="submit-label" htmlFor="submit-body">متن کامل اثر</label>
          <textarea
            id="submit-body"
            placeholder="متن کامل شعر یا داستان..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="submit-textarea"
          />
          <span className={`submit-char-count ${body.length > MAX_BODY_LENGTH * 0.9 ? 'is-near-limit' : ''}`}>
            {body.length} / {MAX_BODY_LENGTH}
          </span>
        </div>

        <div className="submit-field">
          <label className="submit-label" htmlFor="submit-image">عکس (اختیاری)</label>
          <input
            id="submit-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="submit-file-input"
          />
          {imageFile ? (
            <div className="submit-image-preview">
              <img src={imagePreviewUrl} alt="پیش‌نمایش" />
              <span style={{ fontSize: '0.8rem', color: '#8a6d3b' }}>{imageFile.name}</span>
              <button type="button" className="submit-image-remove" onClick={removeImage}>
                حذف
              </button>
            </div>
          ) : null}
        </div>

        {error ? <span className="submit-error">{error}</span> : null}

        <button type="submit" disabled={submitting} className="submit-button">
          {submitting ? 'در حال ارسال...' : 'ارسال اثر'}
        </button>
      </form>
    </div>
  );
}

export default SubmitWork;
