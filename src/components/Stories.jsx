import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Stories.module.css';
import { getContent } from '../utils/content';
import { formatDate } from '../utils/formatDate';

function excerptOf(text, maxLength = 60) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).trim() + '…';
}

const HOVER_SHADOW =
  '0 20px 30px -14px rgba(59, 42, 30, 0.35), inset 0 -20px 24px -18px rgba(59, 42, 30, 0.30)';

function Stories() {
  const [hoveredId, setHoveredId] = useState(null);

  // برش اطلاعات: فقط ۳ داستان اول (جدیدترین‌ها) جدا می‌شوند
  const storiesData = getContent('stories').slice(0, 3);

  return (
    <div className={styles.storiesColumn}>
      <h2 className={styles.columnTitle}>داستان‌ها</h2>

      <div className={styles.storiesList}>
        {storiesData.map((story) => (
          <div
            className={styles.storyCard}
            key={story.id}
            onMouseEnter={() => setHoveredId(story.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              transition: 'box-shadow 220ms ease, transform 220ms ease, background-color 220ms ease',
              boxShadow: hoveredId === story.id ? HOVER_SHADOW : undefined,
              backgroundColor: hoveredId === story.id ? '#f3e4d3' : undefined,
              transform: hoveredId === story.id ? 'translateY(-3px)' : undefined,
            }}
          >
            
            {story.img && (
              <div className={styles.imageWrapper}>
                <img src={story.img} alt={story.title} className={styles.storyImage} />
              </div>
            )}

            <div className={styles.storyDetails}>
              <Link
                to={`/story/${story.id}`}
                className={styles.storyTitle}
              >
                {story.title}
              </Link>

              <p className={styles.storyDesc}>{excerptOf(story.desc)}</p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  marginTop: '4px',
                }}
              >
                <span className={styles.storyDate}>{formatDate(story.date)}</span>

                <Link
                  to={`/story/${story.id}`}
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#a8623a',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  خواندن ←
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* دکمه ارجاع به صفحه آرشیو کل داستان‌ها */}
      <Link to="/stories" className={styles.viewAllButton}>
        مشاهده همه داستان‌ها
      </Link>
      
    </div>
  );
}

export default Stories;
