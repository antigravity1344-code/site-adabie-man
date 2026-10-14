import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';
import { getContent } from '../utils/content';
import { supabase } from '../utils/supabaseClient';
import { COMMENTS_ENABLED } from '../utils/featureFlags';

function PoemCard({ poem, commentCount }) {
  const [playing, setPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const audioRef = useRef(null);

  const hasAudio = !!(poem.audio && poem.audio.trim());
  const hasVideo = !!(poem.video && poem.video.trim());

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (hasVideo) {
      // اگه ویدیو داشت، مودال باز می‌شه
      setShowVideo(true);
      return;
    }

    if (hasAudio) {
      // اگه فقط صدا داشت، همون رفتار قبلی
      const audio = audioRef.current;
      if (!audio) return;
      if (playing) {
        audio.pause();
        setPlaying(false);
      } else {
        audio.play();
        setPlaying(true);
      }
    }
  }

  function closeVideo() {
    setShowVideo(false);
  }

  return (
    <div className="media-card">
      {/* تصویر با دکمه‌ی پخش روش */}
      <div
        style={{ position: 'relative', flexShrink: 0, cursor: (hasAudio || hasVideo) ? 'pointer' : 'default' }}
        onClick={handleClick}
      >
        <img
          src={poem.image || 'https://picsum.photos/300/200'}
          alt={poem.title}
          className="media-thumb"
        />

        {(hasAudio || hasVideo) ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              background: playing && hasAudio && !hasVideo ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'background 180ms ease',
            }}
          >
            {playing && hasAudio && !hasVideo ? (
              <svg viewBox="0 0 24 24" fill="white" width="32" height="32">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="white" width="32" height="32">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            {hasVideo && (
              <span style={{
                color: '#fff',
                fontSize: '0.7rem',
                marginTop: '4px',
                background: 'rgba(0,0,0,0.5)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}>ویدیو</span>
            )}
          </div>
        ) : null}

        {hasAudio && !hasVideo ? (
          <audio
            ref={audioRef}
            src={poem.audio}
            onEnded={() => setPlaying(false)}
          />
        ) : null}
      </div>

      {/* متن کارت — کلیک روش میره به صفحه‌ی شعر */}
      <Link
        to={`/poem/${poem.id}`}
        className="media-body"
        style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '4px' }}
      >
        <h3 className="media-title">{poem.title}</h3>
        <p className="media-desc" style={{ whiteSpace: 'pre-line' }}>{poem.body}</p>
        <span className="media-meta">
          {poem.author || 'محمد قنبری'} · {formatDate(poem.date)}
          {COMMENTS_ENABLED ? (
            <>
              {' · '}
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#8a6d3b' }}>
                💬 {commentCount > 0 ? `${commentCount} نظر` : 'ارسال نظر'}
              </span>
            </>
          ) : null}
        </span>
      </Link>

      {/* مودال ویدیو — روی body رندر می‌شه */}
      {showVideo && hasVideo && createPortal(
        <div
          onClick={closeVideo}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.82)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '760px',
              background: '#000',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={closeVideo}
              aria-label="بستن"
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 10,
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >✕</button>
            <video
              src={poem.video}
              controls
              autoPlay
              style={{ width: '100%', display: 'block', maxHeight: '80vh', background: '#000' }}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function PoemsPage() {
  const poems = getContent('poems');
  const [commentCounts, setCommentCounts] = useState({});

  useEffect(() => {
    if (!COMMENTS_ENABLED) return;

    let isCancelled = false;

    async function loadCounts() {
      const { data, error } = await supabase
        .from('comments')
        .select('content_id')
        .eq('content_type', 'poem');

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
    <div className="page">
      <Link to="/" className="back-link">← بازگشت به صفحه اصلی</Link>

      <h1 className="page-title">همه شعرها</h1>
      <p className="page-lead">مجموعه‌ی کامل شعرهای محمد قنبری.</p>

      <div className="card-stack">
        {poems.length === 0 && <p className="page-lead">هنوز شعری ثبت نشده است.</p>}
        {poems.map((poem) => (
          <PoemCard
            key={poem.id}
            poem={poem}
            commentCount={commentCounts[String(poem.id)] || 0}
          />
        ))}
      </div>
    </div>
  );
}

export default PoemsPage;
