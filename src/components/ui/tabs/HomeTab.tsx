"use client";

import { ScoreCard } from "../ScoreCard";
import { Button } from "../Button";

/**
 * HomeTab component displays the main landing content for the mini app.
 * 
 * This is the default tab that users see when they first open the mini app.
 * It provides a simple welcome message and placeholder content that can be
 * customized for specific use cases.
 * 
 * @example
 * ```tsx
 * <HomeTab />
 * ```
 */
type HomeTabProps = {
  fid?: number;
  score?: number | null;
  username?: string;
  pfpUrl?: string;
  loading?: boolean;
  fetchScore: () => Promise<void>;
  hasScore: boolean;
};

export function HomeTab({ fid, score, username, pfpUrl, loading, fetchScore, hasScore }: HomeTabProps) {
  return (
    <div className="relative flex items-center justify-center h-[calc(100vh-200px)] px-6">
      {/* ambient background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-primary-dark/20 blur-3xl" />
      </div>
      <div className="w-full max-w-md mx-auto">
        <div className="mb-4 text-center">
          <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">Check your Neynar score</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Only visible inside Farcaster</p>
        </div>
        
        {/* Show button if no score or allow refresh */}
        {(!hasScore || score === null || score === undefined) && !loading && (
          <div className="mb-4">
            <Button
              onClick={fetchScore}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Check My Score
            </Button>
          </div>
        )}
        
        {/* Show score card if we have data or are loading */}
        {(hasScore || loading) && (
          <ScoreCard fid={fid} score={score ?? undefined} username={username} pfpUrl={pfpUrl} loading={loading} />
        )}
        
        {/* Show refresh button if score exists */}
        {hasScore && score !== null && score !== undefined && !loading && (
          <div className="mt-4">
            <Button
              onClick={fetchScore}
              variant="outline"
              size="md"
              className="w-full"
            >
              Refresh Score
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}