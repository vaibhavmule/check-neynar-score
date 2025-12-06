"use client";

import { useMiniApp } from "@neynar/react";
import { sdk } from "@farcaster/miniapp-sdk";

export type TabType = "score" | "improve" | "tip";

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

/**
 * BottomNav component provides mobile-optimized bottom tab navigation.
 * 
 * Features:
 * - 3 tabs: Score, Improve, Tip
 * - Haptic feedback on tab switch
 * - Safe area inset support
 * - Minimum 44x44px touch targets
 * - Fixed position with backdrop blur
 */
export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { context } = useMiniApp();

  const handleTabClick = async (tab: TabType) => {
    if (tab === activeTab) return;

    // Trigger haptic feedback
    try {
      const capabilities = await sdk.getCapabilities();
      if (capabilities.includes("haptics.selectionChanged")) {
        await sdk.haptics.selectionChanged();
      }
    } catch (error) {
      // Haptics not available, continue anyway
      console.debug("Haptics not available:", error);
    }

    onTabChange(tab);
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "score", label: "Score", icon: "📊" },
    { id: "improve", label: "Improve", icon: "📈" },
    { id: "tip", label: "Tip", icon: "💝" },
  ];

  const bottomInset = context?.client.safeAreaInsets?.bottom ?? 0;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/20 bg-white/80 backdrop-blur-lg dark:border-white/10 dark:bg-gray-900/80"
      style={{
        paddingBottom: Math.max(bottomInset, 8),
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 transition-all ${
                isActive
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="text-xl" aria-hidden="true">
                {tab.icon}
              </span>
              <span
                className={`text-xs font-medium ${
                  isActive ? "opacity-100" : "opacity-70"
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-primary-600 dark:bg-primary-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
