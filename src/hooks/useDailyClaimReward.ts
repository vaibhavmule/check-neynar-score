'use client';

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { useEffect, useMemo, useState } from 'react';
import {
  BASE_DEGEN_DAILY_CLAIM_CHAIN_ID,
  BASE_DEGEN_DAILY_CLAIM_CONTRACT_ADDRESS,
  DAILY_CLAIM_ABI,
} from '~/lib/constants';

/**
 * Hook for interacting with the Base DailyClaim reward contract.
 *
 * Provides functionality to:
 * - Read contract balance (DEGEN balance)
 * - Read daily claim amount
 * - Check when the user can next claim (24h cooldown)
 * - Trigger the claim transaction
 * - Track transaction status
 */
export function useDailyClaimReward() {
  const { address, isConnected, chainId } = useAccount();
  const [currentTimestamp, setCurrentTimestamp] = useState<bigint | null>(null);

  // Keep a local clock for countdown UX
  useEffect(() => {
    const updateTimestamp = () => {
      setCurrentTimestamp(BigInt(Math.floor(Date.now() / 1000)));
    };
    updateTimestamp();
    const interval = setInterval(updateTimestamp, 1000);
    return () => clearInterval(interval);
  }, []);

  // Read last claim time for the connected address
  const {
    data: lastClaimTime,
    refetch: refetchLastClaimTime,
  } = useReadContract({
    address: BASE_DEGEN_DAILY_CLAIM_CONTRACT_ADDRESS,
    abi: DAILY_CLAIM_ABI,
    functionName: 'lastClaimTime',
    args: address ? [address] : undefined,
    chainId: BASE_DEGEN_DAILY_CLAIM_CHAIN_ID,
    query: {
      enabled:
        isConnected &&
        !!address &&
        chainId === BASE_DEGEN_DAILY_CLAIM_CHAIN_ID,
    },
  });

  // Read eligibility directly from contract (handles first-time users correctly)
  const { data: isEligible, refetch: refetchIsEligible } = useReadContract({
    address: BASE_DEGEN_DAILY_CLAIM_CONTRACT_ADDRESS,
    abi: DAILY_CLAIM_ABI,
    functionName: 'isEligibleForClaim',
    args: address ? [address] : undefined,
    chainId: BASE_DEGEN_DAILY_CLAIM_CHAIN_ID,
    query: {
      enabled:
        isConnected &&
        !!address &&
        chainId === BASE_DEGEN_DAILY_CLAIM_CHAIN_ID,
    },
  });

  // Read daily claim amount
  const { data: dailyClaimAmount } = useReadContract({
    address: BASE_DEGEN_DAILY_CLAIM_CONTRACT_ADDRESS,
    abi: DAILY_CLAIM_ABI,
    functionName: 'dailyClaimAmount',
    chainId: BASE_DEGEN_DAILY_CLAIM_CHAIN_ID,
    query: {
      enabled: true,
    },
  });

  // Read contract DEGEN balance
  const { data: contractBalance, refetch: refetchContractBalance } =
    useReadContract({
      address: BASE_DEGEN_DAILY_CLAIM_CONTRACT_ADDRESS,
      abi: DAILY_CLAIM_ABI,
      functionName: 'getContractBalance',
      chainId: BASE_DEGEN_DAILY_CLAIM_CHAIN_ID,
      query: {
        enabled: true,
      },
    });

  // Use contract's isEligibleForClaim result (handles first-time users where lastClaimTime = 0)
  const canClaim = useMemo(() => {
    if (
      !isConnected ||
      !address ||
      chainId !== BASE_DEGEN_DAILY_CLAIM_CHAIN_ID
    ) {
      return false;
    }
    // Contract returns true for first-time users (lastClaimTime = 0)
    return isEligible === true;
  }, [isConnected, address, chainId, isEligible]);

  // Derived: time until the next claim window
  const timeUntilNextClaim = useMemo(() => {
    // If eligible, no countdown needed
    if (canClaim) {
      return null;
    }

    // Need timestamp and lastClaimTime to calculate
    if (!currentTimestamp || lastClaimTime === undefined || lastClaimTime === null) {
      return null;
    }

    // For first-time users (lastClaimTime = 0), they're eligible, so no countdown
    if (lastClaimTime === 0n) {
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

  // Write / claim
  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
    chainId: BASE_DEGEN_DAILY_CLAIM_CHAIN_ID,
  });

  const claim = () => {
    if (isWritePending) return;

    writeContract(
      {
        address: BASE_DEGEN_DAILY_CLAIM_CONTRACT_ADDRESS,
        abi: DAILY_CLAIM_ABI,
        functionName: 'claim',
        chainId: BASE_DEGEN_DAILY_CLAIM_CHAIN_ID,
      },
      {
        onSuccess: () => {
          // Refresh timings and balances shortly after a successful tx
          setTimeout(() => {
            refetchLastClaimTime();
            refetchIsEligible();
            refetchContractBalance();
          }, 2000);
        },
      },
    );
  };

  // Formatting helpers (assume 18 decimals like DEGEN)
  const formatAmount = (value?: bigint | null) => {
    if (!value) return null;
    const amount = Number(value) / 1e18;
    return amount.toFixed(4);
  };

  const dailyAmountDisplay = useMemo(
    () => (dailyClaimAmount ? formatAmount(dailyClaimAmount as bigint) : null),
    [dailyClaimAmount],
  );

  const contractBalanceDisplay = useMemo(
    () => (contractBalance ? formatAmount(contractBalance as bigint) : null),
    [contractBalance],
  );

  return {
    // status
    isConnected,
    address,
    chainId,
    canClaim,
    lastClaimTime,
    timeUntilNextClaim,

    // amounts
    dailyClaimAmount,
    dailyAmountDisplay,
    contractBalance,
    contractBalanceDisplay,

    // actions
    claim,
    refetchLastClaimTime,
    refetchContractBalance,

    // tx state
    hash,
    isPending: isWritePending || isConfirming,
    isSuccess: isConfirmed,
    error: writeError || receiptError,
  };
}


