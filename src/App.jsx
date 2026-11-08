// مسیر فایل: src/App.jsx
import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import './App.css';
import './styles/fonts.css';

const Home = lazy(() => import('./pages/Home.jsx'));
const StoryPage = lazy(() => import('./pages/StoryPage.jsx'));
const NotesPage = lazy(() => import('./pages/NotesPage.jsx'));
const NotePage = lazy(() => import('./pages/NotePage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));
const PoemPage = lazy(() => import('./pages/PoemPage.jsx'));
const PoemsPage = lazy(() => import('./pages/PoemsPage.jsx'));
const SubmitWork = lazy(() => import('./pages/SubmitWork.jsx'));
const ReadingsPage = lazy(() => import('./pages/ReadingsPage.jsx'));
const ReadingPage = lazy(() => import('./pages/ReadingPage.jsx'));
const AllStories = lazy(() => import('./pages/AllStories.jsx'));
const ModeratePage = lazy(() => import('./pages/ModeratePage.jsx'));
function App() {
  const location = useLocation();

  useEffect(() => {
    const targetId = location.hash ? location.hash.replace('#', '') : '';

    if (!targetId) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      return;
    }

    requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const path = location.pathname;
    const titles = {
      '/': 'محمد قنبری - سایت شخصی',
      '/poems': 'شعرها - محمد قنبری',
      '/stories': 'داستان‌ها - محمد قنبری',
      '/notes': 'یادداشت‌ها - محمد قنبری',
      '/readings': 'آرشیو خوانندگان - محمد قنبری',
      '/submit': 'ارسال اثر - محمد قنبری',
      '/contact': 'گفتگو - محمد قنبری',
      '/moderate': 'تأیید نظرها - محمد قنبری',
    };
    let title = titles[path];
    if (!title) {
      if (path.startsWith('/poem/')) title = 'شعر - محمد قنبری';
      else if (path.startsWith('/story/')) title = 'داستان - محمد قنبری';
      else if (path.startsWith('/note/')) title = 'یادداشت - محمد قنبری';
      else if (path.startsWith('/reading/')) title = 'خوانش - محمد قنبری';
      else title = 'صفحه یافت نشد - محمد قنبری';
    }
    document.title = title;
  }, [location.pathname]);

  return (
    <div className="app-container">
      <Header />

      <Suspense fallback={null}>
      <Routes>
        <Route path="/stories" element={<AllStories />} />
        <Route path="/" element={<Home />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/story/:id" element={<StoryPage />} />
        <Route path="/note/:id" element={<NotePage />} />
        <Route path="/poems" element={<PoemsPage />} />
        <Route path="/poem/:id" element={<PoemPage />} />
        <Route path="/readings" element={<ReadingsPage />} />
        <Route path="/reading/:id" element={<ReadingPage />} />
        <Route path="/submit" element={<SubmitWork />} />
        <Route path="/moderate" element={<ModeratePage />} />
        <Route
          path="*"
          element={
            <div className="page">
              <Link to="/" className="back-link">← بازگشت به صفحه اصلی</Link>
              <h1 className="page-title">صفحه یافت نشد</h1>
              <p className="detail-text">این نشانی در سایت وجود ندارد.</p>
            </div>
          }
        />
      </Routes>
      </Suspense>

      <footer id="contact" className="site-footer">
        <div className="footer-copyright">© ۲۰۲۶ محمد قنبری. تمام حقوق محفوظ است.</div>
        <div className="footer-socials">
          {/* TODO: replace href="#" with real profile URLs when available */}
          <a href="#" title="به‌زودی" aria-label="اینستاگرام — به‌زودی" onClick={(e) => e.preventDefault()}>Instagram</a>
          <a href="#" title="به‌زودی" aria-label="تلگرام — به‌زودی" onClick={(e) => e.preventDefault()}>Telegram</a>
          <a href="#" title="به‌زودی" aria-label="یوتیوب — به‌زودی" onClick={(e) => e.preventDefault()}>YouTube</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
