import { useCallback, useState } from "react";

export interface NeynarUser {
  fid: number;
  score: number | null;
  username?: string;
  pfpUrl?: string;
}

export function useNeynarUser(context?: { user?: { fid?: number } }) {
  const [user, setUser] = useState<NeynarUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(async (fid?: number) => {
    if (loading) return; // prevent concurrent fetches
    
    // Use provided FID or fall back to context FID
    const targetFid = fid ?? context?.user?.fid;
    
    if (!targetFid) {
      setUser(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/users?fids=${targetFid}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.users?.[0]) {
        setUser({
          fid: data.users[0].fid,
          score: data.users[0].score,
          username: data.users[0].username,
          pfpUrl: data.users[0].pfp_url,
        });
      } else {
        setUser(null);
        setError('User not found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch score';
      setError(errorMessage);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [context?.user?.fid, loading]);

  return { user, loading, error, fetchScore };
} 