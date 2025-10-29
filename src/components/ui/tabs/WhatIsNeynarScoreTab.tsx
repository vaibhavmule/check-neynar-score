"use client";

/**
 * WhatIsNeynarScoreTab component displays information about Neynar Score.
 * 
 * This component provides users with context about what the Neynar Score is,
 * how it works, and why it matters for their Farcaster reputation.
 * 
 * @example
 * ```tsx
 * <WhatIsNeynarScoreTab />
 * ```
 */
export function WhatIsNeynarScoreTab() {
  return (
    <div className="mx-6 py-4 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-700">
          What is Neynar Score?
        </h2>
      </div>

      <div className="card p-6 space-y-4">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Your Reputation on Farcaster
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            Neynar Score is a quality metric that measures your reputation and engagement 
            within the Farcaster ecosystem. It reflects how authentic and valuable your 
            presence is in the network.
          </p>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            How It Works
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
              <span>Based on your activity and interactions on Farcaster</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
              <span>Measures authenticity and community engagement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
              <span>Updated regularly to reflect your current reputation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
              <span>Scores range from 0 to 100</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Why It Matters
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            A higher Neynar Score indicates a stronger reputation in the Farcaster community. 
            This can help others understand your standing and build trust in your interactions.
          </p>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Learn more at{" "}
            <a
              href="https://docs.neynar.com/docs/neynar-user-quality-score"
              target="_blank"
              rel="noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Neynar Documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

