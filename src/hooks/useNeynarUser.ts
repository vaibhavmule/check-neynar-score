import { useCallback, useEffect, useRef, useState } from "react";
import { DEVELOPER_FID } from "~/lib/constants";
import { getItem, setItem } from "~/lib/localStorage";

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
  const followCheckInFlight = useRef(false);

  const FOLLOW_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  function getFollowCacheKey(fid: number) {
    return `follow_status_${fid}`;
  }

  const checkFollowStatus = useCallback(async () => {
    const viewerFid = context?.user?.fid;
    if (!viewerFid) {
      setIsFollowing(null);
      return false;
    }
    
    // Skip follow check if viewer is the developer
    if (viewerFid === DEVELOPER_FID) {
      setIsFollowing(true);
      return true;
    }
    try {
      // Serve from cache immediately if fresh, then refresh in background
      const cacheKey = getFollowCacheKey(viewerFid);
      const cached = getItem<{ value: boolean; ts: number }>(cacheKey);
      if (cached && Date.now() - cached.ts < FOLLOW_CACHE_TTL_MS) {
        setIsFollowing(cached.value);
      }

      // Prevent overlapping requests
      if (followCheckInFlight.current) {
        return isFollowing ?? cached?.value ?? false;
      }
      followCheckInFlight.current = true;
      setIsCheckingFollow(true);

      const doRequest = async () => {
        const res = await fetch(`/api/follow/check?viewerFid=${viewerFid}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        return Boolean(data?.isFollowing);
      };

      // First attempt
      let following = await doRequest();
      // Retry once after short delay if not following (handles propagation lag)
      if (!following) {
        await new Promise((r) => setTimeout(r, 800));
        following = await doRequest();
      }

      setIsFollowing(following);
      setItem(cacheKey, { value: following, ts: Date.now() });
      return following;
    } catch (e) {
      console.error('Failed to check follow status', e);
      // Don't overwrite a truthy cached value on error
      if (isFollowing === null) {
        setIsFollowing(false);
      }
      return false;
    } finally {
      setIsCheckingFollow(false);
      followCheckInFlight.current = false;
    }
  }, [context?.user?.fid]);

  const fetchScore = useCallback(async () => {
    if (!context?.user?.fid) {
      setUser(null);
      setError(null);
      return;
    }
    
    // Skip follow check entirely if viewer is the developer
    const viewerFid = context.user.fid;
    if (viewerFid !== DEVELOPER_FID) {
      // Ensure we have follow status first, only once per session (for non-developers)
      if (isFollowing === null) {
        const followed = await checkFollowStatus();
        if (!followed) {
          return;
        }
      } else if (isFollowing === false) {
        return;
      }
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

  // Auto re-check when window/tab gains focus (helps resolve stale states)
  useEffect(() => {
    function onVisibilityOrFocus() {
      if (document.visibilityState === 'visible') {
        void checkFollowStatus();
      }
    }
    window.addEventListener('focus', onVisibilityOrFocus);
    document.addEventListener('visibilitychange', onVisibilityOrFocus);
    return () => {
      window.removeEventListener('focus', onVisibilityOrFocus);
      document.removeEventListener('visibilitychange', onVisibilityOrFocus);
    };
  }, [checkFollowStatus]);

  return { user, loading, error, fetchScore, isFollowing, isCheckingFollow, checkFollowStatus };
} 