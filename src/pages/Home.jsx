import Hero from '../components/Hero.jsx';
import DailyNotes from '../components/DailyNotes.jsx';
import FeaturedPoem from '../components/FeaturedPoem.jsx';
import Stories from '../components/Stories.jsx';

function Home() {
  return (
    <>
      <Hero />
      <main className="main-content-grid">
        <section id="notes">
          <DailyNotes />
        </section>
        <section id="poetry">
          <FeaturedPoem />
        </section>
        <section id="stories">
          <Stories />
        </section>
      </main>
    </>
  );
}

export default Home;
