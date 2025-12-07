"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useMemo, useEffect, useState } from "react";
import { CELO_REWARD_CONTRACT_ADDRESS, CELO_CHAIN_ID, DAILY_CLAIM_ABI } from "~/lib/constants";

/**
 * Hook for interacting with the Celo daily reward contract.
 * 
 * Provides functionality to:
 * - Check if user can claim (24 hours since last claim)
 * - Get last claim timestamp
 * - Get daily reward amount
 * - Claim daily reward
 * - Track transaction status
 */
export function useCeloReward() {
  const { address, isConnected, chainId } = useAccount();
  const [currentTimestamp, setCurrentTimestamp] = useState<bigint | null>(null);

  // Update current timestamp every second for countdown
  useEffect(() => {
    const updateTimestamp = () => {
      setCurrentTimestamp(BigInt(Math.floor(Date.now() / 1000)));
    };
    updateTimestamp();
    const interval = setInterval(updateTimestamp, 1000);
    return () => clearInterval(interval);
  }, []);

  // Read last claim time
  const { data: lastClaimTime, refetch: refetchLastClaimTime } = useReadContract({
    address: CELO_REWARD_CONTRACT_ADDRESS,
    abi: DAILY_CLAIM_ABI,
    functionName: "lastClaimTime",
    args: address ? [address] : undefined,
    chainId: CELO_CHAIN_ID,
    query: {
      enabled: isConnected && !!address && chainId === CELO_CHAIN_ID,
    },
  });

  // Read daily amount
  const { data: dailyAmount } = useReadContract({
    address: CELO_REWARD_CONTRACT_ADDRESS,
    abi: DAILY_CLAIM_ABI,
    functionName: "dailyAmount",
    chainId: CELO_CHAIN_ID,
    query: {
      enabled: true,
    },
  });

  // Calculate if user can claim
  const canClaim = useMemo(() => {
    if (!isConnected || !address || !currentTimestamp || !lastClaimTime || chainId !== CELO_CHAIN_ID) {
      return false;
    }

    // Contract requires: block.timestamp >= lastClaimTime + 1 days (86400 seconds)
    const oneDayInSeconds = BigInt(86400);
    const nextClaimTime = lastClaimTime + oneDayInSeconds;
    return currentTimestamp >= nextClaimTime;
  }, [isConnected, address, currentTimestamp, lastClaimTime, chainId]);

  // Calculate time until next claim
  const timeUntilNextClaim = useMemo(() => {
    if (!currentTimestamp || !lastClaimTime || canClaim) {
      return null;
    }

    const oneDayInSeconds = BigInt(86400);
    const nextClaimTime = lastClaimTime + oneDayInSeconds;
    const secondsRemaining = Number(nextClaimTime - currentTimestamp);

    if (secondsRemaining <= 0) {
      return null;
    }

    const hours = Math.floor(secondsRemaining / 3600);
    const minutes = Math.floor((secondsRemaining % 3600) / 60);
    const seconds = secondsRemaining % 60;

    return { hours, minutes, seconds, totalSeconds: secondsRemaining };
  }, [currentTimestamp, lastClaimTime, canClaim]);

  // Write contract for claiming
  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  // Wait for transaction receipt
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
    chainId: CELO_CHAIN_ID,
  });

  // Claim function
  const claim = () => {
    if (isWritePending) {
      return;
    }

    writeContract(
      {
        address: CELO_REWARD_CONTRACT_ADDRESS,
        abi: DAILY_CLAIM_ABI,
        functionName: "claim",
        chainId: CELO_CHAIN_ID,
      },
      {
        onSuccess: () => {
          // Refetch last claim time after successful transaction
          setTimeout(() => {
            refetchLastClaimTime();
          }, 2000);
        },
      }
    );
  };

  // Format CELO amount for display
  const rewardAmountDisplay = useMemo(() => {
    if (!dailyAmount) return null;
    // CELO has 18 decimals
    const amount = Number(dailyAmount) / 1e18;
    return amount.toFixed(4);
  }, [dailyAmount]);

  return {
    // Status
    isConnected,
    address,
    chainId,
    canClaim,
    lastClaimTime,
    timeUntilNextClaim,
    rewardAmount: dailyAmount,
    rewardAmountDisplay,

    // Actions
    claim,
    refetchLastClaimTime,

    // Transaction status
    hash,
    isPending: isWritePending || isConfirming,
    isSuccess: isConfirmed,
    error: writeError || receiptError,
  };
}


