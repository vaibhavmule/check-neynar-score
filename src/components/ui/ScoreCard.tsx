"use client";

type ScoreCardProps = {
  fid?: number;
  score?: number;
  username?: string;
  pfpUrl?: string;
  loading?: boolean;
};

export function ScoreCard({ fid, score, username, pfpUrl, loading }: ScoreCardProps) {
  const numericScore = typeof score === "number" ? Math.max(0, Math.min(100, score)) : undefined;
  const angle = typeof numericScore === "number" ? (numericScore / 100) * 360 : 0;

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="card overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="bg-gradient-to-br from-primary to-primary-dark p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Gauge */}
              <div
                className="relative h-20 w-20 rounded-full grid place-items-center shadow-inner"
                aria-label="Neynar score gauge"
                style={{
                  backgroundImage: `conic-gradient(rgb(255 255 255 / 0.9) ${angle}deg, rgb(255 255 255 / 0.25) ${angle}deg)`,
                }}
              >
                <div className="h-16 w-16 rounded-full bg-black/20 grid place-items-center">
                  <span className="text-white text-xl font-bold">
                    {loading ? (
                      <span className="spinner-primary h-5 w-5"></span>
                    ) : (
                      <>{typeof numericScore === "number" ? numericScore : "—"}</>
                    )}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-white/80 text-xs tracking-wide">Neynar Score</p>
                <p className="text-white/95 text-sm">Your reputation snapshot</p>
              </div>
            </div>

            {pfpUrl && (
              <div className="relative h-12 w-12 rounded-full ring-2 ring-white/70 shadow-md overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pfpUrl} alt="Avatar" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            {typeof fid === "number" && (
              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-xs font-medium">
                FID: {fid}
              </span>
            )}
            {username && (
              <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium dark:bg-secondary-dark dark:text-gray-100">
                @{username}
              </span>
            )}
            {!loading && typeof numericScore === "number" && (
              <span className="ml-auto inline-flex items-center rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-white/5 dark:text-gray-300">
                Last updated just now
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


