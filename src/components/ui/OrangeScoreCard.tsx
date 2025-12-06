"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useMiniApp } from "@neynar/react";
import { APP_URL } from "~/lib/constants";

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
  const { actions } = useMiniApp();
  const [shareSuccess, setShareSuccess] = useState(false);
  const [animatedScore, setAnimatedScore] = useState<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const previousScoreRef = useRef<number | null>(null);

  // Orange card displays scores in 0-1 decimal format
  // API returns normalized scores in 0-100 range, so we divide by 100 to get 0-1 range
  const targetScore = score !== null && score !== undefined ? score / 100 : null;
  
  const displayName = username || "User";

  // Animate score from 0.01 to target score (0-1 range)
  useEffect(() => {
    if (loading || targetScore === null) {
      setAnimatedScore(null);
      return;
    }

    // Animate in 0-1 range, multiply by 100 for animation precision
    const animationTarget = targetScore * 100;

    // Only animate if score changed
    if (previousScoreRef.current === targetScore) {
      setAnimatedScore(animationTarget);
      return;
    }

    previousScoreRef.current = targetScore;

    const startValue = 0.01 * 100; // Start from 1 (0.01 in decimal)
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
  }, [targetScore, loading]);

  // Format animated score for display as decimal (0-1 range)
  const scoreDisplay = animatedScore !== null
    ? (animatedScore / 100).toFixed(2)
    : null;

  const handleShare = useCallback(async () => {
    if (!fid) {
      console.warn("User FID not available");
      alert("Share functionality is not available. Please try again later.");
      return;
    }
    
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : APP_URL;
      const shareUrl = `${baseUrl}/share/${fid}?design=${design}`;
      // Orange card displays score in 0-1 decimal format
      const shareScoreText = targetScore !== null
        ? targetScore.toFixed(2)
        : "N/A";
      const shareText = `My Neynar Score is ${shareScoreText}. Check your score`;

      // Try composeCast first (Farcaster mini app)
      if (actions?.composeCast) {
        await actions.composeCast({
          text: shareText,
          embeds: [shareUrl],
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } else if (navigator.share) {
        // Fallback to Web Share API
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
      console.error("Failed to share:", error);
      // Don't show alert if user cancelled
      if (error instanceof Error && error.name !== 'AbortError') {
        alert(`Failed to share: ${error.message}`);
      }
    }
  }, [fid, actions, targetScore, displayName, design]);

  return (
    <div className="relative w-full max-w-md h-[80vh] max-h-[700px] flex flex-col justify-between mx-auto">
      <div className="card shadow-2xl overflow-hidden flex flex-col h-full">
        {error ? (
          <div className="bg-primary-50/80 p-6 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200 flex items-center justify-center flex-grow">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Unable to load score
            </p>
          </div>
        ) : (
          <>
            {/* Header with gradient background */}
            <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-6 relative flex-grow flex flex-col justify-center">
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

            {/* Share button at bottom - black bar with gradient button */}
            <div className="p-6 bg-black">
              <button
                onClick={handleShare}
                className="w-full rounded-lg py-3 px-4 font-semibold text-white transition-opacity bg-gradient-to-r from-orange-500 to-purple-600 hover:opacity-90"
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

