"use client";

import { useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { sdk } from "@farcaster/miniapp-sdk";
import { BottomNav, type TabType } from "~/components/ui/BottomNav";
import { ScoreTab, ImproveTab } from "~/components/ui/tabs";
import { AddAppPrompt } from "~/components/ui/AddAppPrompt";
import { CeloRewardModal } from "~/components/ui/CeloRewardModal";
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
 * - Managing bottom tab navigation
 * - Providing error handling and loading states
 * - Integrating haptic feedback and back navigation
 * 
 * The component integrates with the Neynar SDK for Farcaster functionality.
 * It provides a mobile-first experience with score as default view and tabs for additional content.
 * 
 * Features:
 * - Bottom tab navigation (Score, Improve) with Tip button
 * - Farcaster mini app integration
 * - Haptic feedback for mobile interactions
 * - Back navigation support
 * - Score fetching for connected users or by FID input
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
  // --- State ---
  const [activeTab, setActiveTab] = useState<TabType>("score");

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
    error: scoreError,
  } = useNeynarUser(context || undefined);

  // --- Effects ---
  /**
   * Auto-fetch score when SDK is loaded and user FID is available.
   */
  useEffect(() => {
    if (!isSDKLoaded || !context?.user?.fid || neynarUser !== null || scoreLoading) {
      return;
    }

    void fetchScore();
  }, [isSDKLoaded, context?.user?.fid, neynarUser, scoreLoading, fetchScore]);
  /**
   * Signals readiness when the SDK is loaded.
   * 
   * This effect calls sdk.actions.ready() to signal that
   * the app is ready to be displayed, which dismisses the splash screen.
   */
  useEffect(() => {
    if (!isSDKLoaded) {
      return;
    }

    let cancelled = false;
    const signalReady = async () => {
      try {
        await sdk.actions.ready();
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to signal mini app readiness", error);
        }
      }
    };

    // Defer to the next animation frame to give the layout time to mount
    const raf = window.requestAnimationFrame(() => {
      void signalReady();
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
    };
  }, [isSDKLoaded]);

  /**
   * Enable back navigation integration with Farcaster SDK.
   * This provides native back button/gesture support.
   */
  useEffect(() => {
    if (!isSDKLoaded) {
      return;
    }

    let cancelled = false;
    const enableBackNav = async () => {
      try {
        const capabilities = await sdk.getCapabilities();
        if (capabilities.includes("back")) {
          await sdk.back.enableWebNavigation();
        }
      } catch (error) {
        if (!cancelled) {
          console.debug("Back navigation not available:", error);
        }
      }
    };

    enableBackNav();

    return () => {
      cancelled = true;
    };
  }, [isSDKLoaded]);

  /**
   * Trigger haptic feedback when score is successfully loaded.
   */
  useEffect(() => {
    if (!isSDKLoaded || !neynarUser || neynarUser.score === null || scoreLoading) {
      return;
    }

    let cancelled = false;
    const triggerSuccessHaptic = async () => {
      try {
        const capabilities = await sdk.getCapabilities();
        if (capabilities.includes("haptics.notificationOccurred")) {
          await sdk.haptics.notificationOccurred("success");
        }
      } catch (error) {
        if (!cancelled) {
          console.debug("Haptics not available:", error);
        }
      }
    };

    // Small delay to ensure state is settled
    const timeout = setTimeout(triggerSuccessHaptic, 100);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [isSDKLoaded, neynarUser, scoreLoading]);

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
      {/* Celo reward popup - shows on first visit */}
      <CeloRewardModal />

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
          {/* Main content area */}
          <main className="flex-1 pb-20">
            <div className="container py-5">
              {/* Tab Content Section */}
              <div className="min-h-[200px]">
                {activeTab === "score" && (
                  <ScoreTab
                    fid={neynarUser?.fid ?? context?.user?.fid}
                    username={neynarUser?.username ?? context?.user?.username}
                    pfpUrl={neynarUser?.pfpUrl ?? context?.user?.pfpUrl}
                    score={neynarUser?.score}
                    loading={scoreLoading}
                    error={scoreError}
                  />
                )}
                {activeTab === "improve" && <ImproveTab />}
              </div>
            </div>
          </main>

          {/* Bottom Navigation */}
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
    </>
  );
}

