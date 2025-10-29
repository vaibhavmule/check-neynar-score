"use client";

import { useEffect, useState } from "react";
import { APP_URL } from "~/lib/constants";
import { Button } from "~/components/ui/Button";

interface UserData {
  fid: number;
  username?: string;
  display_name?: string;
  pfp_url?: string;
  score: number | null;
}

export function SharePageClient({ fid }: { fid: number }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const baseUrl = APP_URL || window.location.origin;
        const response = await fetch(`${baseUrl}/api/users?fids=${fid}`);
        if (response.ok) {
          const data = await response.json();
          if (data.users?.[0]) {
            setUser(data.users[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [fid]);

  const scoreDisplay = user?.score !== null && user?.score !== undefined 
    ? user.score.toFixed(2) 
    : null;
  const displayName = user?.display_name || user?.username || "User";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500/10 to-primary-700/10 p-4">
      <div className="max-w-md w-full">
        <div className="card shadow-2xl overflow-hidden">
          {/* Header with refresh icon */}
          <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-6 relative">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => window.location.reload()}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                aria-label="Refresh"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>

            {/* Profile Picture */}
            {user?.pfp_url && (
              <div className="flex justify-center mb-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src={user.pfp_url}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Score Display */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                {displayName}&apos;s Neynar Score
              </h1>
              {scoreDisplay !== null ? (
                <div className="text-7xl font-bold text-white">
                  {scoreDisplay}
                </div>
              ) : loading ? (
                <div className="flex justify-center">
                  <div className="spinner-primary h-12 w-12" />
                </div>
              ) : (
                <p className="text-xl text-white/80">Open the app to check your score</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-white dark:bg-gray-900">
            <a href={APP_URL || "/"}>
              <Button variant="primary" size="lg" className="w-full">
                Launch Mini App
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

