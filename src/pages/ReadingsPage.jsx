import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';
import { getContent } from '../utils/content';
import { netlifyImage } from '../utils/netlifyImage';

function excerptOf(text, maxLength = 90) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).trim() + '…';
}

function ReadingsPage() {
  const readingsData = getContent('readings');

  return (
    <div className="page">
      <Link to="/" className="back-link">← بازگشت به صفحه اصلی</Link>
      <h1 className="page-title">آرشیو خوانندگان</h1>
      <p className="page-lead">خوانش صوتی شعرها و داستان‌ها، با صدای خودِ نویسنده و دیگر خوانندگان.</p>

      <div className="card-stack">
        {readingsData.length === 0 && <p className="page-lead">هنوز خوانشی ثبت نشده است.</p>}
        {readingsData.map((reading) => (
          <Link key={reading.id} to={`/reading/${reading.id}`} className="media-card reading-media-card">
            {reading.image ? (
              <img
                src={netlifyImage(reading.image, 300)}
                alt={reading.title}
                className="media-thumb"
                width="130"
                height="130"
                loading="lazy"
                decoding="async"
              />
            ) : null}
            <div className="media-body">
              <h3 className="media-title">
                <span className="reading-icon" aria-hidden="true">🎙</span>
                {reading.title}
              </h3>
              {reading.description ? (
                <p className="media-desc">{excerptOf(reading.description)}</p>
              ) : null}
              <span className="media-meta">
                {reading.reader || 'محمد قنبری'}
                {' · '}
                {formatDate(reading.date)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ReadingsPage;
