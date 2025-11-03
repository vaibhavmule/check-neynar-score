"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useMiniApp } from "@neynar/react";
import { sdk } from "@farcaster/miniapp-sdk";
import { Header } from "~/components/ui/Header";
import { Footer } from "~/components/ui/Footer";
import { HomeTab, WhatIsNeynarScoreTab, WalletTab } from "~/components/ui/tabs";
import { AddAppPrompt } from "~/components/ui/AddAppPrompt";
import { USE_WALLET } from "~/lib/constants";
import { useNeynarUser } from "../hooks/useNeynarUser";

// --- Types ---
export enum Tab {
  Home = "home",
  WhatIsNeynarScore = "what-is-neynar-score",
  Wallet = "wallet",
}

export interface AppProps {
  title?: string;
}

/**
 * App component serves as the main container for the mini app interface.
 * 
 * This component orchestrates the overall mini app experience by:
 * - Managing tab navigation and state
 * - Handling Farcaster mini app initialization
 * - Coordinating wallet and context state
 * - Providing error handling and loading states
 * - Rendering the appropriate tab content based on user selection
 * 
 * The component integrates with the Neynar SDK for Farcaster functionality
 * and Wagmi for wallet management. It provides a complete mini app
 * experience with multiple tabs for different functionality areas.
 * 
 * Features:
 * - Tab-based navigation (Home, Actions, Context, Wallet)
 * - Farcaster mini app integration
 * - Wallet connection management
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
  { title }: AppProps = { title: "Neynar Starter Kit" }
) {
  // --- Hooks ---
  const {
    isSDKLoaded,
    context,
    setInitialTab,
    setActiveTab,
    currentTab,
  } = useMiniApp();
  const searchParams = useSearchParams();

  // --- Neynar user hook ---
  const {
    user: neynarUser,
    fetchScore,
    loading: scoreLoading,
    isFollowing,
    isCheckingFollow,
    checkFollowStatus,
  } = useNeynarUser(context || undefined);

  // --- Effects ---
  /**
   * Sets the initial tab to "home" and signals readiness when the SDK is loaded.
   * 
   * This effect ensures that users start on the home tab when they first
   * load the mini app. It also calls sdk.actions.ready() to signal that
   * the app is ready to be displayed, which dismisses the splash screen.
   */
  useEffect(() => {
    if (isSDKLoaded) {
      // Support deep links via URL params
      const hasScoreFlag = searchParams?.has("score");
      const tabParam = searchParams?.get("tab");
      if (hasScoreFlag || tabParam === "score" || tabParam === "what-is-neynar-score") {
        setInitialTab(Tab.WhatIsNeynarScore);
      } else if (tabParam === "wallet") {
        setInitialTab(Tab.Wallet);
      } else {
        setInitialTab(Tab.Home);
      }
      // Signal that the app is ready to be displayed
      sdk.actions.ready();
    }
  }, [isSDKLoaded, setInitialTab, searchParams]);

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
        style={{
          paddingTop: context?.client.safeAreaInsets?.top ?? 0,
          paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
          paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
          paddingRight: context?.client.safeAreaInsets?.right ?? 0,
        }}
      >
        {/* Header should be full width */}
        <Header neynarUser={neynarUser} />

      {/* Main content and footer should be centered */}
      <div className="container py-4 pb-24">

        {/* Tab content rendering */}
        {currentTab === Tab.Home && (
          <HomeTab
            fid={context?.user?.fid}
            username={context?.user?.username}
            pfpUrl={context?.user?.pfpUrl}
            score={neynarUser?.score}
            loading={scoreLoading}
            fetchScore={fetchScore}
            hasScore={neynarUser !== null}
            isFollowing={isFollowing}
            isCheckingFollow={isCheckingFollow}
            checkFollowStatus={checkFollowStatus}
          />
        )}
        {currentTab === Tab.WhatIsNeynarScore && <WhatIsNeynarScoreTab />}
        {currentTab === Tab.Wallet && <WalletTab />}

        {/* Footer with navigation */}
        <Footer activeTab={currentTab as Tab} setActiveTab={setActiveTab} showWallet={USE_WALLET} />
      </div>
    </div>
    </>
  );
}

