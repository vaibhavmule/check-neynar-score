"use client";

import { useCallback, useState } from "react";

type ScoreCardProps = {
  fid?: number;
  score?: number;
  username?: string;
  pfpUrl?: string;
  loading?: boolean;
  error?: string | null;
};

export function ScoreCard({ fid, score, username, pfpUrl, loading, error }: ScoreCardProps) {
  const [shareSuccess, setShareSuccess] = useState(false);

  // Display score in original format (0-1 range shows as decimal, 0-100 shows as integer)
  const scoreDisplay = score !== null && score !== undefined 
    ? (score <= 1 ? score.toFixed(2) : Math.round(score).toString())
    : null;
  
  const displayName = username || "User";

  const handleShare = useCallback(async () => {
    try {
      const shareScoreText = scoreDisplay || "N/A";
      const shareText = `Check out ${displayName}'s Neynar Score: ${shareScoreText}!`;
      const shareUrl = fid ? `${window.location.origin}?fid=${fid}` : window.location.href;

      // Try Web Share API first (works on mobile and some desktop browsers)
      if (navigator.share) {
        await navigator.share({
          title: `${displayName}'s Neynar Score`,
          text: shareText,
          url: shareUrl,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } else {
        // Fallback to clipboard
        const shareContent = `${shareText}\n${shareUrl}`;
        await navigator.clipboard.writeText(shareContent);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (error) {
      // User cancelled share or clipboard failed
      console.error('Share failed:', error);
    }
  }, [fid, scoreDisplay, displayName]);

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div 
        className="relative rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: '#FF7A3D',
        }}
      >
        {error ? (
          <div className="bg-primary-50/80 p-6 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Unable to load score
            </p>
          </div>
        ) : (
          <div className="p-6 pb-4">
            {/* Refresh button in top right */}
            <button
              onClick={() => window.location.reload()}
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

            {/* Profile Picture - Centered at top */}
            {pfpUrl && (
              <div className="flex justify-center mb-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden"
                  style={{
                    border: '2px solid white',
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

            {/* Username and Neynar Score text - Centered */}
            <div className="text-center mb-2">
              <p className="text-white text-sm mb-1">
                {displayName}'s
              </p>
              <h1 className="text-xl font-bold text-white">
                Neynar Score
              </h1>
            </div>

            {/* Score number - Centered, large */}
            <div className="text-center mb-6">
              {scoreDisplay !== null ? (
                <div className="text-6xl font-bold text-white">
                  {scoreDisplay}
                </div>
              ) : loading ? (
                <div className="flex justify-center">
                  <div className="spinner-primary h-8 w-8" />
                </div>
              ) : (
                <p className="text-lg text-white/80">No score available</p>
              )}
            </div>

            {/* Share button at bottom */}
            <button
              onClick={handleShare}
              className="w-full rounded-lg py-3 px-4 font-semibold text-white transition-colors"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              {shareSuccess ? '✓ Shared!' : 'Share'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
