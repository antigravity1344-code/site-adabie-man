import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './DailyNotes.module.css';
import { getContent } from '../utils/content';
import { supabase } from '../utils/supabaseClient';
import { COMMENTS_ENABLED } from '../utils/featureFlags';
import { formatDate } from '../utils/formatDate';
import Comments from './Comments.jsx';

function excerptOf(text, maxLength = 110) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).trim() + '…';
}

const CATEGORIES = ['خاطرات و روزنوشت', 'خلوت روح', 'دیده‌ها و شنیده‌ها'];

function DailyNotes() {
  const [openCommentId, setOpenCommentId] = useState(null);
  const [commentCounts, setCommentCounts] = useState({});
  const [hoveredId, setHoveredId] = useState(null);

  const allNotes = getContent('notes');

  // برای هر دسته، جدیدترین یادداشتِ همون دسته را انتخاب می‌کنیم
  const notes = CATEGORIES
    .map((catKey) => {
      const match = allNotes.find((n) => n.category === catKey);
      return match ? { ...match, categoryKey: catKey } : null;
    })
    .filter(Boolean);

  useEffect(() => {
    if (!COMMENTS_ENABLED) return;

    let isCancelled = false;

    async function loadCounts() {
      const { data, error } = await supabase
        .from('comments')
        .select('content_id')
        .eq('content_type', 'note');

      if (isCancelled || error || !data) return;

      const counts = {};
      data.forEach((row) => {
        counts[row.content_id] = (counts[row.content_id] || 0) + 1;
      });
      setCommentCounts(counts);
    }

    loadCounts();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className={styles.dailyNotesColumn}>

      <div className={styles.headerWrapper}>
        <h3 className={styles.columnTitle}>یادداشت‌ها و خاطرات</h3>
        <span className={styles.columnSubtitle}>روایت‌ها و تأملات</span>
      </div>

      <div className={styles.notesList}>
        {notes.length === 0 && (
          <p className={styles.columnSubtitle}>
            هنوز یادداشتی با دسته‌بندی ثبت نشده. از پنل مدیریت، دسته‌ی هر یادداشت را مشخص کنید.
          </p>
        )}

        {notes.map((note) => {
          const count = commentCounts[String(note.id)] || 0;
          const noteLink = `/note/${note.id}`;

          return (
            <article
              key={note.id}
              className={styles.cardItem}
              onMouseEnter={() => setHoveredId(note.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                transition: 'box-shadow 220ms ease, transform 220ms ease, background-color 220ms ease',
                boxShadow: hoveredId === note.id
                  ? '0 20px 30px -14px rgba(59, 42, 30, 0.35), inset 0 -20px 24px -18px rgba(59, 42, 30, 0.30)'
                  : undefined,
                backgroundColor: hoveredId === note.id ? '#f3e4d3' : undefined,
                transform: hoveredId === note.id ? 'translateY(-3px)' : undefined,
              }}
            >
              <span className={styles.tag}>#{note.categoryKey}</span>

              <Link to={noteLink} className={styles.cardMainLink}>
                <h4 className={styles.cardTitle}>{note.title}</h4>
                <p className={styles.cardExcerpt}>{excerptOf(note.content, 90)}</p>
              </Link>

              <div className={styles.cardFooter}>
                <span className={styles.noteDate}>{formatDate(note.date)}</span>

                <div className={styles.cardActions}>
                  {COMMENTS_ENABLED ? (
                    <button
                      type="button"
                      className={styles.commentBtn}
                      onClick={() => setOpenCommentId(openCommentId === note.id ? null : note.id)}
                    >
                      💬 {count > 0 ? `${count} نظر · ارسال نظر` : 'ارسال نظر'}
                    </button>
                  ) : null}

                  <Link to={noteLink} className={styles.readMoreBtn}>
                    خواندن
                    <span className={styles.arrowIcon}>←</span>
                  </Link>
                </div>
              </div>

              {/* نظردهی واقعی — همون کامپوننت متصل به Supabase */}
              {COMMENTS_ENABLED && openCommentId === note.id && (
                <div
                  className={styles.commentBoxArea}
                  style={{ maxHeight: '340px', overflowY: 'auto', position: 'relative' }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenCommentId(null)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      zIndex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'rgba(0,0,0,0.06)',
                      border: 'none',
                      borderRadius: '999px',
                      padding: '4px 10px',
                      fontFamily: 'inherit',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      lineHeight: 1,
                      cursor: 'pointer',
                      color: '#555',
                    }}
                  >
                    بستن نظرات ✕
                  </button>

                  <Comments
                    contentType="note"
                    contentId={note.id}
                    onSubmitSuccess={() => setOpenCommentId(null)}
                  />

                  {/* دکمه‌ی بستن در انتهای لیست — برای وقتی کاربر تا آخر نظرات اسکرول کرده */}
                  <button
                    type="button"
                    onClick={() => setOpenCommentId(null)}
                    style={{
                      display: 'block',
                      width: '100%',
                      marginTop: '12px',
                      padding: '8px',
                      background: 'rgba(0,0,0,0.06)',
                      border: 'none',
                      borderRadius: '10px',
                      fontFamily: 'inherit',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#555',
                      cursor: 'pointer',
                    }}
                  >
                    بستن نظرات ✕
                  </button>
                </div>
              )}

            </article>
          );
        })}
      </div>

      <div className={styles.bottomCtaWrapper}>
        <Link to="/notes" className={styles.viewAllBtn}>
          مشاهده آرشیو کامل یادداشت‌ها
        </Link>
      </div>

    </div>
  );
}

export default DailyNotes;
