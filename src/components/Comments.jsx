import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { formatDate } from '../utils/formatDate';
import styles from './Comments.module.css';

/**
 * بخش کامنت‌گذاری برای یک مطلب خاص.
 * @param {{ contentType: string, contentId: string }} props
 *   contentType: نوع محتوا، مثلاً 'story' یا 'poem' یا 'note'
 *   contentId: شناسه‌ی همون مطلب خاص
 */
function Comments({ contentType, contentId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const MAX_NAME = 80;
  const MAX_BODY = 2000;

  useEffect(() => {
    let isCancelled = false;

    async function loadComments() {
      setLoading(true);
      setError('');
      setNotice('');
      const { data, error: fetchError } = await supabase
        .from('comments')
        .select('*')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .order('created_at', { ascending: false });

      if (!isCancelled) {
        if (fetchError) {
          setError('خطا در بارگذاری نظرات');
        } else {
          setComments(data || []);
        }
        setLoading(false);
      }
    }

    loadComments();

    return () => {
      isCancelled = true;
    };
  }, [contentType, contentId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    const trimmedName = name.trim();
    const trimmedBody = body.trim();
    if (!trimmedName || !trimmedBody) {
      setError('نام و متن نظر را وارد کنید.');
      return;
    }
    if (trimmedName.length > MAX_NAME || trimmedBody.length > MAX_BODY) {
      setError('نام یا متن نظر بیش از حد مجاز است.');
      return;
    }

    setSubmitting(true);

    const { error: insertError } = await supabase.from('comments').insert({
      content_type: contentType,
      content_id: contentId,
      author_name: trimmedName,
      body: trimmedBody,
      approved: false,
    });

    setSubmitting(false);

    if (insertError) {
      setError('ارسال نظر با خطا مواجه شد');
      return;
    }

    setName('');
    setBody('');
    setNotice('نظر شما ثبت شد و پس از تأیید نمایش داده می‌شود.');
  }

  return (
    <div className={styles.commentsSection}>
      <h3 className={styles.title}>نظرات</h3>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="text"
          placeholder="نام شما"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className={styles.textarea}
          placeholder="نظر خود را بنویسید..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        {notice ? <p className={styles.empty}>{notice}</p> : null}
        {error ? <span className={styles.error}>{error}</span> : null}
        <button type="submit" className={styles.submitButton} disabled={submitting}>
          {submitting ? 'در حال ارسال...' : 'ارسال نظر'}
        </button>
      </form>

      {loading ? (
        <p className={styles.empty}>در حال بارگذاری نظرات...</p>
      ) : error ? null : comments.length === 0 ? (
        <p className={styles.empty}>هنوز نظری ثبت نشده. اولین نفر باشید.</p>
      ) : (
        <div className={styles.list}>
          {comments.map((comment) => (
            <div key={comment.id} className={styles.commentItem}>
              <div className={styles.commentHeader}>
                <span className={styles.commentName}>{comment.author_name}</span>
                <span className={styles.commentDate}>
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className={styles.commentBody}>{comment.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Comments;
