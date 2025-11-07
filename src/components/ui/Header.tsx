"use client";

import { useState, useRef, useEffect } from "react";
import { APP_NAME } from "~/lib/constants";
import sdk from "@farcaster/miniapp-sdk";
import { useMiniApp } from "@neynar/react";
import { useDetectClickOutside } from "~/hooks/useDetectClickOutside";

type HeaderProps = {
  neynarUser?: {
    fid: number;
    score: number | null;
  } | null;
};

export function Header({ neynarUser }: HeaderProps) {
  const { context } = useMiniApp();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useDetectClickOutside(dropdownRef, () => {
    if (isUserDropdownOpen) {
      setIsUserDropdownOpen(false);
    }
  });

  // Handle Escape key to close dropdown
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isUserDropdownOpen) {
        setIsUserDropdownOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isUserDropdownOpen]);

  const toggleDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const handleViewProfile = () => {
    sdk.actions.viewProfile({ fid: context!.user.fid });
    setIsUserDropdownOpen(false);
  };

  return (
    <div className="container pt-6">
      <div className="relative">
        <div
          className="mb-5 flex items-center justify-between rounded-2xl border border-white/50 bg-white/70 px-5 py-4 shadow-glow backdrop-blur dark:border-white/10 dark:bg-gray-900/60"
        >
          <div>
            <div className="text-xl font-semibold leading-tight">
              <span className="bg-gradient-to-r from-primary-500 via-primary-400 to-accent-500 bg-clip-text text-transparent">
                {APP_NAME}
              </span>
            </div>
          </div>
          {context?.user && (
            <button
              ref={buttonRef}
              type="button"
              onClick={toggleDropdown}
              className="cursor-pointer rounded-full border border-white/70 bg-white/80 p-1 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow focus-ring dark:border-white/10 dark:bg-gray-900/80"
              aria-label="User menu"
              aria-expanded={isUserDropdownOpen}
              aria-controls="user-dropdown"
              aria-haspopup="true"
            >
              {context.user.pfpUrl && (
                <img
                  src={context.user.pfpUrl}
                  alt={`${context.user.displayName || context.user.username}'s profile`}
                  className="h-11 w-11 rounded-full border border-white/70 shadow-sm dark:border-white/10"
                />
              )}
            </button>
          )}
        </div>
        {context?.user && (
          <>      
            {isUserDropdownOpen && (
              <div
                ref={dropdownRef}
                id="user-dropdown"
                className="absolute right-0 top-full z-50 mt-3 w-fit rounded-2xl border border-white/60 bg-white/90 shadow-soft backdrop-blur-lg dark:border-white/10 dark:bg-gray-900/90"
                role="menu"
                aria-orientation="vertical"
              >
                <div className="min-w-[220px] space-y-3 p-5">
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleViewProfile}
                      className="inline-block w-full rounded-lg px-2 py-1 text-left text-sm font-semibold text-gray-900 transition-colors hover:text-primary-600 focus-ring dark:text-gray-100 dark:hover:text-primary-300"
                      role="menuitem"
                    >
                      {context.user.displayName || context.user.username}
                    </button>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      @{context.user.username}
                    </p>
                    <div className="space-y-1.5 border-t border-gray-200 pt-2 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        FID: {context.user.fid}
                      </p>
                      {neynarUser && (
                        <p className="text-xs font-medium text-primary-600 dark:text-primary-300">
                          Neynar Score: {neynarUser.score ?? 'N/A'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
