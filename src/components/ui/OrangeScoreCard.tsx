"use client";

import { useCallback, useState, useEffect, useRef } from "react";

type OrangeScoreCardProps = {
  fid?: number;
  score?: number;
  username?: string;
  pfpUrl?: string;
  loading?: boolean;
  error?: string | null;
  design?: string;
};

export function OrangeScoreCard({ fid, score, username, pfpUrl, loading, error, design = 'orange' }: OrangeScoreCardProps) {
  const [shareSuccess, setShareSuccess] = useState(false);
  const [animatedScore, setAnimatedScore] = useState<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const previousScoreRef = useRef<number | null>(null);

  // Display score in original format (0-1 range shows as decimal, 0-100 shows as integer)
  const targetScore = score !== null && score !== undefined ? score : null;
  const isDecimal = targetScore !== null && targetScore <= 1;
  
  const displayName = username || "User";

  // Animate score from 0.01 to target score (multiply by 100 only for decimal scores)
  useEffect(() => {
    if (loading || targetScore === null) {
      setAnimatedScore(null);
      return;
    }

    // For decimal scores (<= 1), multiply by 100 for animation
    // For integer scores (> 1), animate directly
    const animationTarget = isDecimal ? targetScore * 100 : targetScore;

    // Only animate if score changed
    if (previousScoreRef.current === targetScore) {
      setAnimatedScore(animationTarget);
      return;
    }

    previousScoreRef.current = targetScore;

    const startValue = isDecimal ? 0.01 * 100 : 0.01; // Start from 1 for decimals, 0.01 for integers
    const endValue = animationTarget;
    const duration = 1500; // 1.5 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOut;
      
      setAnimatedScore(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setAnimatedScore(endValue);
      }
    };

    setAnimatedScore(startValue);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetScore, loading, isDecimal]);

  // Format animated score for display (divide by 100 if it was a decimal score)
  const scoreDisplay = animatedScore !== null
    ? (isDecimal ? (animatedScore / 100).toFixed(2) : Math.round(animatedScore).toString())
    : null;

  const handleShare = useCallback(async () => {
    try {
      // Use target score for sharing (actual value, not animated)
      const shareScoreText = targetScore !== null
        ? (isDecimal ? targetScore.toFixed(2) : Math.round(targetScore).toString())
        : "N/A";
      const shareText = `Check out ${displayName}'s Neynar Score: ${shareScoreText}!`;
      const shareUrl = fid 
        ? `${window.location.origin}/share/${fid}?design=${design}` 
        : `${window.location.href}${window.location.href.includes('?') ? '&' : '?'}design=${design}`;

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
  }, [fid, targetScore, isDecimal, displayName, design]);

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
            {/* Header with gradient background */}
            <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-6 relative">
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

            {/* Share button at bottom */}
            <div className="p-6 bg-white dark:bg-gray-900">
              <button
                onClick={handleShare}
                className="w-full rounded-lg py-3 px-4 font-semibold text-white transition-opacity bg-gradient-to-r from-primary-500 to-primary-600 hover:opacity-90"
              >
                {shareSuccess ? '✓ Shared!' : 'Share'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

