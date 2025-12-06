"use client";

import { useEffect, useState, useCallback } from "react";
import { useMiniApp } from "@neynar/react";
import { APP_URL } from "~/lib/constants";
import { Button } from "./Button";

type ScoreCardProps = {
  fid?: number;
  score?: number;
  username?: string;
  pfpUrl?: string;
  loading?: boolean;
  timeAgo?: string;
  error?: string | null;
};

export function ScoreCard({ fid, score, username, pfpUrl, loading, timeAgo: _timeAgo, error }: ScoreCardProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { context, actions } = useMiniApp();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleShare = useCallback(async () => {
    if (!context?.user?.fid) {
      console.warn("User FID not available");
      alert("Share functionality is not available. Please try again later.");
      return;
    }
    
    if (!actions || typeof actions.composeCast !== 'function') {
      console.warn("composeCast action not available");
      alert("Share functionality is not available. Please try again later.");
      return;
    }
    
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : APP_URL;
      const shareUrl = `${baseUrl}/share/${context.user.fid}`;
      const shareText = score !== undefined && score !== null
        ? `My Neynar Score is ${score <= 1 ? score.toFixed(2) : Math.round(score)}. Check your score`
        : `Check your score`;
      await actions.composeCast({
        text: shareText,
        embeds: [shareUrl],
      });
    } catch (error) {
      console.error("Failed to share:", error);
      alert(`Failed to share: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }, [context?.user?.fid, actions, score]);

  // Handle score in 0-1 range (from API) or 0-100 range
  // If score <= 1, it's in 0-1 range; otherwise it's in 0-100 range
  const numericScore = typeof score === "number" 
    ? (score <= 1 ? Math.max(0, Math.min(1, score)) : Math.max(0, Math.min(100, score)) / 100)
    : undefined;
  
  // Calculate angle: score is now normalized to 0-1 range
  const angle = typeof numericScore === "number" ? numericScore * 360 : 0;
  
  // Display score in original format (0-1 range shows as decimal, 0-100 shows as integer)
  const displayScore = typeof score === "number" 
    ? (score <= 1 ? score.toFixed(2) : Math.round(score).toString())
    : undefined;
  
  const scoreLabel = typeof numericScore === "number" 
    ? `Neynar Score: ${displayScore}` 
    : "Neynar Score: not available";

  const animationClass = prefersReducedMotion 
    ? "" 
    : "animate-in fade-in slide-in-from-bottom-2 duration-300";

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className={`overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-glow backdrop-blur dark:border-white/10 dark:bg-gray-900/80 ${animationClass}`}>
        {error ? (
          // Error state
          <div className="bg-primary-50/80 p-6 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Unable to load score
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  {error}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-primary-400 via-primary-500 to-accent-500 p-7">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  {/* Modernized Gauge */}
                  <div
                    className="relative h-24 w-24 rounded-full grid place-items-center"
                    role="img"
                    aria-label={scoreLabel}
                    style={{
                      backgroundImage: `conic-gradient(from 0deg, rgba(255,255,255,0.95) ${angle}deg, rgba(255,255,255,0.2) ${angle}deg 360deg)`,
                      transition: prefersReducedMotion ? "none" : "background-image 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <div className="grid h-20 w-20 place-items-center rounded-full bg-black/20 backdrop-blur-sm shadow-inner">
                      <span className="text-2xl font-bold text-white drop-shadow-sm">
                        {loading ? (
                          <span 
                            className="spinner-primary h-6 w-6 block" 
                            aria-label="Loading score"
                          />
                        ) : (
                          <>{displayScore ?? "—"}</>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="mb-1 text-sm font-semibold uppercase tracking-[0.3em] text-white/90">Neynar Score</p>
                    <p className="text-xs text-white/80">Quality metric for Farcaster</p>
                  </div>
                </div>

                {pfpUrl ? (
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full ring-4 ring-white/40 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={pfpUrl} 
                      alt={username ? `${username}'s avatar` : "Avatar"} 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                ) : loading ? (
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full ring-4 ring-white/40 shadow-lg" aria-hidden="true">
                    <div className="h-full w-full bg-white/30" />
                    <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="bg-white/70 p-5 dark:bg-gray-900/70">
              <div className="flex flex-wrap items-center gap-2.5">
                {loading && !fid && !username ? (
                  <>
                    <div className="relative h-7 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    </div>
                    <div className="relative h-7 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    </div>
                    <span className="ml-auto inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      <span className="spinner mr-2 h-3 w-3" aria-hidden="true" />
                      Loading...
                    </span>
                  </>
                ) : (
                  <>
                    {typeof fid === "number" && (
                      <span className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-3.5 py-1.5 text-xs font-semibold text-primary-700 dark:border-primary-900/40 dark:bg-primary-900/30 dark:text-primary-200">
                        FID: {fid}
                      </span>
                    )}
                    {username && (
                      <span className="inline-flex items-center rounded-full bg-gray-200 px-3.5 py-1.5 text-xs font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        @{username}
                      </span>
                    )}
                    {actions && typeof actions.composeCast === 'function' && context?.user?.fid && (
                      <Button
                        onClick={handleShare}
                        variant="secondary"
                        size="sm"
                        className="!w-auto !max-w-none !mx-0 inline-flex items-center gap-1.5"
                        title="Share your score"
                        aria-label="Share your score"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-current"
                        >
                          <circle cx="18" cy="5" r="3" />
                          <circle cx="6" cy="12" r="3" />
                          <circle cx="18" cy="19" r="3" />
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                        <span>Share</span>
                      </Button>
                    )}
                    {loading && (
                      <span className="ml-auto inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        <span className="spinner mr-2 h-3 w-3" aria-hidden="true" />
                        Loading...
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


