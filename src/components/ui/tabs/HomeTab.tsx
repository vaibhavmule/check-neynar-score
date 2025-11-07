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
};

export function HomeTab({ fid, score, username, pfpUrl, loading, fetchScore, hasScore }: HomeTabProps) {
  // Hide follow CTA when the developer is viewing their own score
  const isDeveloper = fid === DEVELOPER_FID;
  
  return (
    <div className="relative flex min-h-[calc(100vh-220px)] items-start justify-center px-1 py-2 sm:px-2">
      <div className="w-full max-w-md space-y-6">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-glow backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
          <div className="space-y-3 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200/70 bg-primary-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary-600 dark:border-primary-900/40 dark:bg-primary-900/30 dark:text-primary-200">
              Daily check-in
            </span>
            <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-50">
              Keep your Neynar glow going
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Tap below to refresh your score and make sure your Farcaster presence stays warm and welcoming.
            </p>
          </div>

          {/* Show button if no score or allow refresh (only if following, not checked yet, or is developer) */}
          {fid && (!hasScore || score === null || score === undefined) && !loading && (
            <div className="mt-6">
              <Button
                onClick={fetchScore}
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={loading}
                disabled={loading}
              >
                Check my score
              </Button>
            </div>
          )}

          {!fid && (
            <div className="mt-6 rounded-2xl border border-dashed border-primary-200/60 bg-primary-50/40 px-4 py-3 text-sm text-primary-700 dark:border-primary-900/50 dark:bg-primary-900/20 dark:text-primary-200">
              Open from Farcaster to connect your account and see your personal Neynar score.
            </div>
          )}
        </div>

        {/* Show score card if we have data or are loading */}
        {(hasScore || loading) && (
          <ScoreCard fid={fid} score={score ?? undefined} username={username} pfpUrl={pfpUrl} loading={loading} />
        )}

        {/* Show action buttons if score exists */}
        {hasScore && score !== null && score !== undefined && !loading && fid && (
          <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
            <div className="space-y-4">
              <div className="space-y-1 text-center">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Celebrate the win
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Share your score or follow along for future boosts.
                </p>
              </div>
              <ShareButton
                buttonText="Share score"
                cast={{
                  text: `I just checked my Neynar score: ${(score ?? 0).toFixed(2)}. Keep tabs on your Farcaster vibes with Check Neynar Score:`,
                  embeds: [
                    {
                      path: `/share/${fid}`,
                    },
                  ],
                }}
                className="w-full"
              />
              {!isDeveloper && (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Support future updates</p>
                  <a
                    href="https://farcaster.xyz/vaibhavmule"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button variant="secondary" size="sm" className="px-4 text-xs">
                      Follow the developer
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}