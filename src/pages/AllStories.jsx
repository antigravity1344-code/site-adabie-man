import { Link } from 'react-router-dom';
// دقت کنید که آدرس فایل CSS ممکن است بسته به پوشه‌بندی شما نیاز به تنظیم داشته باشد
// اگر این فایل در پوشه pages است، باید یک مرحله به عقب برگردید: '../components/Stories.module.css'
import styles from '../components/Stories.module.css'; 
import { getContent } from '../utils/content';

function excerptOf(text, maxLength = 90) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).trim() + '…';
}

function AllStories() {
  // کل داستان‌ها بدون بُرش (slice) فراخوانی می‌شوند
  const allStoriesData = getContent('stories');

  return (
    <div className={styles.storiesColumn} style={{ marginTop: '40px' }}>
      <h2 className={styles.columnTitle}>آرشیو تمام داستان‌ها</h2>

      <div className={styles.storiesList}>
        {allStoriesData.map((story) => (
          <div className={`${styles.storyCard} archive-story-row`} key={story.id}>
            
            {story.img && (
              <div className={styles.imageWrapper}>
                <img src={story.img} alt={story.title} className={styles.storyImage} />
              </div>
            )}

            <div className={styles.storyDetails}>
              <Link to={`/story/${story.id}`} className={styles.storyTitle}>
                {story.title}
              </Link>
              <p className={styles.storyDesc}>{excerptOf(story.desc)}</p>
              <Link
                to={`/story/${story.id}`}
                style={{
                  display: 'inline-block',
                  marginTop: '4px',
                  fontWeight: 600,
                  color: '#a8623a',
                  textDecoration: 'none',
                }}
              >
                ادامه مطلب و ارسال نظر ←
              </Link>
            </div>
            
          </div>
        ))}
      </div>
      
      {/* دکمه بازگشت به صفحه اصلی */}
      <Link to="/" className={styles.viewAllButton}>
        بازگشت به صفحه اصلی
      </Link>
      
    </div>
  );
}

export default AllStories;
