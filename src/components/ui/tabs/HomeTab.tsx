"use client";

import { useState, useCallback } from "react";
import { useMiniApp } from "@neynar/react";
import { ScoreCard } from "../ScoreCard";
import { Button } from "../Button";
import { ShareButton } from "../Share";
import { Input } from "../input";
import { TipButton } from "../TipButton";
import { DailyRewardCard } from "../DailyRewardCard";
import { DEVELOPER_FID, DEVELOPER_TIP_ADDRESS, DEVELOPER_USERNAME } from "~/lib/constants";

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
  const { actions, isSDKLoaded } = useMiniApp();
  const [inputFid, setInputFid] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const handleFollowDeveloper = useCallback(() => {
    if (!isSDKLoaded || !actions) {
      return;
    }
    if (typeof actions.viewProfile === "function") {
      actions.viewProfile({ fid: DEVELOPER_FID });
      return;
    }
    if (typeof actions.openUrl === "function") {
      actions.openUrl(`https://warpcast.com/${DEVELOPER_USERNAME}`);
    }
  }, [actions, isSDKLoaded]);

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
        {(!hasScore || score === null || score === undefined) && !loading && (
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-glow backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
            <div className="space-y-3 text-center">
              <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-50">
                Check Your Neynar Score
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                View your Neynar Score - a metric ranging from 0 to 1 that evaluates the quality of user interactions on the Farcaster platform.
              </p>
            </div>

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

        {(hasScore || loading) && (
          <ScoreCard fid={fid} score={score ?? undefined} username={username} pfpUrl={pfpUrl} loading={loading} />
        )}

        {hasScore && score !== null && score !== undefined && !loading && (
          <DailyRewardCard />
        )}

        {hasScore && score !== null && score !== undefined && !loading && fid && (
          <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
            <div className="space-y-4">
              <div className="space-y-1 text-center">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Share Your Score
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Share your Neynar Score with others.
                </p>
              </div>
              <div className="space-y-3">
                <ShareButton
                  buttonText="Share Score"
                  cast={{
                    text: `My Neynar Score is ${score ?? 0}. Check your score and Claim $ARB, a mini app by @${DEVELOPER_USERNAME}`,
                    embeds: [
                      {
                        path: `/share/${fid}`,
                      },
                    ],
                  }}
                  className="w-full"
                />
                <TipButton
                  recipientFid={fid}
                  username={username}
                  variant="secondary"
                  size="md"
                />
              </div>
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
          <div className="space-y-4">
            <div className="space-y-1 text-center">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Support the developer
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Follow and tip to keep updates coming.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleFollowDeveloper}
                variant="outline"
                size="sm"
                className="w-full text-xs"
                disabled={!isSDKLoaded || (!actions?.viewProfile && !actions?.openUrl)}
              >
                Follow @{DEVELOPER_USERNAME}
              </Button>
              <TipButton
                recipientFid={DEVELOPER_FID}
                username={DEVELOPER_USERNAME}
                recipientAddress={DEVELOPER_TIP_ADDRESS}
                variant="secondary"
                size="md"
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                What is Neynar Score?
              </h3>
            </div>

            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed">
                The Neynar Score is a metric ranging from 0 to 1 that evaluates the quality of user interactions on the Farcaster platform. A higher score indicates a higher confidence in the user being of high quality. This score is updated weekly and reflects the value an account adds to the network.
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

