"use client";

import { CastList } from "../CastList";
import { CASTS } from "~/lib/constants";

/**
 * TipsTab component displays educational casts and tips for improving Neynar Score.
 * 
 * This component provides users with actionable advice and community resources
 * to help them understand and improve their Neynar Score.
 */
export function TipsTab() {
  return (
    <div className="relative flex items-start justify-center px-1 py-4">
      <div className="w-full max-w-md space-y-4">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
          <div className="space-y-4">
            <div className="space-y-1 text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Tips to Improve Your Score
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Learn from the community
              </p>
            </div>
            <CastList casts={CASTS} />
          </div>
        </div>
      </div>
    </div>
  );
}
