"use client";

import { useEffect, useState } from "react";

type ScoreCardProps = {
  fid?: number;
  score?: number;
  username?: string;
  pfpUrl?: string;
  loading?: boolean;
  timeAgo?: string;
  error?: string | null;
};

export function ScoreCard({ fid, score, username, pfpUrl, loading, timeAgo, error }: ScoreCardProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const numericScore = typeof score === "number" ? Math.max(0, Math.min(100, score)) : undefined;
  const angle = typeof numericScore === "number" ? (numericScore / 100) * 360 : 0;
  
  const scoreLabel = typeof numericScore === "number" 
    ? `Neynar Score: ${numericScore} out of 100` 
    : "Neynar Score: not available";

  const animationClass = prefersReducedMotion 
    ? "" 
    : "animate-in fade-in slide-in-from-bottom-2 duration-300";

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className={`card overflow-hidden ${animationClass}`}>
        {error ? (
          // Error state
          <div className="card-primary p-6">
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
            <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-5">
                  {/* Modernized Gauge */}
                  <div
                    className="relative h-24 w-24 rounded-full grid place-items-center"
                    role="img"
                    aria-label={scoreLabel}
                    style={{
                      backgroundImage: `conic-gradient(from 0deg, rgb(255 255 255 / 0.95) ${angle}deg, rgb(255 255 255 / 0.15) ${angle}deg 360deg)`,
                      transition: prefersReducedMotion ? "none" : "background-image 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <div className="h-20 w-20 rounded-full bg-black/20 backdrop-blur-sm grid place-items-center shadow-inner">
                      <span className="text-white text-2xl font-bold drop-shadow-sm">
                        {loading ? (
                          <span 
                            className="spinner-primary h-6 w-6 block" 
                            aria-label="Loading score"
                          />
                        ) : (
                          <>{typeof numericScore === "number" ? numericScore : "—"}</>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm tracking-wide font-semibold mb-1">Neynar Score</p>
                    <p className="text-white/85 text-xs">Your quality score snapshot</p>
                  </div>
                </div>

                {pfpUrl ? (
                  <div className="relative h-14 w-14 rounded-full ring-3 ring-white/50 shadow-lg overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={pfpUrl} 
                      alt={username ? `${username}'s avatar` : "Avatar"} 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                ) : loading ? (
                  <div className="relative h-14 w-14 rounded-full ring-3 ring-white/50 shadow-lg overflow-hidden flex-shrink-0" aria-hidden="true">
                    <div className="h-full w-full bg-white/20" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="p-5 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex flex-wrap items-center gap-2.5">
                {loading && !fid && !username ? (
                  <>
                    <div className="relative h-7 w-20 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                    </div>
                    <div className="relative h-7 w-24 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                    </div>
                    <span className="ml-auto inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                      <span className="spinner h-3 w-3 mr-2" aria-hidden="true" />
                      Loading...
                    </span>
                  </>
                ) : (
                  <>
                    {typeof fid === "number" && (
                      <span className="inline-flex items-center rounded-full bg-primary-100 text-primary-700 border border-primary-200 px-3.5 py-1.5 text-xs font-semibold dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-700/50">
                        FID: {fid}
                      </span>
                    )}
                    {username && (
                      <span className="inline-flex items-center rounded-full bg-gray-200 text-gray-800 px-3.5 py-1.5 text-xs font-semibold dark:bg-gray-700 dark:text-gray-200">
                        @{username}
                      </span>
                    )}
                    {loading && (
                      <span className="ml-auto inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                        <span className="spinner h-3 w-3 mr-2" aria-hidden="true" />
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


