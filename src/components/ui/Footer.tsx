import React from "react";
import { Tab } from "~/components/App";

interface FooterProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  showWallet?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ activeTab, setActiveTab, showWallet = false }) => {
  const tabButtonClass = (isActive: boolean) => 
    `flex flex-col items-center justify-center w-full h-full focus-ring rounded-lg transition-all duration-200 ${
      isActive 
        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' 
        : 'text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
    }`;

  return (
    <div className="fixed bottom-0 left-0 right-0 mx-4 mb-4 bg-white dark:bg-gray-800 border-2 border-primary-200 dark:border-primary-800 px-3 py-2.5 rounded-xl z-50 shadow-medium">
      <nav className="flex justify-around items-center h-14" role="tablist" aria-label="Main navigation">
        <button
          type="button"
          onClick={() => setActiveTab(Tab.Home)}
          role="tab"
          aria-selected={activeTab === Tab.Home}
          aria-label="Home tab"
          className={tabButtonClass(activeTab === Tab.Home)}
        >
          <span className="text-xl mb-0.5" aria-hidden="true">🏠</span>
          <span className="text-xs font-medium">Home</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(Tab.Actions)}
          role="tab"
          aria-selected={activeTab === Tab.Actions}
          aria-label="Actions tab"
          className={tabButtonClass(activeTab === Tab.Actions)}
        >
          <span className="text-xl mb-0.5" aria-hidden="true">⚡</span>
          <span className="text-xs font-medium">Actions</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(Tab.Context)}
          role="tab"
          aria-selected={activeTab === Tab.Context}
          aria-label="Context tab"
          className={tabButtonClass(activeTab === Tab.Context)}
        >
          <span className="text-xl mb-0.5" aria-hidden="true">📋</span>
          <span className="text-xs font-medium">Context</span>
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
            <span className="text-xl mb-0.5" aria-hidden="true">👛</span>
            <span className="text-xs font-medium">Wallet</span>
          </button>
        )}
      </nav>
    </div>
  );
};
