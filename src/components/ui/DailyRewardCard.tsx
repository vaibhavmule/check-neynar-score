"use client";

import { useDailyReward } from "~/hooks/useDailyReward";
import { Button } from "./Button";
import { useAccount, useSwitchChain } from "wagmi";
import { ARBITRUM_CHAIN_ID, REWARD_CONTRACT_ADDRESS } from "~/lib/constants";
import { truncateAddress } from "~/lib/truncateAddress";
import { useEffect, useState } from "react";

/**
 * DailyRewardCard component displays daily reward claim functionality.
 * 
 * Users can claim rewards once per day by calling the contract's claim() function.
 * The component handles wallet connection, chain switching, and transaction status.
 */
export function DailyRewardCard() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const {
    canClaim,
    timeUntilNextClaim,
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

  const formatTimeRemaining = () => {
    if (!timeUntilNextClaim) return null;
    const { hours, minutes, seconds } = timeUntilNextClaim;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
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
    if (canClaim) {
      return "Claim";
    }
    if (timeUntilNextClaim) {
      return `Next claim in ${formatTimeRemaining()}`;
    }
    return "Check Claim Status";
  };

  const isButtonDisabled = () => {
    if (!isConnected) return false; // Allow connecting
    if (needsChainSwitch) return false; // Allow switching
    if (isPending) return true;
    if (isSuccess) return true;
    return !canClaim;
  };

  const arbiscanUrl = hash
    ? `https://arbiscan.io/tx/${hash}`
    : `https://arbiscan.io/address/${REWARD_CONTRACT_ADDRESS}`;

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

          {error && (
            <p className="text-xs text-error text-center">
              {error instanceof Error ? error.message : "Transaction failed"}
            </p>
          )}

          {hash && (
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

          {!hash && isConnected && !needsChainSwitch && (
            <div className="text-center">
              <a
                href={arbiscanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                View Contract on Arbiscan
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

