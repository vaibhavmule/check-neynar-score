"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "./Button";
import { getItem, setItem } from "~/lib/localStorage";

const RESTRUCTURING_NOTICE_DISMISSED_KEY = "restructuring_notice_dismissed";

/**
 * RestructuringNoticeModal component displays a notice about app restructuring.
 * 
 * Shows a popup on first visit informing users that the app is available
 * for a limited time before restructuring. Once dismissed, it won't show again.
 */
export function RestructuringNoticeModal() {
  const [isOpen, setIsOpen] = useState(false);

  // Check if notice has been dismissed
  useEffect(() => {
    const dismissed = getItem<boolean>(RESTRUCTURING_NOTICE_DISMISSED_KEY);
    if (!dismissed) {
      // Small delay to ensure smooth rendering
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    // Remember that user dismissed the notice
    setItem(RESTRUCTURING_NOTICE_DISMISSED_KEY, true);
  }, []);

  // Close on escape key and prevent body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    
    // Prevent body scroll when modal is open
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen, handleClose]);

  // Portal the modal to document.body to avoid z-index and overflow issues
  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal - centered both horizontally and vertically */}
      <div className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white/95 p-6 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-gray-900/95 animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="space-y-4">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="text-4xl mb-2">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Important Notice
            </h2>
          </div>

          {/* Message */}
          <div className="space-y-3 text-center">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              This app is available for a <strong className="text-primary-600 dark:text-primary-400">limited time</strong> before we restructure it.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We&apos;re working on improvements and will be back with a better experience soon!
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Button
              onClick={handleClose}
              className="w-full"
              variant="primary"
            >
              Got it
            </Button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  // Use portal to render modal at document.body level
  if (typeof window === "undefined") return null;
  return createPortal(modalContent, document.body);
}

