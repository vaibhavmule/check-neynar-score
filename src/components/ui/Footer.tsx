import React from "react";
import { Tab } from "~/components/App";

interface FooterProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  showWallet?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ activeTab, setActiveTab, showWallet = false }) => {
  const tabButtonClass = (isActive: boolean) =>
    `flex h-full w-full flex-col items-center justify-center rounded-xl px-3 py-2 text-[11px] font-semibold uppercase tracking-wide transition-all focus-ring ${
      isActive
        ? 'bg-primary-100/70 text-primary-700 shadow-soft dark:bg-primary-900/30 dark:text-primary-200'
        : 'text-gray-500 hover:bg-white/70 hover:text-primary-600 dark:text-gray-400 dark:hover:bg-gray-800/70 dark:hover:text-primary-200'
    }`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 mx-4 mb-4 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-glow backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
      <nav className="flex h-14 items-center justify-around" role="tablist" aria-label="Main navigation">
        <button
          type="button"
          onClick={() => setActiveTab(Tab.Home)}
          role="tab"
          aria-selected={activeTab === Tab.Home}
          aria-label="Home tab"
          className={tabButtonClass(activeTab === Tab.Home)}
        >
          <span className="text-lg" aria-hidden="true">🏡</span>
          <span>Home</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(Tab.WhatIsNeynarScore)}
          role="tab"
          aria-selected={activeTab === Tab.WhatIsNeynarScore}
          aria-label="What is Neynar Score tab"
          className={tabButtonClass(activeTab === Tab.WhatIsNeynarScore)}
        >
          <span className="text-lg" aria-hidden="true">📚</span>
          <span>About</span>
        </button>
        {showWallet && (
          <button
            type="button"
            onClick={() => setActiveTab(Tab.Wallet)}
            role="tab"
            aria-selected={activeTab === Tab.Wallet}
            aria-label="Wallet tab"
            className={tabButtonClass(activeTab === Tab.Wallet)}
          >
            <span className="text-lg" aria-hidden="true">👛</span>
            <span>Wallet</span>
          </button>
        )}
      </nav>
    </div>
  );
};
