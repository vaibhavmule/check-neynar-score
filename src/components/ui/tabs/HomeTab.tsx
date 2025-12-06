"use client";

import { useState } from "react";
import { ScoreCard } from "../ScoreCard";
import { Button } from "../Button";
import { Input } from "../input";

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
    <div className="relative flex items-start justify-center px-1 py-4">
      <div className="w-full max-w-md">
        {(!hasScore || score === null || score === undefined) && !loading && (
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-glow backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
            <div className="space-y-3 text-center">
              <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-50">
                Neynar Score
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
                  Check Your Score
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
                  Check Score
                </Button>
              </div>
            )}
          </div>
        )}

        {(hasScore || loading) && (
          <ScoreCard fid={fid} score={score ?? undefined} username={username} pfpUrl={pfpUrl} loading={loading} />
        )}
      </div>
    </div>
  );
}

