import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured) {
  console.error(
    '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill values.'
  );
}

function unavailableResult() {
  return {
    data: null,
    error: new Error('Supabase is not configured'),
    count: null,
  };
}

// هر متد بدون شبکه به همان خطای پیکربندی resolve می‌شود.
function createUnavailableClient() {
  const chain = new Proxy(function unavailableCall() {}, {
    get(_target, prop) {
      if (prop === 'then') {
        return (onFulfilled, onRejected) =>
          Promise.resolve(unavailableResult()).then(onFulfilled, onRejected);
      }
      if (prop === 'catch') {
        return (onRejected) => Promise.resolve(unavailableResult()).catch(onRejected);
      }
      if (prop === 'finally') {
        return (onFinally) => Promise.resolve(unavailableResult()).finally(onFinally);
      }
      return chain;
    },
    apply() {
      return chain;
    },
  });
  return chain;
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : createUnavailableClient();
