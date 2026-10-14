// مسیر فایل: src/App.jsx
import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import StoryPage from './pages/StoryPage.jsx';
import NotesPage from './pages/NotesPage.jsx';
import NotePage from './pages/NotePage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import PoemPage from './pages/PoemPage.jsx';
import PoemsPage from './pages/PoemsPage.jsx';
import SubmitWork from './pages/SubmitWork.jsx';
import './App.css';
import './styles/fonts.css';
import AllStories from './pages/AllStories';
function App() {
  const location = useLocation();

  useEffect(() => {
    const targetId =
      location.hash ? location.hash.replace('#', '') : location.pathname === '/contact' ? 'contact' : '';

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

  return (
    <div className="app-container">
      <Header />

      <Routes>
        <Route path="/stories" element={<AllStories />} />
        <Route path="/" element={<Home />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/story/:id" element={<StoryPage />} />
        <Route path="/note/:id" element={<NotePage />} />
        <Route path="/poems" element={<PoemsPage />} />
        <Route path="/poem/:id" element={<PoemPage />} />
        <Route path="/submit" element={<SubmitWork />} />
      </Routes>

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
