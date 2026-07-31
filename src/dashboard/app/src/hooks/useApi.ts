import { useState, useEffect } from 'react';

export function useApi<T>(url: string, interval?: number): { data: T | null; loading: boolean; error: string | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetch_ = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status}`);
        const json = await res.json();
        if (active) { setData(json); setError(null); }
      } catch (e: any) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetch_();
    if (interval) {
      const id = setInterval(fetch_, interval);
      return () => { active = false; clearInterval(id); };
    }
    return () => { active = false; };
  }, [url, interval]);

  return { data, loading, error };
}
