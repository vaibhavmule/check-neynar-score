"use client";

import Link from "next/link";
import { CASTS } from "~/lib/constants";
import { cleanTitle } from "~/lib/utils";

/**
 * ImproveTab component displays a list of articles for improving Neynar Score.
 */
export function ImproveTab() {
  // Sort casts by priority (lower number = shown first)
  const sortedCasts = [...CASTS].sort((a, b) => {
    const priorityA = a.priority ?? Infinity;
    const priorityB = b.priority ?? Infinity;
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    return 0;
  });

  // Extract hash from URL for routing
  const getCastId = (url: string) => {
    const hashMatch = url.match(/\/([0-9a-fx]+)$/i);
    return hashMatch ? hashMatch[1] : "";
  };

  return (
    <div className="mx-6 py-4 space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700">
          Improve Your Score
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Read these helpful articles to improve your Neynar Score
        </p>
      </div>

      {sortedCasts.length > 0 ? (
        <div className="space-y-3">
          {sortedCasts.map((cast) => {
            const castId = getCastId(cast.url);
            const usernameMatch = cast.url.match(/farcaster\.xyz\/([^/]+)/);
            const username = usernameMatch ? usernameMatch[1] : "unknown";

            return (
              <Link
                key={cast.url}
                href={`/cast/${castId}`}
                className="block"
              >
                <div className="card p-4 hover:opacity-90 transition-opacity cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {cast.badge && (
                          <span className="text-xs px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-300 dark:border-primary-700">
                            {cast.badge}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          @{username}
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {cast.title ? cleanTitle(cast.title) : `Article by @${username}`}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tap to read full article →
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-gray-400 dark:text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="card p-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No articles available at the moment.
          </p>
        </div>
      )}
    </div>
  );
}

