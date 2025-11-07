"use client";

import { useState } from "react";
import { ScoreCard } from "../ScoreCard";
import { Button } from "../Button";
import { ShareButton } from "../Share";
import { Input } from "../input";
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
  fetchScore: (fid?: number) => Promise<void>;
  hasScore: boolean;
};

export function HomeTab({ fid, score, username, pfpUrl, loading, fetchScore, hasScore }: HomeTabProps) {
  // Hide follow CTA when the developer is viewing their own score
  const isDeveloper = fid === DEVELOPER_FID;
  const [inputFid, setInputFid] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const handleFidSubmit = async () => {
    const parsedFid = parseInt(inputFid.trim(), 10);
    if (isNaN(parsedFid) || parsedFid <= 0) {
      setInputError("Please enter a valid FID (positive number)");
      return;
    }
    setInputError(null);
    await fetchScore(parsedFid);
  };
  
  return (
    <div className="relative flex min-h-[calc(100vh-220px)] items-start justify-center px-1 py-2 sm:px-2">
      <div className="w-full max-w-md space-y-6">
        {/* Show welcome card only when no score is shown */}
        {(!hasScore || score === null || score === undefined) && !loading && (
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-glow backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
            <div className="space-y-3 text-center">
              <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-50">
                Keep your Neynar glow going
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Tap below to refresh your score and make sure your Farcaster presence stays warm and welcoming.
              </p>
            </div>

            {/* Show button if no score or allow refresh (only if following, not checked yet, or is developer) */}
            {fid && (
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
              <div className="mt-6 space-y-3">
                <div className="space-y-2">
                  <label htmlFor="fid-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enter FID to check score
                  </label>
                  <Input
                    id="fid-input"
                    type="number"
                    placeholder="Enter FID (e.g., 12345)"
                    value={inputFid}
                    onChange={(e) => {
                      setInputFid(e.target.value);
                      setInputError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleFidSubmit();
                      }
                    }}
                    className={inputError ? "border-error focus:border-error focus:ring-error" : ""}
                  />
                  {inputError && (
                    <p className="text-xs text-error">{inputError}</p>
                  )}
                </div>
                <Button
                  onClick={handleFidSubmit}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={loading}
                  disabled={loading || !inputFid.trim()}
                >
                  Check score
                </Button>
              </div>
            )}
          </div>
        )}

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

        {/* What is Neynar Score section - always shown */}
        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                What is Neynar Score?
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                A quick primer on what the number means
              </p>
            </div>

            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed">
                Neynar looks at casts, replies, reactions, and follows to estimate how helpful and
                trustworthy your presence is. Scores run from 0.00 to 1.00.
              </p>

              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5" aria-hidden="true">-</span>
                  <span>Helpful casts and genuine replies raise your score.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5" aria-hidden="true">-</span>
                  <span>Low-effort or spammy behaviour nudges it downward.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5" aria-hidden="true">-</span>
                  <span>It updates weekly, so steady consistency matters.</span>
                </li>
              </ul>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 text-center">
                <a
                  href="https://docs.neynar.com/docs/neynar-user-quality-score"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Learn more in Neynar documentation →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}