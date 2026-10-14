import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';
import { getContent } from '../utils/content';

function excerptOf(text, maxLength = 90) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).trim() + '…';
}

function StoriesPage() {
  const storiesData = getContent('stories');

  return (
    <div className="page">
      <Link to="/" className="back-link">← بازگشت به صفحه اصلی</Link>

      <h1 className="page-title">همه داستان‌ها</h1>
      <p className="page-lead">تصویر و متن هر داستان کنار هم نمایش داده می‌شود.</p>

      <div className="card-stack">
        {storiesData.map((story) => (
          <Link key={story.id} to={`/story/${story.id}`} className="media-card">
            <img src={story.img} alt={story.title} className="media-thumb" />
            <div className="media-body">
              <h3 className="media-title">{story.title}</h3>
              <p className="media-desc">{excerptOf(story.desc)}</p>
              <span className="media-meta">
                {formatDate(story.date)}
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

export default StoriesPage;
