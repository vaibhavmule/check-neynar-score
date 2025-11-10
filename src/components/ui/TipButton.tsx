"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { Button } from "./Button";
import { truncateAddress } from "../../lib/truncateAddress";

type TipButtonProps = {
  recipientFid?: number;
  username?: string;
  recipientAddress?: `0x${string}`;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
};

type TipStatus = "idle" | "pending" | "success" | "error";

const MINI_APP_TOKEN = "eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const MINI_APP_AMOUNT = "390000"; // 0.39 USDC (6 decimals)
const TIP_ETH_WEI = parseEther("0.000111");

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "shortMessage" in error) {
    const shortMessage = (error as { shortMessage?: unknown }).shortMessage;
    if (typeof shortMessage === "string" && shortMessage.length > 0) {
      return shortMessage;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unable to complete tip.";
}

export function TipButton({
  recipientFid,
  username,
  recipientAddress,
  className,
  variant,
  size,
}: TipButtonProps) {
  const { actions, isSDKLoaded } = useMiniApp();
  const { isConnected } = useAccount();
  const {
    sendTransaction,
    data: evmTransactionHash,
    error: evmTransactionError,
    isPending: isEvmTransactionPending,
  } = useSendTransaction();
  const {
    isLoading: isEvmTransactionConfirming,
    isSuccess: isEvmTransactionConfirmed,
  } = useWaitForTransactionReceipt({
    hash: evmTransactionHash,
  });

  const [status, setStatus] = useState<TipStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const usingEvmTip = Boolean(recipientAddress);

  // Reset transient states when recipient changes
  useEffect(() => {
    setStatus("idle");
    setErrorMessage(null);
  }, [recipientFid, recipientAddress]);

  const miniAppReady = useMemo(() => {
    if (usingEvmTip) {
      return false;
    }
    return Boolean(recipientFid && isSDKLoaded && typeof actions?.sendToken === "function");
  }, [actions, isSDKLoaded, recipientFid, usingEvmTip]);

  const handleTip = useCallback(async () => {
    if (usingEvmTip) {
      if (!recipientAddress || !isConnected) {
        return;
      }

      setStatus("pending");
      setErrorMessage(null);

      try {
        sendTransaction(
          {
            to: recipientAddress,
            value: TIP_ETH_WEI,
          },
          {
            onSuccess: () => {
              setStatus("success");
              setTimeout(() => {
                setStatus("idle");
              }, 2500);
            },
            onError: (error) => {
              setStatus("error");
              setErrorMessage(getErrorMessage(error));
            },
          }
        );
      } catch (error) {
        setStatus("error");
        setErrorMessage(getErrorMessage(error));
      }

      return;
    }

    if (!miniAppReady || !recipientFid || typeof actions?.sendToken !== "function") {
      return;
    }

    setStatus("pending");
    setErrorMessage(null);

    try {
      const result = await actions.sendToken({
        recipientFid,
        token: MINI_APP_TOKEN,
        amount: MINI_APP_AMOUNT,
      });
      if (result.success) {
        setStatus("success");
        // Allow the user to tip again after a short confirmation window
        setTimeout(() => {
          setStatus("idle");
        }, 2500);
        return;
      }

      if (result.reason === "rejected_by_user") {
        setStatus("idle");
        return;
      }

      setStatus("error");
      setErrorMessage(result.error?.message ?? "Unable to complete tip.");
    } catch (error) {
      setStatus("error");
      setErrorMessage(getErrorMessage(error));
    }
  }, [
    actions,
    isConnected,
    miniAppReady,
    recipientAddress,
    recipientFid,
    sendTransaction,
    usingEvmTip,
  ]);

  const isPending = status === "pending";
  const isSuccess = status === "success";

  const preventSend = usingEvmTip ? !isConnected : !miniAppReady;
  const buttonDisabled = usingEvmTip
    ? preventSend || isEvmTransactionPending
    : preventSend || isPending;

  const label = isPending
    ? usingEvmTip
      ? "Confirm in wallet..."
      : "Opening tip flow..."
    : isSuccess
      ? "Tip sent!"
      : "Tip ❤️";

  const resolvedVariant = variant ?? (isSuccess ? "primary" : "secondary");
  const resolvedSize = size ?? "md";

  return (
    <div className={`w-full space-y-1.5 text-center ${className ?? ""}`}>
      <Button
        onClick={handleTip}
        disabled={buttonDisabled}
        isLoading={usingEvmTip ? isEvmTransactionPending || isPending : isPending}
        variant={resolvedVariant}
        size={resolvedSize}
        className="max-w-full"
      >
        {preventSend && !isPending ? "Preparing Warpcast..." : label}
      </Button>
      {usingEvmTip && evmTransactionHash && (
        <div className="text-xs text-left w-full text-gray-600 dark:text-gray-300">
          <div>Hash: {truncateAddress(evmTransactionHash)}</div>
          <div>
            Status:{" "}
            {isEvmTransactionConfirming
              ? "Confirming..."
              : isEvmTransactionConfirmed
              ? "Confirmed!"
              : "Pending"}
          </div>
        </div>
      )}
      {status === "error" && errorMessage && (
        <p className="text-xs text-error">{errorMessage}</p>
      )}
      {usingEvmTip && status !== "error" && evmTransactionError && (
        <p className="text-xs text-error">
          {getErrorMessage(evmTransactionError)}
        </p>
      )}
    </div>
  );
}

