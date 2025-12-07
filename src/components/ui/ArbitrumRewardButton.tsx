"use client";

import { useDailyReward } from "~/hooks/useDailyReward";
import { useAccount, useSwitchChain } from "wagmi";
import { ARBITRUM_CHAIN_ID } from "~/lib/constants";
import { useEffect, useState } from "react";
import { Button } from "./Button";

/**
 * ArbitrumRewardButton component for claiming daily ARB rewards.
 * Handles wallet connection, chain switching, and claiming.
 */
export function ArbitrumRewardButton() {
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const {
    claim,
    isPending,
    isSuccess,
    error,
    canClaim,
    rewardAmountDisplay,
    timeUntilNextClaim,
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

  const getButtonText = () => {
    if (!isConnected) {
      return "Connect Wallet to Claim ARB";
    }
    if (needsChainSwitch) {
      return "Switch to Arbitrum";
    }
    if (isPending) {
      return "Claiming ARB...";
    }
    if (isSuccess) {
      return "ARB Claimed! ✓";
    }
    if (!canClaim && timeUntilNextClaim) {
      const { hours, minutes } = timeUntilNextClaim;
      return `Claim ARB (${hours}h ${minutes}m)`;
    }
    return `Claim ${rewardAmountDisplay || 'ARB'}`;
  };

  const isButtonDisabled = () => {
    if (!isConnected) return false; // Allow connecting
    if (needsChainSwitch) return false; // Allow switching
    if (isPending) return true;
    if (!canClaim && !needsChainSwitch) return true;
    return false;
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleClaim}
        disabled={isButtonDisabled()}
        className="w-full"
        variant={isSuccess ? "secondary" : "primary"}
      >
        {getButtonText()}
      </Button>
      {error && (
        <div className="text-xs text-red-500 text-center">
          {error instanceof Error ? error.message : "Transaction failed"}
        </div>
      )}
      {rewardAmountDisplay && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Daily reward: {rewardAmountDisplay} ARB
        </div>
      )}
    </div>
  );
}

