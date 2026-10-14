import styles from './FontTest.module.css';

function FontTest() {
  const samples = [
    ['نستعلیق', 'font-nastaliq'],
    ['وزیرمتن', 'font-vazirmatn'],
    ['شبنم', 'font-shabnam'],
    ['شکسته (آماده برای فایل آینده)', 'font-shekasteh'],
    ['دستخط (آماده برای فایل آینده)', 'font-dastkhat'],
  ];

  const text = 'به یاد تو هر نفس، شعری تازه در دل من جاری است';

  return (
    <div className={styles.container}>
      <h1>آزمایش فونت‌های فارسی</h1>
      {samples.map(([title, className]) => (
        <section className={styles.card} key={title}>
          <h2>{title}</h2>
          <p className={className}>{text}</p>
        </section>
      ))}
    </div>
  );
}

export default FontTest;
