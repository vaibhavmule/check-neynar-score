"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { MAINTENANCE_MODE } from "~/lib/constants";

/**
 * MaintenanceModal displays a blocking maintenance mode popup
 * when the app is in maintenance mode. This modal cannot be dismissed
 * and prevents users from using the app.
 */
export function MaintenanceModal() {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!MAINTENANCE_MODE) return;
    
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  if (!MAINTENANCE_MODE) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop - non-interactive */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal - centered both horizontally and vertically */}
      <div className="relative w-full max-w-md rounded-3xl border border-amber-200/60 bg-amber-50/95 p-8 shadow-2xl backdrop-blur dark:border-amber-800/30 dark:bg-gray-900/95 animate-in fade-in zoom-in duration-200">
        {/* Content */}
        <div className="space-y-6 text-center">
          {/* Warning Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-amber-100 p-4 dark:bg-amber-900/30">
              <svg
                className="h-12 w-12 text-amber-600 dark:text-amber-400"
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
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
              Maintenance Mode
            </h2>
            <p className="text-lg text-amber-800 dark:text-amber-200">
              We&apos;re currently performing maintenance
            </p>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We&apos;re working on our Neynar integration and the app is temporarily unavailable.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We&apos;ll be back soon! Thank you for your patience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document.body level
  if (typeof window === "undefined") return null;
  return createPortal(modalContent, document.body);
}

