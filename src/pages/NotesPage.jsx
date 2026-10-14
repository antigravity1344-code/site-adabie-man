import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';
import { getContent } from '../utils/content';

function excerptOf(text, maxLength = 90) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).trim() + '…';
}

function NotesPage() {
  const notesData = getContent('notes');

  return (
    <div className="page">
      <Link to="/" className="back-link">← بازگشت به صفحه اصلی</Link>

      <h1 className="page-title">همه یادداشت‌ها</h1>
      <p className="page-lead">تصویر و متن هر یادداشت کنار هم نمایش داده می‌شود.</p>

      <div className="card-stack">
        {notesData.map((note) => (
          <Link key={note.id} to={`/note/${note.id}`} className="media-card">
            <img src={note.img} alt={note.title} className="media-thumb" />
            <div className="media-body">
              <h3 className="media-title">{note.title}</h3>
              <p className="media-desc">{excerptOf(note.content)}</p>
              <span className="media-meta">
                {formatDate(note.date)}
                {' · '}
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#8a6d3b' }}>
                  ادامه مطلب و ارسال نظر ←
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default NotesPage;
