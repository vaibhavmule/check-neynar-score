"use client";

import { useCallback } from "react";

type ScoreCardProps = {
  fid?: number;
  score?: number;
  username?: string;
  pfpUrl?: string;
  loading?: boolean;
  error?: string | null;
};

export function ScoreCard({ score, username, pfpUrl, loading, error }: ScoreCardProps) {

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  // Display score in original format (0-1 range shows as decimal, 0-100 shows as integer)
  const scoreDisplay = score !== null && score !== undefined 
    ? (score <= 1 ? score.toFixed(2) : Math.round(score).toString())
    : null;
  
  const displayName = username || "User";

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div 
        className="relative rounded-2xl overflow-hidden shadow-2xl p-[1px]"
        style={{
          background: 'linear-gradient(135deg, #FF7A3D 0%, #8A68FF 100%)',
        }}
      >
        <div 
          className="w-full h-full rounded-2xl"
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {error ? (
            <div className="bg-primary-50/80 p-6 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Unable to load score
              </p>
            </div>
          ) : (
            <div className="p-6 flex items-center justify-between gap-4">
            {/* Left side - Neynar Score text with gradient */}
            <div className="flex-1">
              <h1 
                className="text-2xl font-bold mb-2"
                style={{
                  background: 'linear-gradient(90deg, #FF7A3D 0%, #8A68FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Neynar Score
              </h1>
              {scoreDisplay !== null ? (
                <div className="text-4xl font-bold text-white">
                  {scoreDisplay}
                </div>
              ) : loading ? (
                <div className="flex justify-start">
                  <div className="spinner-primary h-8 w-8" />
                </div>
              ) : (
                <p className="text-lg text-white/80">No score available</p>
              )}
            </div>

            {/* Right side - Profile Picture */}
            {pfpUrl && (
              <div className="flex-shrink-0">
                <div className="relative w-16 h-16 rounded-full overflow-hidden"
                  style={{
                    border: '2px solid #1e3a8a',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pfpUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
              aria-label="Refresh"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
