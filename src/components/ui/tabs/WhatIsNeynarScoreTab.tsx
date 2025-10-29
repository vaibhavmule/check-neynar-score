"use client";

/**
 * WhatIsNeynarScoreTab component displays information about Neynar Score.
 * 
 * This component provides users with context about what the Neynar User Quality Score is,
 * how it works, and how to improve it based on official Neynar documentation.
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
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            The Neynar User Score is a metric that evaluates the quality of user activity 
            on the platform. It reflects the confidence in a user being high-quality, based 
            on their interactions and contributions to the network.
          </p>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Key Points
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
              <span>Scores range from 0 to 1 (not 0 to 100)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
              <span>Assesses account quality and the value added to the network</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
              <span>Differentiates between high and low-quality activities</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
              <span>Not a proof of humanity, but rather an assessment of account quality</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
              <span>Updates weekly</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              How to Improve Your Score
            </h3>
            <span 
              className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800 select-none cursor-default"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              Coming Soon
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            Focus on engaging in high-quality interactions with other users. The score updates 
            weekly, so consistent positive activity can lead to an improved score over time.
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

