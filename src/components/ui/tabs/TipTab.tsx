"use client";

import { TipUsdc } from "../wallet/TipUsdc";

/**
 * TipTab component allows users to send USDC tips.
 * 
 * This component provides a simple interface for users to tip USDC.
 */
export function TipTab() {
  // Default recipient FID - you can change this to your FID
  const RECIPIENT_FID = 1356870;

  return (
    <div className="relative flex items-start justify-center px-1 py-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
          <div className="space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Tip USDC
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Support this mini app with a 1 USDC tip
              </p>
            </div>
            <TipUsdc recipientFid={RECIPIENT_FID} />
          </div>
        </div>
      </div>
    </div>
  );
}




