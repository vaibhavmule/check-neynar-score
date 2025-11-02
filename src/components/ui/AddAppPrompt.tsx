'use client';

import { useEffect, useState } from 'react';
import { useMiniApp } from '@neynar/react';
import { getItem } from '~/lib/localStorage';

const PROMPT_DISMISSED_TIMESTAMP_KEY = 'add_app_prompt_dismissed_timestamp';

// Show prompt again after 24 hours if dismissed
const RESHOW_AFTER_HOURS = 24;

interface AddAppPromptProps {
  hasScore?: boolean; // Whether score has been checked/fetched
  delay?: number; // Delay in milliseconds after score is checked (default: 1000ms)
}

/**
 * AddAppPrompt component automatically triggers "Add to App" after score is checked.
 * 
 * This component monitors when a score is checked and automatically triggers
 * the "Add to App" action after a delay. The button remains visible in the UI
 * for manual interaction if needed.
 * 
 * Features:
 * - Automatically triggers after score is checked
 * - Waits 1 second after score is available
 * - Only triggers if app is not already added
 * - Doesn't show modal, just auto-triggers the action
 * 
 * @param hasScore - Whether score has been checked/fetched
 * @param delay - Delay in milliseconds after score is checked (default: 1000ms)
 * 
 * @example
 * ```tsx
 * <AddAppPrompt hasScore={hasScore} delay={1000} />
 * ```
 */
export function AddAppPrompt({ hasScore = false, delay = 1000 }: AddAppPromptProps) {
  const { actions, added } = useMiniApp();
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    // Don't trigger if already added or already triggered
    if (added || hasTriggered || !hasScore) {
      return;
    }

    // Check if prompt was recently dismissed (don't auto-trigger if user dismissed)
    const dismissedTimestamp = getItem<number>(PROMPT_DISMISSED_TIMESTAMP_KEY);
    if (dismissedTimestamp) {
      const hoursSinceDismissal = (Date.now() - dismissedTimestamp) / (1000 * 60 * 60);
      if (hoursSinceDismissal < RESHOW_AFTER_HOURS) {
        return; // Don't auto-trigger if dismissed within last 24 hours
      }
    }

    // Auto-trigger add app after delay
    const timer = setTimeout(() => {
      actions.addMiniApp();
      setHasTriggered(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [hasScore, added, delay, actions, hasTriggered]);

  // This component doesn't render anything, just triggers the action
  return null;
}
