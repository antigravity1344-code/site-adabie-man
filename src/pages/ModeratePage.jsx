import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { formatDate } from '../utils/formatDate';

function ModeratePage() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showApproved, setShowApproved] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    const previous = meta.getAttribute('content');
    meta.setAttribute('content', 'noindex');
    return () => {
      if (created) meta.remove();
      else if (previous == null) meta.removeAttribute('content');
      else meta.setAttribute('content', previous);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) setSession(data?.session ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => {
      alive = false;
      data?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setIsAdmin(false);
      setRows([]);
      return;
    }
    let alive = true;
    async function load() {
      setError('');
      const { data: adminRows, error: adminError } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', session.user.id);
      if (!alive) return;
      if (adminError || !adminRows?.length) {
        setIsAdmin(false);
        setRows([]);
        setError('این حساب اجازهٔ تأیید نظر ندارد.');
        return;
      }
      setIsAdmin(true);
      const { data: comments, error: listError } = await supabase
        .from('comments')
        .select('id, content_type, content_id, author_name, body, created_at, approved')
        .eq('approved', showApproved)
        .order('created_at', { ascending: false });
      if (!alive) return;
      if (listError) {
        setError('خواندن نظرها انجام نشد.');
        return;
      }
      setRows(comments || []);
    }
    load();
    return () => {
      alive = false;
    };
  }, [session, showApproved]);

  async function handleLogin(event) {
    event.preventDefault();
    setError('');
    const { error: signError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signError) setError('ورود انجام نشد. ایمیل یا رمز را چک کنید.');
  }

  async function approve(id) {
    setBusyId(id);
    setError('');
    const { error: updateError } = await supabase
      .from('comments')
      .update({ approved: true })
      .eq('id', id);
    setBusyId(null);
    if (updateError) {
      setError('تأیید انجام نشد.');
      return;
    }
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  async function remove(id) {
    setBusyId(id);
    setError('');
    const { error: deleteError } = await supabase.from('comments').delete().eq('id', id);
    setBusyId(null);
    if (deleteError) {
      setError('حذف انجام نشد.');
      return;
    }
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  return (
    <div className="page">
      <Link to="/" className="back-link">← بازگشت به صفحه اصلی</Link>
      <h1 className="page-title">تأیید نظرها</h1>
      <p className="page-lead">فقط برای مدیر سایت. این صفحه در منوی عمومی نیست.</p>

      {!session ? (
        <form className="submit-form" onSubmit={handleLogin}>
          <div className="submit-field">
            <label className="submit-label" htmlFor="moderate-email">ایمیل</label>
            <input
              id="moderate-email"
              className="submit-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="submit-field">
            <label className="submit-label" htmlFor="moderate-password">رمز</label>
            <input
              id="moderate-password"
              className="submit-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error ? <p className="submit-error">{error}</p> : null}
          <button type="submit" className="submit-button">ورود</button>
        </form>
      ) : (
        <>
          <p className="detail-text">{session.user.email}</p>
          <button
            type="button"
            className="submit-button"
            onClick={() => supabase.auth.signOut()}
          >
            خروج
          </button>
          {isAdmin ? (
            <button
              type="button"
              className="submit-button"
              onClick={() => setShowApproved((value) => !value)}
              style={{ marginRight: '8px' }}
            >
              {showApproved ? 'فقط در انتظار تأیید' : 'نمایش تأییدشده‌ها'}
            </button>
          ) : null}
          {error ? <p className="submit-error">{error}</p> : null}
          {isAdmin ? (
            <div className="card-stack" style={{ marginTop: '20px' }}>
              {rows.length === 0 ? <p className="page-lead">نظری در این فهرست نیست.</p> : null}
              {rows.map((row) => (
                <article key={row.id} className="media-card">
                  <div className="media-body">
                    <h2 className="media-title">{row.author_name}</h2>
                    <p className="media-meta">
                      {row.content_type} · {row.content_id} · {formatDate(row.created_at)}
                    </p>
                    <p className="media-desc" style={{ whiteSpace: 'pre-line' }}>{row.body}</p>
                    <button
                      type="button"
                      className="submit-button"
                      disabled={busyId === row.id || row.approved}
                      onClick={() => approve(row.id)}
                    >
                      تأیید
                    </button>
                    <button
                      type="button"
                      className="submit-button"
                      disabled={busyId === row.id}
                      onClick={() => remove(row.id)}
                      style={{ marginRight: '8px' }}
                    >
                      حذف
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export default ModeratePage;
