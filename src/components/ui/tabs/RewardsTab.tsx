"use client";

import { useAccount, useConnect, useSwitchChain } from "wagmi";
import { Button } from "../Button";
import {
  BASE_DEGEN_DAILY_CLAIM_CHAIN_ID,
  BASE_DEGEN_DAILY_CLAIM_CONTRACT_ADDRESS,
  BASE_DEGEN_DAILY_CLAIM_TOKEN_SYMBOL,
} from "~/lib/constants";
import { useDailyClaimReward } from "~/hooks/useDailyClaimReward";

/**
 * RewardsTab shows the Base DailyClaim contract balance and lets
 * eligible users claim their daily DEGEN reward.
 */
export function RewardsTab() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  const {
    contractBalanceDisplay,
    dailyAmountDisplay,
    canClaim,
    timeUntilNextClaim,
    claim,
    isPending,
    isSuccess,
    error,
  } = useDailyClaimReward();

  const isOnCorrectChain = chainId === BASE_DEGEN_DAILY_CLAIM_CHAIN_ID;

  const handlePrimaryAction = () => {
    if (!isConnected) {
      const connectorToUse = connectors[0] || connectors[1] || connectors[2];
      if (connectorToUse) {
        connect({ connector: connectorToUse });
      }
      return;
    }

    if (!isOnCorrectChain) {
      switchChain({ chainId: BASE_DEGEN_DAILY_CLAIM_CHAIN_ID });
      return;
    }

    claim();
  };

  const getButtonText = () => {
    if (!isConnected) {
      return "Connect Wallet to Claim";
    }
    if (!isOnCorrectChain) {
      return "Switch to Base";
    }
    if (isPending) {
      return "Claiming DEGEN...";
    }
    if (isSuccess) {
      return "Claimed! ✓";
    }
    if (!canClaim && timeUntilNextClaim) {
      const { hours, minutes } = timeUntilNextClaim;
      return `Next claim in ${hours}h ${minutes}m`;
    }
    return "Claim";
  };

  const isButtonDisabled = () => {
    // Allow connecting wallet
    if (!isConnected) return false;
    // Allow switching chain (only disable if switching is in progress)
    if (!isOnCorrectChain) return isSwitchingChain;
    // Disable while transaction is pending
    if (isPending) return true;
    // Disable if not eligible (but allow if we don't know yet - let contract handle it)
    if (isConnected && isOnCorrectChain && canClaim === false) return true;
    return false;
  };

  const explorerUrl = `https://basescan.org/address/${BASE_DEGEN_DAILY_CLAIM_CONTRACT_ADDRESS}`;

  return (
    <div className="relative flex items-start justify-center px-1 py-4">
      <div className="w-full max-w-md space-y-4">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
          <div className="space-y-4">
            <div className="space-y-1 text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Rewards
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Claim your daily {BASE_DEGEN_DAILY_CLAIM_TOKEN_SYMBOL} reward on Base.
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50/90 p-4 text-sm text-gray-800 dark:bg-gray-900/80 dark:text-gray-100 border border-gray-200/70 dark:border-gray-700">
              <div className="flex flex-col items-center text-center space-y-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Degen Reward Pool
                </span>
                <div className="text-3xl font-extrabold">
                  {contractBalanceDisplay
                    ? `${contractBalanceDisplay} ${BASE_DEGEN_DAILY_CLAIM_TOKEN_SYMBOL}`
                    : "Loading..."}
                </div>
                <span className="text-[11px] text-gray-600 dark:text-gray-400">
                  Total DEGEN available to claim
                </span>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error instanceof Error ? error.message : "Transaction failed"}
              </div>
            )}

            <Button
              onClick={handlePrimaryAction}
              disabled={isButtonDisabled()}
              isLoading={isPending || isSwitchingChain}
              className="w-full"
            >
              {getButtonText()}
            </Button>

            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              <a
                href={explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-primary-600 dark:hover:text-primary-400"
              >
                View contract on BaseScan
              </a>
              {address && (
                <div className="mt-1">
                  Connected wallet:{" "}
                  <span className="font-mono text-[11px] opacity-80">
                    {address}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


