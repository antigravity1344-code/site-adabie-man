import { useParams, Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';
import { getContent } from '../utils/content';
import AudioPlayer from '../components/AudioPlayer.jsx';

function ReadingPage() {
  const { id } = useParams();
  const reading = getContent('readings').find((r) => String(r.id) === String(id));

  return (
    <div className="page">
      <Link to="/readings" className="back-link">← بازگشت به آرشیو خوانندگان</Link>

      {!reading ? (
        <>
          <h1 className="page-title">خوانشی یافت نشد</h1>
          <p className="detail-text">خوانشی با این شناسه وجود ندارد.</p>
        </>
      ) : (
        <article className="story-container">
          {reading.image && (
            <div className="story-cover-wrapper">
              <img src={reading.image} alt={reading.title} className="story-cover-image" />
            </div>
          )}

          <div className="detail-body">
            <h1 className="page-title">{reading.title}</h1>
            <span className="media-meta">
              {reading.reader || 'محمد قنبری'} · {formatDate(reading.date)}
            </span>

            {reading.relatedWork ? (
              <p className="media-desc" style={{ marginTop: '10px' }}>
                خوانشی از: {reading.relatedWork}
              </p>
            ) : null}

            {reading.description ? (
              <p className="media-desc" style={{ marginTop: '10px', fontStyle: 'italic' }}>
                {reading.description}
              </p>
            ) : null}

            {reading.audio ? (
              <div className="story-audio-wrapper" style={{ marginTop: '18px' }}>
                <AudioPlayer src={reading.audio} />
              </div>
            ) : null}
          </div>
        </article>
      )}
    </div>
  );
}

export default ReadingPage;
