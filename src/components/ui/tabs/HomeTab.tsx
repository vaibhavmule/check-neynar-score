"use client";

import { ScoreCard } from "../ScoreCard";
import { Button } from "../Button";
import { ShareButton } from "../Share";
import { DEVELOPER_FID } from "~/lib/constants";

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
  isFollowing?: boolean | null;
  isCheckingFollow?: boolean;
  checkFollowStatus?: () => Promise<boolean>;
};

export function HomeTab({ fid, score, username, pfpUrl, loading, fetchScore, hasScore, isFollowing, isCheckingFollow, checkFollowStatus }: HomeTabProps) {
  // Skip follow gate entirely if viewer is the developer
  const isDeveloper = fid === DEVELOPER_FID;
  
  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-8">
      {/* ambient background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-primary-400/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-primary-600/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center space-y-1.5 -mt-4">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-700">Check your Neynar score</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Only visible inside Farcaster</p>
        </div>
        
        {/* Follow gate: show prompt if follow status known and false (but not for developer) */}
        {fid && !isDeveloper && isFollowing === false && !isCheckingFollow && (
          <div className="space-y-4">
            <div className="card p-5">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">Follow the developer to check your score.</p>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="https://farcaster.xyz/vaibhavmule"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="secondary" size="lg" className="w-full">Open Profile</Button>
                </a>
                <Button
                  onClick={() => { void checkFollowStatus?.(); }}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  Check Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Show button if no score or allow refresh (only if following, not checked yet, or is developer) */}
        {fid && (isDeveloper || isFollowing === null || isFollowing === true) && (!hasScore || score === null || score === undefined) && !loading && (
          <Button
            onClick={fetchScore}
            variant="primary"
            size="lg"
            className="w-full"
          >
            Check My Score
          </Button>
        )}
        
        {/* Show score card if we have data or are loading */}
        {(hasScore || loading) && (
          <ScoreCard fid={fid} score={score ?? undefined} username={username} pfpUrl={pfpUrl} loading={loading} />
        )}
        
        {/* Show action buttons if score exists */}
        {hasScore && score !== null && score !== undefined && !loading && fid && (
          <div className="pt-1">
            <ShareButton
              buttonText="Share Score"
              cast={{
                text: `🎯 My Neynar Score is ${(score ?? 0).toFixed(2)}!\n\nCheck your score:`,
                embeds: [
                  {
                    path: `/share/${fid}`,
                  },
                ],
              }}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}