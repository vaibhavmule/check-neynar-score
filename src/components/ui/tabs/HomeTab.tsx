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
                Check Your Neynar Score
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                View your Neynar User Score - a metric ranging from 0 to 1 that evaluates the quality of user interactions on the Farcaster platform.
              </p>
            </div>

            {/* Show button if no score or allow refresh (only if following, not checked yet, or is developer) */}
            {fid && (
              <div className="mt-6">
                <Button
                  onClick={() => fetchScore()}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={loading}
                  disabled={loading}
                >
                  Check Neynar Score
                </Button>
              </div>
            )}

            {!fid && (
              <div className="mt-6 space-y-3">
                <div className="space-y-2">
                  <label htmlFor="fid-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enter FID to check Neynar Score
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
                  Check Neynar Score
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
                  Share Your Score
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Share your Neynar User Score with others.
                </p>
              </div>
              <ShareButton
                buttonText="Share Score"
                cast={{
                  text: `My Neynar User Score is ${(score ?? 0).toFixed(2)}. Check your score:`,
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
                What is Neynar User Score?
              </h3>
            </div>

            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed">
                The Neynar User Score is a metric ranging from 0 to 1 that evaluates the quality of user interactions on the Farcaster platform. A higher score indicates a higher confidence in the user being of high quality. This score is updated weekly and reflects the value an account adds to the network.
              </p>

              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5" aria-hidden="true">-</span>
                  <span>The score measures account quality and the positive impact of user activity on the network.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5" aria-hidden="true">-</span>
                  <span>It is not a proof of humanity but assesses account quality, distinguishing between high and low-quality activities, including AI-generated content.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5" aria-hidden="true">-</span>
                  <span>Users can enhance their scores by engaging in meaningful interactions with other reputable users.</span>
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