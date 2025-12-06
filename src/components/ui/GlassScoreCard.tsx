"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useMiniApp } from "@neynar/react";
import { APP_URL } from "~/lib/constants";

type GlassScoreCardProps = {
  fid?: number;
  score?: number;
  username?: string;
  pfpUrl?: string;
  loading?: boolean;
  error?: string | null;
  design?: string;
};

export function GlassScoreCard({ fid, score, username, pfpUrl, loading, error, design = 'glass' }: GlassScoreCardProps) {
  const { context, actions } = useMiniApp();
  const [animatedScore, setAnimatedScore] = useState<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const previousScoreRef = useRef<number | null>(null);

  // Target score normalized to 0-100 range
  const targetScore = score !== undefined && score !== null 
    ? Math.max(0, Math.min(100, score)) 
    : null;

  // Animate score from 0.01 to target score
  useEffect(() => {
    if (loading || targetScore === null) {
      setAnimatedScore(null);
      return;
    }

    // Only animate if score changed
    if (previousScoreRef.current === targetScore) {
      setAnimatedScore(targetScore);
      return;
    }

    previousScoreRef.current = targetScore;

    const startValue = 0.01;
    const endValue = targetScore;
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

  // Display score rounded for glass design
  const displayScore = animatedScore !== null ? Math.round(animatedScore) : null;

  const handleTip = useCallback(async () => {
    if (!actions?.sendToken) {
      console.warn("sendToken action not available");
      alert("Tip functionality is not available. Please try again later.");
      return;
    }
    
    try {
      await actions.sendToken({
        recipientFid: 1356870,
        token: "eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
        amount: "1000000", // 1 USDC (6 decimals)
      });
    } catch (error) {
      console.error("Failed to tip:", error);
      alert(`Failed to send tip: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }, [actions]);

  const handleShare = useCallback(async () => {
    if (!fid) {
      console.warn("User FID not available");
      alert("Share functionality is not available. Please try again later.");
      return;
    }
    
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : APP_URL;
      const shareUrl = `${baseUrl}/share/${fid}?design=${design}`;
      const shareText = score !== undefined && score !== null
        ? `My Neynar Score is ${Math.round(score)}. Check your score`
        : 'Check your Neynar Score';

      // Try composeCast first (Farcaster mini app)
      if (actions?.composeCast) {
        await actions.composeCast({
          text: shareText,
          embeds: [shareUrl],
        });
      } else if (navigator.share) {
        // Fallback to Web Share API
        await navigator.share({
          title: `${username || 'User'}'s Neynar Score`,
          text: shareText,
          url: shareUrl,
        });
      } else {
        // Fallback to clipboard
        const shareContent = `${shareText}\n${shareUrl}`;
        await navigator.clipboard.writeText(shareContent);
      }
    } catch (error) {
      console.error("Failed to share:", error);
      // Don't show alert if user cancelled
      if (error instanceof Error && error.name !== 'AbortError') {
        alert(`Failed to share: ${error.message}`);
      }
    }
  }, [fid, actions, score, username, design]);

  const buttonStyle = {
    fontFamily: "'Playfair Display', serif",
    fontStyle: 'italic' as const,
    color: 'rgba(255, 255, 255, 0.8)',
    textShadow: '0 0 5px rgba(255,255,255,0.1)',
  };

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.color = '#fff';
    e.currentTarget.style.textShadow = '0 0 15px rgba(255, 255, 255, 0.6)';
    e.currentTarget.style.letterSpacing = '1px';
  };

  const handleButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
    e.currentTarget.style.textShadow = '0 0 5px rgba(255,255,255,0.1)';
    e.currentTarget.style.letterSpacing = '0px';
  };

  if (error) {
    return (
      <div className="relative w-full max-w-[380px] h-[80vh] max-h-[700px] flex flex-col justify-center mx-auto">
        <div className="text-center text-white">
          <p className="text-sm font-semibold">Unable to load score</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full max-w-[380px] h-[80vh] max-h-[700px] flex flex-col justify-between mx-auto"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '30px',
        padding: '2.5rem',
        boxShadow: '0 50px 100px -20px rgba(0,0,0,1)',
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center" style={{ marginTop: '10px' }}>
        <div 
          className="text-white"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 900,
            letterSpacing: '0.5px',
            fontSize: '1rem',
          }}
        >
          {username ? `@${username}` : '—'}
        </div>
        <div 
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: '1rem',
            letterSpacing: '1.5px',
            color: '#a0a0a0',
            fontWeight: 500,
            textTransform: 'uppercase',
          }}
        >
          {fid ? `FID: ${fid}` : 'FID: —'}
        </div>
      </div>

      {/* Center Stage with Glitch */}
      <div className="flex-grow flex justify-center items-center relative">
        {loading ? (
          <div className="flex items-center justify-center w-32 h-32">
            <div className="spinner-primary h-16 w-16 border-white border-4" />
          </div>
        ) : displayScore !== null ? (
          <div 
            className="glitch-text"
            data-text={displayScore.toString()}
          >
            {displayScore}
          </div>
        ) : (
          <div 
            className="glitch-text"
            data-text="—"
          >
            —
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center relative z-10" style={{ pointerEvents: 'auto' }}>
        <div className="flex justify-center items-center gap-4 sm:gap-6 md:gap-8 relative z-10">
          {/* Tip Button */}
          <button
            onClick={handleTip}
            className="bg-transparent border-none cursor-pointer transition-all duration-300"
            style={{
              ...buttonStyle,
              fontSize: '1.8rem',
            }}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            tip
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="bg-transparent border-none cursor-pointer transition-all duration-300"
            style={{
              ...buttonStyle,
              fontSize: '1.8rem',
            }}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            share
          </button>
        </div>
      </div>
    </div>
  );
}

