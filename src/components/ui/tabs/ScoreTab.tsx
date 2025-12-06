"use client";

import { ScoreCard } from "../ScoreCard";

type ScoreTabProps = {
  fid?: number;
  score?: number | null;
  username?: string;
  pfpUrl?: string;
  loading?: boolean;
  error?: string | null;
};

/**
 * ScoreTab component displays the Neynar Score card.
 * 
 * This is the main view showing the user's score in a clean, minimal card.
 */
export function ScoreTab({ fid, score, username, pfpUrl, loading, error }: ScoreTabProps) {
  return (
    <div className="relative flex items-start justify-center px-1 py-4">
      <div className="w-full max-w-md">
        <ScoreCard 
          fid={fid} 
          score={score ?? undefined} 
          username={username} 
          pfpUrl={pfpUrl} 
          loading={loading}
          error={error ?? undefined}
        />
      </div>
    </div>
  );
}

