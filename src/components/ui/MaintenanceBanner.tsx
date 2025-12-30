"use client";

/**
 * MaintenanceBanner displays a prominent maintenance mode message
 * when the app is in maintenance mode.
 */
export function MaintenanceBanner() {
  return (
    <div className="relative z-50 w-full">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-amber-500 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-amber-900"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-amber-900">
                  <span className="font-bold">Maintenance Mode</span>
                </p>
                <p className="mt-1 text-sm text-amber-800">
                  We're currently performing maintenance on our Neynar integration. 
                  Some features may be temporarily unavailable. We'll be back soon!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

