import { useParams, Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';
import { getContent } from '../utils/content';
import CopyDownload from '../components/CopyDownload.jsx';
import ReactMarkdown from 'react-markdown';
import Comments from '../components/Comments.jsx';
import { COMMENTS_ENABLED } from '../utils/featureFlags';

function StoryPage() {
  const { id } = useParams();
  const story = getContent('stories').find((s) => String(s.id) === String(id));

  return (
    <div className="page">
      <Link to="/stories" className="back-link">← بازگشت به فهرست داستان‌ها</Link>

      {!story ? (
        <div className="story-container">
          <div className="detail-body">
            <h1 className="page-title">داستان یافت نشد</h1>
            <p className="detail-text">داستانی با این شناسه وجود ندارد.</p>
          </div>
        </div>
      ) : (
        <article className="story-container">
          
          {story.img && (
            <div className="story-cover-wrapper">
              <img src={story.img} alt={story.title} className="story-cover-image" />
            </div>
          )}

          <div className="detail-body">
            <h1 className="page-title">{story.title}</h1>
            <span className="media-meta">{formatDate(story.date)}</span>
            <p className="media-desc" style={{ marginTop: '12px', color: '#666', fontStyle: 'italic' }}>
              {story.desc}
            </p>

            {/* پخش‌کننده فایل صوتی */}
            {story.audio && (
              <div className="story-audio-wrapper">
                <audio key={story.audio} controls src={story.audio} className="story-audio-player">
                  مرورگر شما از پخش فایل‌های صوتی پشتیبانی نمی‌کند.
                </audio>
              </div>
            )}

            {/* پخش‌کننده ویدیو (آپارات / یوتیوب) */}
            {story.videoUrl && (
              <div className="story-video-wrapper">
                <iframe
                  src={story.videoUrl}
                  title={`ویدیوی ${story.title}`}
                  allowFullScreen
                  className="story-video-player"
                ></iframe>
              </div>
            )}
            
            <div className="story-content-text">
              {(story.body || story.content) ? (
                <ReactMarkdown>
                  {String(story.body || story.content)}
                </ReactMarkdown>
              ) : (
                <p>متنی برای این داستان ثبت نشده است.</p>
              )}
            </div>

            <CopyDownload
              title={story.title}
              text={`${story.title}\n\n${story.desc || ''}\n\n${story.body || story.content}`}
            />
            {COMMENTS_ENABLED ? <Comments contentType="story" contentId={story.id} /> : null}
          </div>
        </article>
      )}
    </div>
  );
}

export default StoryPage;
