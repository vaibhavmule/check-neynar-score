import { useCallback, useState } from "react";

export interface NeynarUser {
  fid: number;
  score: number | null;
}

export function useNeynarUser(context?: { user?: { fid?: number } }) {
  const [user, setUser] = useState<NeynarUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [isCheckingFollow, setIsCheckingFollow] = useState<boolean>(false);

  const checkFollowStatus = useCallback(async () => {
    const viewerFid = context?.user?.fid;
    if (!viewerFid) {
      setIsFollowing(null);
      return false;
    }
    try {
      setIsCheckingFollow(true);
      const res = await fetch(`/api/follow/check?viewerFid=${viewerFid}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      const following = Boolean(data?.isFollowing);
      setIsFollowing(following);
      return following;
    } catch (e) {
      console.error('Failed to check follow status', e);
      setIsFollowing(false);
      return false;
    } finally {
      setIsCheckingFollow(false);
    }
  }, [context?.user?.fid]);

  const fetchScore = useCallback(async () => {
    if (!context?.user?.fid) {
      setUser(null);
      setError(null);
      return;
    }
    // Ensure we have follow status first, only once per session
    if (isFollowing === null) {
      const followed = await checkFollowStatus();
      if (!followed) {
        return;
      }
    } else if (isFollowing === false) {
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
  }, [context?.user?.fid, isFollowing, checkFollowStatus]);

  return { user, loading, error, fetchScore, isFollowing, isCheckingFollow, checkFollowStatus };
} 