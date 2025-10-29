"use client";

import { useMiniApp } from "@neynar/react";

/**
 * ContextTab component displays the current mini app context in JSON format.
 * 
 * This component provides a developer-friendly view of the Farcaster mini app context,
 * including user information, client details, and other contextual data. It's useful
 * for debugging and understanding what data is available to the mini app.
 * 
 * The context includes:
 * - User information (FID, username, display name, profile picture)
 * - Client information (safe area insets, platform details)
 * - Mini app configuration and state
 * 
 * @example
 * ```tsx
 * <ContextTab />
 * ```
 */
export function ContextTab() {
  const { context } = useMiniApp();
  
  return (
    <div className="mx-6 py-4">
      <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-700">Context</h2>
      <div className="card p-5">
        <pre className="font-mono text-xs whitespace-pre-wrap break-words w-full text-gray-700 dark:text-gray-300 leading-relaxed">
          {JSON.stringify(context, null, 2)}
        </pre>
      </div>
    </div>
  );
} 