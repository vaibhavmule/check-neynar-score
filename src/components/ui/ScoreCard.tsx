"use client";

import { useEffect, useState } from "react";

type ScoreCardProps = {
  fid?: number;
  score?: number;
  username?: string;
  pfpUrl?: string;
  loading?: boolean;
  error?: string | null;
};

export function ScoreCard({ score, loading, error }: ScoreCardProps) {
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

  // Handle score in 0-1 range (from API) or 0-100 range
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
          <div className="bg-primary-50/80 p-6 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Unable to load score
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-primary-400 via-primary-500 to-accent-500 p-7">
            <div className="flex items-center gap-5">
              {/* Score Gauge */}
              <div
                className="relative h-24 w-24 rounded-full grid place-items-center flex-shrink-0"
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
                <p className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/90">
                  Neynar Score
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


