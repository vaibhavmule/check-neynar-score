"use client";

import { useState, useCallback } from "react";
import { OrangeScoreCard } from "./OrangeScoreCard";
import { GlassScoreCard } from "./GlassScoreCard";

type ScoreCardProps = {
  fid?: number;
  score?: number;
  username?: string;
  pfpUrl?: string;
  loading?: boolean;
  error?: string | null;
};

type DesignType = 'orange' | 'glass';

const DESIGN_STORAGE_KEY = 'scoreCardDesign';

export function ScoreCard({ fid, score, username, pfpUrl, loading, error }: ScoreCardProps) {
  // Always default to orange design when visiting score tab
  const [design, setDesign] = useState<DesignType>('orange');

  // Note: We don't load from localStorage to always show orange by default
  // Users can still toggle to glass, and it will be saved for their session

  // Toggle design and save to localStorage
  const toggleDesign = useCallback(() => {
    setDesign((prev) => {
      const newDesign = prev === 'orange' ? 'glass' : 'orange';
      if (typeof window !== 'undefined') {
        localStorage.setItem(DESIGN_STORAGE_KEY, newDesign);
      }
      return newDesign;
    });
  }, []);

  return (
    <div className="relative w-full">
      {/* Design Toggle Button */}
      <button
        onClick={toggleDesign}
        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 transition-colors flex items-center justify-center backdrop-blur-sm border border-white/20"
        aria-label="Toggle design"
        title={`Switch to ${design === 'orange' ? 'glass' : 'orange'} design`}
        style={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        }}
      >
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {design === 'orange' ? (
            // Glass icon (layers)
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
            />
          ) : (
            // Orange/sun icon
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          )}
        </svg>
      </button>

      {/* Render appropriate design variant */}
      {design === 'orange' ? (
        <OrangeScoreCard
          fid={fid}
          score={score}
          username={username}
          pfpUrl={pfpUrl}
          loading={loading}
          error={error}
          design={design}
        />
      ) : (
        <GlassScoreCard
          fid={fid}
          score={score}
          username={username}
          pfpUrl={pfpUrl}
          loading={loading}
          error={error}
          design={design}
        />
      )}
    </div>
  );
}
