"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "./Button";
import { useCeloReward } from "~/hooks/useCeloReward";
import { useAccount } from "wagmi";

/**
 * CeloRewardModal component displays a popup for claiming daily Celo rewards.
 * 
 * Shows a popup when users first visit, allowing them to claim CELO rewards.
 * Once dismissed, it won't show again until the next day (or can be configured).
 */
export function CeloRewardModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected } = useAccount();
  const {
    claim,
    isPending,
    isSuccess,
    error,
    canClaim,
    rewardAmountDisplay,
    timeUntilNextClaim,
  } = useCeloReward();

  // Show modal when component mounts (every time app opens)
  useEffect(() => {
    // Small delay to ensure smooth rendering
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    // Note: Modal will show again on next app open
  }, []);

  const handleClaim = () => {
    if (!isConnected) {
      // This will trigger wallet connection
      return;
    }
    claim();
  };

  // Close modal after successful claim
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        handleClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, handleClose]);

  const getButtonText = () => {
    if (!isConnected) {
      return "Connect Wallet";
    }
    if (isPending) {
      return "Claiming...";
    }
    if (isSuccess) {
      return "Claimed! ✓";
    }
    return "Claim";
  };

  const isButtonDisabled = () => {
    return isPending;
  };

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
            <div className="text-4xl mb-2">🎁</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Reward
            </h2>
          </div>

          {/* Message */}
          <div className="space-y-3 text-center">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Claim your <strong className="text-primary-600 dark:text-primary-400">CELO</strong> reward!
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
              ⏰ Available for a limited time only
            </p>
            {!canClaim && timeUntilNextClaim && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Next claim available in {timeUntilNextClaim.hours}h {timeUntilNextClaim.minutes}m
              </p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="text-xs text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {error instanceof Error ? error.message : "Transaction failed"}
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 space-y-2">
            <Button
              onClick={handleClaim}
              disabled={isButtonDisabled()}
              className="w-full"
              variant={isSuccess ? "secondary" : "primary"}
            >
              {getButtonText()}
            </Button>
            <Button
              onClick={handleClose}
              className="w-full"
              variant="secondary"
            >
              Maybe Later
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

