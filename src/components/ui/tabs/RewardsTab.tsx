"use client";

import { useAccount, useConnect, useSwitchChain } from "wagmi";
import { Button } from "../Button";
import {
  BASE_DEGEN_DAILY_CLAIM_CHAIN_ID,
  BASE_DEGEN_DAILY_CLAIM_CONTRACT_ADDRESS,
  BASE_DEGEN_DAILY_CLAIM_TOKEN_SYMBOL,
  CELO_REWARD_CONTRACT_ADDRESS,
  CELO_CHAIN_ID,
} from "~/lib/constants";
import { useDailyClaimReward } from "~/hooks/useDailyClaimReward";
import { useCeloReward } from "~/hooks/useCeloReward";

/**
 * RewardsTab shows both Base DailyClaim (DEGEN) and Celo reward contract balances
 * and lets eligible users claim their daily rewards.
 */
export function RewardsTab() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  // Degen reward hook
  const {
    contractBalance: degenContractBalance,
    contractBalanceDisplay: degenContractBalanceDisplay,
    canClaim: canClaimDegen,
    timeUntilNextClaim: degenTimeUntilNextClaim,
    claim: claimDegen,
    isPending: isDegenPending,
    isSuccess: isDegenSuccess,
    error: degenError,
  } = useDailyClaimReward();

  // Celo reward hook
  const {
    contractBalance: celoContractBalance,
    contractBalanceDisplay: celoContractBalanceDisplay,
    canClaim: canClaimCelo,
    timeUntilNextClaim: celoTimeUntilNextClaim,
    claim: claimCelo,
    isPending: isCeloPending,
    isSuccess: isCeloSuccess,
    error: celoError,
  } = useCeloReward();

  // Check if reward pools are empty
  const isDegenPoolEmpty = degenContractBalance !== undefined && degenContractBalance !== null && degenContractBalance === 0n;
  // Celo balance may not be available - always treat as unknown
  const isCeloPoolEmpty = false; // Don't check Celo pool balance as it may not be available

  const isOnDegenChain = chainId === BASE_DEGEN_DAILY_CLAIM_CHAIN_ID;
  const isOnCeloChain = chainId === CELO_CHAIN_ID;

  const handleDegenAction = () => {
    if (!isConnected) {
      const connectorToUse = connectors[0] || connectors[1] || connectors[2];
      if (connectorToUse) {
        connect({ connector: connectorToUse });
      }
      return;
    }

    if (!isOnDegenChain) {
      switchChain({ chainId: BASE_DEGEN_DAILY_CLAIM_CHAIN_ID });
      return;
    }

    claimDegen();
  };

  const handleCeloAction = () => {
    if (!isConnected) {
      const connectorToUse = connectors[0] || connectors[1] || connectors[2];
      if (connectorToUse) {
        connect({ connector: connectorToUse });
      }
      return;
    }

    if (!isOnCeloChain) {
      switchChain({ chainId: CELO_CHAIN_ID });
      return;
    }

    claimCelo();
  };

  const getDegenButtonText = () => {
    if (isDegenPoolEmpty) {
      return "Pool Empty";
    }
    if (!isConnected) {
      return "Connect Wallet";
    }
    if (!isOnDegenChain) {
      return "Switch to Base";
    }
    if (isDegenPending) {
      return "Claiming...";
    }
    if (isDegenSuccess) {
      return "Claimed ✓";
    }
    if (!canClaimDegen && degenTimeUntilNextClaim) {
      const { hours, minutes } = degenTimeUntilNextClaim;
      return `${hours}h ${minutes}m`;
    }
    return "Claim $DEGEN";
  };

  const getCeloButtonText = () => {
    // Don't check pool empty for Celo as balance may not be available
    if (!isConnected) {
      return "Connect Wallet";
    }
    if (!isOnCeloChain) {
      return "Switch to Celo";
    }
    if (isCeloPending) {
      return "Claiming...";
    }
    if (isCeloSuccess) {
      return "Claimed ✓";
    }
    if (!canClaimCelo && celoTimeUntilNextClaim) {
      const { hours, minutes } = celoTimeUntilNextClaim;
      return `${hours}h ${minutes}m`;
    }
    return "Claim $CELO";
  };

  const isDegenButtonDisabled = () => {
    if (isDegenPoolEmpty) return true;
    if (!isConnected) return false;
    if (!isOnDegenChain) return isSwitchingChain;
    if (isDegenPending) return true;
    if (isConnected && isOnDegenChain && canClaimDegen === false) return true;
    return false;
  };

  const isCeloButtonDisabled = () => {
    // Don't check pool empty for Celo as balance may not be available
    if (!isConnected) return false;
    if (!isOnCeloChain) return isSwitchingChain;
    if (isCeloPending) return true;
    if (isConnected && isOnCeloChain && canClaimCelo === false) return true;
    return false;
  };

  const degenExplorerUrl = `https://basescan.org/address/${BASE_DEGEN_DAILY_CLAIM_CONTRACT_ADDRESS}`;
  const celoExplorerUrl = `https://celoscan.io/address/${CELO_REWARD_CONTRACT_ADDRESS}`;

  return (
    <div className="relative flex items-start justify-center px-1 py-4">
      <div className="w-full max-w-md space-y-3">
        {/* Title */}
        <div className="text-center mb-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Rewards Pool
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Claim your daily rewards on Base and Celo
          </p>
        </div>

        {/* Celo Reward Section */}
        <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                $CELO
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">Celo</span>
            </div>

            <div className="rounded-xl bg-gray-50/90 p-3 text-sm text-gray-800 dark:bg-gray-900/80 dark:text-gray-100 border border-gray-200/70 dark:border-gray-700">
              <div className="flex flex-col items-center text-center space-y-1">
                <div className="text-2xl font-extrabold">
                  N/A
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Balance unavailable
                </span>
              </div>
            </div>

            {celoError && (
              <div className="rounded-lg bg-red-50 p-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {celoError instanceof Error ? celoError.message : "Transaction failed"}
              </div>
            )}

            <Button
              onClick={handleCeloAction}
              disabled={isCeloButtonDisabled()}
              isLoading={isCeloPending || (isSwitchingChain && !isOnCeloChain)}
              className="!from-yellow-500 !to-yellow-500 hover:!from-yellow-600 hover:!to-yellow-600 !text-white !border-0 focus:!ring-yellow-400 dark:!from-yellow-600 dark:!to-yellow-600 dark:hover:!from-yellow-700 dark:hover:!to-yellow-700"
            >
              {getCeloButtonText()}
            </Button>
          </div>
        </div>

        {/* Degen Reward Section */}
        <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                $DEGEN
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">Base</span>
            </div>

            <div className="rounded-xl bg-gray-50/90 p-3 text-sm text-gray-800 dark:bg-gray-900/80 dark:text-gray-100 border border-gray-200/70 dark:border-gray-700">
              <div className="flex flex-col items-center text-center space-y-1">
                <div className="text-2xl font-extrabold">
                  {degenContractBalanceDisplay
                    ? `${degenContractBalanceDisplay}`
                    : "Loading..."}
                </div>
              </div>
            </div>

            {isDegenPoolEmpty && (
              <div className="rounded-lg bg-amber-50 p-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 text-center">
                ⚠️ Pool empty
              </div>
            )}

            {degenError && (
              <div className="rounded-lg bg-red-50 p-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {degenError instanceof Error ? degenError.message : "Transaction failed"}
              </div>
            )}

            <Button
              onClick={handleDegenAction}
              disabled={isDegenButtonDisabled()}
              isLoading={isDegenPending || (isSwitchingChain && !isOnDegenChain)}
              className="!from-purple-500 !to-purple-500 hover:!from-purple-600 hover:!to-purple-600 !text-white !border-0 focus:!ring-purple-400 dark:!from-purple-600 dark:!to-purple-600 dark:hover:!from-purple-700 dark:hover:!to-purple-700"
            >
              {getDegenButtonText()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}



