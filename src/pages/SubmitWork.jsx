import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

function SubmitWork() {
  const [contentType, setContentType] = useState('poem');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

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
    setError('');
    setImageFile(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!name.trim() || !title.trim() || !body.trim()) {
      setError('لطفاً نام، عنوان و متن اثر را وارد کنید');
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
        <p className="detail-text">
          با تشکر از ارسال اثرتان. به‌زودی آن را بررسی خواهیم کرد.
        </p>
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

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          maxWidth: '560px',
          marginTop: '20px',
        }}
      >
        <div style={{ display: 'flex', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
            <input
              type="radio"
              name="contentType"
              value="poem"
              checked={contentType === 'poem'}
              onChange={() => setContentType('poem')}
            />
            شعر
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
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

        <input
          type="text"
          placeholder="نام شما"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: '10px 14px',
            border: '1px solid #d8d0c2',
            borderRadius: '10px',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
          }}
        />

        <input
          type="email"
          placeholder="ایمیل شما (اختیاری، برای پاسخ)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: '10px 14px',
            border: '1px solid #d8d0c2',
            borderRadius: '10px',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
          }}
        />

        <input
          type="text"
          placeholder="عنوان اثر"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            padding: '10px 14px',
            border: '1px solid #d8d0c2',
            borderRadius: '10px',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
          }}
        />

        <textarea
          placeholder="متن کامل شعر یا داستان..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          style={{
            padding: '10px 14px',
            border: '1px solid #d8d0c2',
            borderRadius: '10px',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
            resize: 'vertical',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.9rem', color: '#555' }}>
            عکس (اختیاری)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{
              fontFamily: 'inherit',
              fontSize: '0.9rem',
            }}
          />
          {imageFile ? (
            <span style={{ fontSize: '0.8rem', color: '#8a6d3b' }}>
              انتخاب شد: {imageFile.name}
            </span>
          ) : null}
        </div>

        {error ? <span style={{ color: '#b3261e', fontSize: '0.85rem' }}>{error}</span> : null}

        <button
          type="submit"
          disabled={submitting}
          style={{
            alignSelf: 'flex-start',
            padding: '10px 26px',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
            fontWeight: 600,
            color: '#fff',
            background: '#2f2a24',
            border: 'none',
            borderRadius: '999px',
            cursor: 'pointer',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? 'در حال ارسال...' : 'ارسال اثر'}
        </button>
      </form>
    </div>
  );
}

export default SubmitWork;
