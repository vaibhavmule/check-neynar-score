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
    <div className="container">
      <div className="relative">
        <div 
          className="mt-4 mb-4 px-4 py-3.5 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-between border-2 border-primary-200 dark:border-primary-800 shadow-soft"
        >
          <div className="text-lg font-semibold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-700">
              {APP_NAME}
            </span>
          </div>
          {context?.user && (
            <button
              ref={buttonRef}
              type="button"
              onClick={toggleDropdown}
              className="cursor-pointer focus-ring rounded-full p-1 transition-all hover:ring-2 hover:ring-primary-300 active:scale-95"
              aria-label="User menu"
              aria-expanded={isUserDropdownOpen}
              aria-controls="user-dropdown"
              aria-haspopup="true"
            >
              {context.user.pfpUrl && (
                <img 
                  src={context.user.pfpUrl} 
                  alt={`${context.user.displayName || context.user.username}'s profile`} 
                  className="w-10 h-10 rounded-full border-2 border-primary-300 dark:border-primary-600 shadow-sm"
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
                className="absolute top-full right-0 z-50 w-fit mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-medium border border-gray-200 dark:border-gray-700 animate-scale-in"
                role="menu"
                aria-orientation="vertical"
              >
                <div className="p-5 space-y-3 min-w-[200px]">
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleViewProfile}
                      className="font-semibold text-sm hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer inline-block focus-ring rounded-lg px-2 py-1 text-left transition-colors w-full text-gray-900 dark:text-gray-100"
                      role="menuitem"
                    >
                      {context.user.displayName || context.user.username}
                    </button>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      @{context.user.username}
                    </p>
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1.5">
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        FID: {context.user.fid}
                      </p>
                      {neynarUser && (
                        <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
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
