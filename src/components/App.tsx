"use client";

import { useEffect } from "react";
import { useMiniApp } from "@neynar/react";
import { sdk } from "@farcaster/miniapp-sdk";
import { Header } from "~/components/ui/Header";
import { HomeTab } from "~/components/ui/tabs";
import { AddAppPrompt } from "~/components/ui/AddAppPrompt";
import { useNeynarUser } from "../hooks/useNeynarUser";

export interface AppProps {
  title?: string;
}

/**
 * App component serves as the main container for the mini app interface.
 * 
 * This component orchestrates the overall mini app experience by:
 * - Handling Farcaster mini app initialization
 * - Coordinating user context and score fetching
 * - Providing error handling and loading states
 * - Rendering the single-page score checking interface
 * 
 * The component integrates with the Neynar SDK for Farcaster functionality.
 * It provides a single-page app experience for checking Neynar scores.
 * 
 * Features:
 * - Single-page interface (no tabs)
 * - Farcaster mini app integration
 * - Score fetching for connected users or by FID input
 * - Error handling and display
 * - Loading states for async operations
 * 
 * @param props - Component props
 * @param props.title - Optional title for the mini app (defaults to "Neynar Starter Kit")
 * 
 * @example
 * ```tsx
 * <App title="My Mini App" />
 * ```
 */
export default function App(
  { title: _title }: AppProps = { title: "Neynar Starter Kit" }
) {
  // --- Hooks ---
  const {
    isSDKLoaded,
    context,
  } = useMiniApp();

  // --- Neynar user hook ---
  const {
    user: neynarUser,
    fetchScore,
    loading: scoreLoading,
  } = useNeynarUser(context || undefined);

  // --- Effects ---
  /**
   * Signals readiness when the SDK is loaded.
   * 
   * This effect calls sdk.actions.ready() to signal that
   * the app is ready to be displayed, which dismisses the splash screen.
   */
  useEffect(() => {
    if (isSDKLoaded) {
      // Signal that the app is ready to be displayed
      sdk.actions.ready();
    }
  }, [isSDKLoaded]);

  // --- Early Returns ---
  if (!isSDKLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <div className="spinner h-10 w-10 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading SDK...</p>
        </div>
      </div>
    );
  }

  // --- Render ---
  return (
    <>
      {/* Auto-trigger "Add to App" 1 second after score is checked */}
      <AddAppPrompt hasScore={neynarUser !== null} delay={1000} />

      <div
        className="relative min-h-screen bg-gradient-to-br from-secondary via-white to-primary-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900"
        style={{
          paddingTop: context?.client.safeAreaInsets?.top ?? 0,
          paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
          paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
          paddingRight: context?.client.safeAreaInsets?.right ?? 0,
        }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-16 h-64 w-64 rounded-full bg-primary-200/50 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-accent-200/40 blur-3xl" />
          <div className="absolute top-1/3 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary-100/30 blur-[120px]" />
        </div>

        <div className="relative flex min-h-screen flex-col">
          {/* Header should be full width */}
          <Header neynarUser={neynarUser} />

          {/* Main content area */}
          <main className="flex-1">
            <div className="container py-5 pb-8">
              <HomeTab
                fid={neynarUser?.fid ?? context?.user?.fid}
                username={neynarUser?.username ?? context?.user?.username}
                pfpUrl={neynarUser?.pfpUrl ?? context?.user?.pfpUrl}
                score={neynarUser?.score}
                loading={scoreLoading}
                fetchScore={fetchScore}
                hasScore={neynarUser !== null}
              />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

