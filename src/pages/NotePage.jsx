import { useParams, Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';
import { getContent } from '../utils/content';
import CopyDownload from '../components/CopyDownload.jsx';
import Comments from '../components/Comments.jsx';
import { COMMENTS_ENABLED } from '../utils/featureFlags';

// اگر متن یادداشت از این طول بیشتر باشد، روی عکس زشت می‌شود
// و به‌جای آن از چیدمان «عکس بالا + متن پایین» استفاده می‌کنیم
const QUOTE_STYLE_MAX_LENGTH = 420;

function NotePage() {
  const { id } = useParams();
  const note = getContent('notes').find((n) => String(n.id) === String(id));

  if (!note) {
    return (
      <div className="page">
        <Link to="/notes" className="back-link">← بازگشت به فهرست یادداشت‌ها</Link>
        <div className="detail-grid">
          <div className="detail-body">
            <h1 className="page-title">یادداشت یافت نشد</h1>
            <p className="detail-text">یادداشتی با این شناسه وجود ندارد.</p>
          </div>
        </div>
      </div>
    );
  }

  const contentLength = String(note.content || '').length;
  const useQuoteStyle = Boolean(note.img) && contentLength <= QUOTE_STYLE_MAX_LENGTH;

  return (
    <div className="page">
      <Link to="/notes" className="back-link">← بازگشت به فهرست یادداشت‌ها</Link>

      {useQuoteStyle ? (
        // ===== حالت «نقل‌قول تصویری»: متن روی عکس، برای یادداشت‌های کوتاه =====
        <article>
          <div
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '360px',
              borderRadius: '18px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'flex-end',
            }}
          >
            <img
              src={note.img}
              alt={note.title}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.60) 55%, rgba(0,0,0,0.88) 100%)',
              }}
            />
            <div
              style={{
                position: 'relative',
                padding: '32px 28px 28px',
                width: '100%',
                textAlign: 'right',
                color: '#ffffff',
              }}
            >
              <h1
                style={{
                  margin: '0 0 12px',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                {note.title}
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: '1.55rem',
                  lineHeight: 2,
                  color: '#ffffff',
                  whiteSpace: 'pre-line',
                  textAlign: 'justify',
                  textAlignLast: 'right',
                }}
              >
                {note.content}
              </p>
              <span
                style={{
                  display: 'inline-block',
                  marginTop: '16px',
                  fontSize: '0.85rem',
                  color: '#ffffff',
                  opacity: 0.85,
                }}
              >
                {formatDate(note.date)}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '40px' }}>
            <CopyDownload title={note.title} text={`${note.title}\n\n${note.content}`} />
            {COMMENTS_ENABLED ? <Comments contentType="note" contentId={note.id} /> : null}
          </div>
        </article>
      ) : (
        // ===== حالت معمولی: عکس بالا (ارتفاع ثابت) + متن پایین، برای یادداشت‌های بلند =====
        <article>
          {note.img ? (
            <div className="story-cover-wrapper">
              <img src={note.img} alt={note.title} className="story-cover-image" />
            </div>
          ) : null}

          <div className="detail-body">
            <h1 className="page-title">{note.title}</h1>
            <span className="media-meta">{formatDate(note.date)}</span>
            <p className="detail-text">{note.content}</p>
            <CopyDownload title={note.title} text={`${note.title}\n\n${note.content}`} />
            {COMMENTS_ENABLED ? <Comments contentType="note" contentId={note.id} /> : null}
          </div>
        </article>
      )}
    </div>
  );
}

export default NotePage;
