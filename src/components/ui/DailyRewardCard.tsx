"use client";

import { useDailyReward } from "~/hooks/useDailyReward";
import { Button } from "./Button";
import { useAccount, useSwitchChain } from "wagmi";
import { ARBITRUM_CHAIN_ID } from "~/lib/constants";
import { truncateAddress } from "~/lib/truncateAddress";
import { useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";

/**
 * DailyRewardCard component displays daily reward claim functionality.
 * 
 * Users can claim rewards by calling the contract's claim() function.
 * The component handles wallet connection, chain switching, and transaction status.
 */
export function DailyRewardCard() {
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { actions } = useMiniApp();
  const {
    claim,
    hash,
    isPending,
    isSuccess,
    error,
  } = useDailyReward();

  const [needsChainSwitch, setNeedsChainSwitch] = useState(false);

  // Check if user needs to switch to Arbitrum
  useEffect(() => {
    if (isConnected && chainId && chainId !== ARBITRUM_CHAIN_ID) {
      setNeedsChainSwitch(true);
    } else {
      setNeedsChainSwitch(false);
    }
  }, [isConnected, chainId]);

  const handleClaim = () => {
    if (needsChainSwitch) {
      switchChain({ chainId: ARBITRUM_CHAIN_ID });
      return;
    }
    claim();
  };

  const handleOpenSisterApp = () => {
    if (actions?.openUrl) {
      actions.openUrl('https://farcaster.xyz/miniapps/CxzrOOFoUDV7/neynar-score');
    }
  };

  const handleOpenImproveApp = () => {
    if (actions?.openUrl) {
      actions.openUrl('https://farcaster.xyz/miniapps/g-g7n6Jhbugh/improve-neynar-score');
    }
  };

  const getButtonText = () => {
    if (!isConnected) {
      return "Connect Wallet";
    }
    if (needsChainSwitch) {
      return "Switch to Arbitrum";
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
    if (!isConnected) return false; // Allow connecting
    if (needsChainSwitch) return false; // Allow switching
    if (isPending) return true;
    return false;
  };

  const arbiscanUrl = hash ? `https://arbiscan.io/tx/${hash}` : null;

  return (
    <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
      <div className="space-y-4">
        <div className="space-y-1 text-center">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Daily Reward Claim
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Claim your daily reward once per day
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleClaim}
            disabled={isButtonDisabled()}
            isLoading={isPending}
            variant={isSuccess ? "primary" : "secondary"}
            size="md"
            className="w-full"
          >
            {getButtonText()}
          </Button>

          <Button
            onClick={handleOpenSisterApp}
            disabled={!actions?.openUrl}
            variant="secondary"
            size="md"
            className="w-full"
          >
            Claim in Sister App
          </Button>

          <Button
            onClick={handleOpenImproveApp}
            disabled={!actions?.openUrl}
            variant="primary"
            size="md"
            className="w-full"
          >
            Improve Neynar Score
          </Button>

          {error && (
            <p className="text-xs text-error text-center">
              {error instanceof Error ? error.message : "Transaction failed"}
            </p>
          )}

          {hash && arbiscanUrl && (
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
              <div className="text-center">
                <a
                  href={arbiscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View on Arbiscan: {truncateAddress(hash)}
                </a>
              </div>
              {isPending && (
                <p className="text-center text-gray-500">Confirming transaction...</p>
              )}
              {isSuccess && (
                <p className="text-center text-green-600 dark:text-green-400">
                  Reward claimed successfully!
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

