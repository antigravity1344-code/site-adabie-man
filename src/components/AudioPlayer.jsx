import { useRef, useState } from 'react';
import styles from './AudioPlayer.module.css';

/**
 * دکمه‌ی پخش/توقف صوتی که روی تصویر شعر نمایش داده می‌شود.
 * @param {{ src: string }} props
 */
function AudioPlayer({ src }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!src) return null;

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  }

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio) return;
    setProgress((audio.currentTime / audio.duration) * 100 || 0);
  }

  function handleEnded() {
    setPlaying(false);
    setProgress(0);
  }

  return (
    <div className={styles.wrapper}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      <button
        type="button"
        className={styles.playButton}
        onClick={togglePlay}
        aria-label={playing ? 'توقف' : 'پخش صوت'}
      >
        {playing ? (
          // آیکون توقف
          <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          // آیکون پخش
          <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* نوار پیشرفت */}
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default AudioPlayer;
