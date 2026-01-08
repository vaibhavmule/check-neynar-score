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

  // Read contract CELO balance
  // Note: Celo contract may not support getContractBalance, so this may always fail
  const { data: contractBalance, refetch: refetchContractBalance } = useReadContract({
    address: CELO_REWARD_CONTRACT_ADDRESS,
    abi: DAILY_CLAIM_ABI,
    functionName: "getContractBalance",
    chainId: CELO_CHAIN_ID,
    query: {
      enabled: false, // Disabled - Celo contract may not support balance checking
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
    // Need timestamp and lastClaimTime to calculate
    if (!currentTimestamp || lastClaimTime === undefined || lastClaimTime === null) {
      return null;
    }

    // If user can claim, no countdown needed
    if (canClaim) {
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
          // Refetch last claim time and contract balance after successful transaction
          setTimeout(() => {
            refetchLastClaimTime();
            refetchContractBalance();
          }, 2000);
        },
      }
    );
  };

  // Formatting helpers (CELO has 18 decimals)
  const formatAmount = (value?: bigint | null) => {
    if (!value) return null;
    const amount = Number(value) / 1e18;
    return amount.toFixed(4);
  };

  const rewardAmountDisplay = useMemo(
    () => (dailyAmount ? formatAmount(dailyAmount as bigint) : null),
    [dailyAmount]
  );

  const contractBalanceDisplay = useMemo(
    () => (contractBalance ? formatAmount(contractBalance as bigint) : null),
    [contractBalance]
  );

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
    contractBalance,
    contractBalanceDisplay,

    // Actions
    claim,
    refetchLastClaimTime,
    refetchContractBalance,

    // Transaction status
    hash,
    isPending: isWritePending || isConfirming,
    isSuccess: isConfirmed,
    error: writeError || receiptError,
  };
}


