"use client";

import { useCeloReward } from "~/hooks/useCeloReward";
import { useAccount, useSwitchChain } from "wagmi";
import { CELO_CHAIN_ID } from "~/lib/constants";
import { useEffect, useState } from "react";
import { Button } from "./Button";

/**
 * CeloRewardButton component for claiming daily Celo rewards.
 * Handles wallet connection, chain switching, and claiming.
 */
export function CeloRewardButton() {
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
  } = useCeloReward();

  const [needsChainSwitch, setNeedsChainSwitch] = useState(false);

  // Check if user needs to switch to Celo
  useEffect(() => {
    if (isConnected && chainId && chainId !== CELO_CHAIN_ID) {
      setNeedsChainSwitch(true);
    } else {
      setNeedsChainSwitch(false);
    }
  }, [isConnected, chainId]);

  const handleClaim = () => {
    if (needsChainSwitch) {
      switchChain({ chainId: CELO_CHAIN_ID });
      return;
    }
    claim();
  };

  const getButtonText = () => {
    if (!isConnected) {
      return "Connect Wallet to Claim CELO";
    }
    if (needsChainSwitch) {
      return "Switch to Celo";
    }
    if (isPending) {
      return "Claiming CELO...";
    }
    if (isSuccess) {
      return "CELO Claimed! ✓";
    }
    if (!canClaim && timeUntilNextClaim) {
      const { hours, minutes } = timeUntilNextClaim;
      return `Claim CELO (${hours}h ${minutes}m)`;
    }
    return `Claim ${rewardAmountDisplay || 'CELO'}`;
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
          Daily reward: {rewardAmountDisplay} CELO
        </div>
      )}
    </div>
  );
}

