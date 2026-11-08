import { useState, useMemo, useEffect } from 'react';
import styles from './Hero.module.css';
import { getContent } from '../utils/content';

// تصاویر استاتیک قدیمی
import hero1 from '../assets/hero-1.jpg';
import hero2 from '../assets/hero-2.jpg';
import hero3 from '../assets/hero-3.jpg';
import hero4 from '../assets/hero-4.jpg';
import hero5 from '../assets/hero-5.jpg';
import hero6 from '../assets/hero-6.jpg';
import hero7 from '../assets/hero-7.jpg';
import hero8 from '../assets/hero-8.jpg';

const fallbackData = [
  { image: hero1, quote: "در این سکوت، کلماتم جوانه می‌زنند،\nهمچون گل‌های یخ در زمستان." },
  { image: hero2, quote: "خیال تو، رهگذر همیشگی\nکوچه‌های ذهن من است." },
  { image: hero3, quote: "آسمان ابری‌ست،\nاما امید در دل می‌تپد." },
  { image: hero4, quote: "هر برگ پاییزی،\nقصه‌ای از دلتنگی دارد." },
  { image: hero5, quote: "چشم‌انداز فردا،\nدر نگاه امروز تو پیداست." },
  { image: hero6, quote: "آرامش،\nدر لابه‌لای برگ‌های این کتاب نهفته است." },
  { image: hero7, quote: "صدای قدم‌هایت،\nزیباترین موسیقی این خیابان است." },
  { image: hero8, quote: "و عشق،\nتنها بهانه‌ای برای ادامه دادن است." }
];

function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // استخراج و ترکیب اطلاعات از CMS و پوشه Assets
  const heroData = useMemo(() => {
    try {
      const cmsItems = getContent('hero');

      if (!cmsItems || cmsItems.length === 0) {
        return fallbackData;
      }

      const activeItems = cmsItems.filter((item) => {
        if (item.active === undefined || item.active === null) return true;
        if (typeof item.active === 'boolean') return item.active;
        if (typeof item.active === 'string') return item.active.toLowerCase() === 'true';
        return Boolean(item.active);
      });

      activeItems.sort((a, b) => {
        const orderA = Number(a.order) || 0;
        const orderB = Number(b.order) || 0;
        return orderA - orderB;
      });

      const cmsData = activeItems
        .filter((item) => item.image)
        .map((item) => ({
          image: item.image,
          quote: item.quote || "در این سکوت، کلماتم جوانه می‌زنند،\nهمچون گل‌های یخ در زمستان."
        }));

      return [...cmsData, ...fallbackData];
    } catch {
      return fallbackData;
    }
  }, []);

  const changeImage = () => {
    setCurrentIndex((prev) => (prev + 1) % heroData.length);
  };

  // تعویض خودکار هر ۱ دقیقه؛ با توقف یا prefers-reduced-motion خاموش می‌ماند
  useEffect(() => {
    if (paused) return undefined;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroData.length);
    }, 60000);
    return () => clearInterval(timer);
  }, [heroData.length, paused]);

  const currentSlide = heroData[currentIndex];

  return (
    <section className={styles.heroBanner}>
      <div className={styles.heroImageContainer}>
        <button
          type="button"
          className={styles.heroSlideButton}
          onClick={changeImage}
          aria-label="تصویر بعدی"
        >
          <img
            key={`img-${currentIndex}`} /* تریگر کردن انیمیشن CSS با تغییر کلید */
            src={currentSlide.image}
            alt="محمد قنبری"
            className={styles.heroProfileImg}
          />
        </button>
        <button
          type="button"
          className={styles.heroPauseButton}
          aria-pressed={paused}
          aria-label={paused ? 'ادامه نمایش خودکار تصاویر' : 'توقف نمایش خودکار تصاویر'}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? 'ادامه' : 'توقف'}
        </button>
        <span className={styles.imageHint}>
          کلیک کنید؛ تصاویر دیگر را ببینید
        </span>
      </div>

      <div 
        key={`quote-${currentIndex}`} /* تریگر کردن انیمیشن CSS با تغییر کلید */
        className={styles.heroQuote}
      >
        {currentSlide.quote ? (
          String(currentSlide.quote).split('\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))
        ) : (
          <p>متن در حال بارگذاری...</p>
        )}
      </div>
    </section>
  );
}

export default Hero;