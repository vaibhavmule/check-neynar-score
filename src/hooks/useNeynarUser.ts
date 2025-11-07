import { useCallback, useState } from "react";

export interface NeynarUser {
  fid: number;
  score: number | null;
}

export function useNeynarUser(context?: { user?: { fid?: number } }) {
  const [user, setUser] = useState<NeynarUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(async () => {
    if (loading) return; // prevent concurrent fetches
    if (!context?.user?.fid) {
      setUser(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/users?fids=${context.user.fid}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.users?.[0]) {
        setUser(data.users[0]);
      } else {
        setUser(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch score';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [context?.user?.fid, loading]);

  return { user, loading, error, fetchScore };
} 