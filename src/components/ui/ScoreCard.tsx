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
      <div className="card shadow-2xl overflow-hidden">
        {error ? (
          <div className="bg-primary-50/80 p-6 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Unable to load score
            </p>
          </div>
        ) : (
          <>
            {/* Header with refresh icon */}
            <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-6 relative">
              <div className="absolute top-4 right-4">
                <button
                  onClick={handleRefresh}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
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

              {/* Profile Picture */}
              {pfpUrl && (
                <div className="flex justify-center mb-4">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pfpUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Score Display */}
              <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {displayName}&apos;s Neynar Score
                </h1>
                {scoreDisplay !== null ? (
                  <div className="text-7xl font-bold text-white">
                    {scoreDisplay}
                  </div>
                ) : loading ? (
                  <div className="flex justify-center">
                    <div className="spinner-primary h-12 w-12" />
                  </div>
                ) : (
                  <p className="text-xl text-white/80">No score available</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


