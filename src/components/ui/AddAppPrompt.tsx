'use client';

import { useEffect, useState } from 'react';
import { useMiniApp } from '@neynar/react';
import { Button } from './Button';
import { getItem, setItem } from '~/lib/localStorage';

const PROMPT_DISMISSED_KEY = 'add_app_prompt_dismissed';
const PROMPT_DISMISSED_TIMESTAMP_KEY = 'add_app_prompt_dismissed_timestamp';

// Show prompt again after 24 hours if dismissed
const RESHOW_AFTER_HOURS = 24;

interface AddAppPromptProps {
  delay?: number; // Delay in milliseconds before showing
}

/**
 * AddAppPrompt component displays an early prompt to encourage users to add the mini app.
 * 
 * This component appears when users first open the mini app, before they interact
 * with other features. It can be dismissed but will show again after a certain period.
 * 
 * Features:
 * - Shows early in the user journey
 * - Can be dismissed
 * - Remembers dismissal state (shows again after 24 hours)
 * - Only shows if app is not already added
 * - Prominent CTA with clear value proposition
 * 
 * @param delay - Optional delay in milliseconds before showing the prompt (default: 1500ms)
 * 
 * @example
 * ```tsx
 * <AddAppPrompt delay={2000} />
 * ```
 */
export function AddAppPrompt({ delay = 1500 }: AddAppPromptProps) {
  const { actions, added } = useMiniApp();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Close prompt if app is already added
    if (added) {
      setShowPrompt(false);
      return;
    }

    // Check if prompt was recently dismissed
    const dismissedTimestamp = getItem<number>(PROMPT_DISMISSED_TIMESTAMP_KEY);
    if (dismissedTimestamp) {
      const hoursSinceDismissal = (Date.now() - dismissedTimestamp) / (1000 * 60 * 60);
      if (hoursSinceDismissal < RESHOW_AFTER_HOURS) {
        return; // Don't show if dismissed within last 24 hours
      }
    }

    // Show prompt after delay
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [added, delay]);

  const handleAddApp = () => {
    actions.addMiniApp();
    // Close prompt after adding
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setItem(PROMPT_DISMISSED_KEY, true);
    setItem(PROMPT_DISMISSED_TIMESTAMP_KEY, Date.now());
  };

  // Don't render if already added or prompt not shown
  if (!showPrompt || added) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="card max-w-md w-full p-6 space-y-4 animate-scale-in shadow-glow-lg">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-4xl mb-2">⭐</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Add to Your App
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get quick access to check your Neynar score anytime
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
            <span className="text-primary-500 font-bold text-base leading-4">✓</span>
            <span>Quick access from your app menu</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
            <span className="text-primary-500 font-bold text-base leading-4">✓</span>
            <span>Track your score without searching</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
            <span className="text-primary-500 font-bold text-base leading-4">✓</span>
            <span>Stay updated on your reputation</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <Button
            onClick={handleAddApp}
            variant="primary"
            size="lg"
            className="w-full"
          >
            ⭐ Add to App
          </Button>
          <button
            onClick={handleDismiss}
            className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 py-2 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
