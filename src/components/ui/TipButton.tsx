"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { Button } from "./Button";

type TipButtonProps = {
  recipientFid?: number;
  username?: string;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
};

type TipStatus = "idle" | "pending" | "success" | "error";

const TIP_ETH_WEI = "111000000000000"; // 0.000111 ETH in wei (18 decimals)

export function TipButton({ recipientFid, username, className, variant, size }: TipButtonProps) {
  const { actions, isSDKLoaded } = useMiniApp();
  const [status, setStatus] = useState<TipStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset transient states when recipient changes
  useEffect(() => {
    setStatus("idle");
    setErrorMessage(null);
  }, [recipientFid]);

  const readyToTip = useMemo(() => {
    return Boolean(recipientFid && isSDKLoaded && typeof actions?.sendToken === "function");
  }, [actions, isSDKLoaded, recipientFid]);

  const handleTip = useCallback(async () => {
    if (!readyToTip || !recipientFid || typeof actions?.sendToken !== "function") {
      return;
    }

    setStatus("pending");
    setErrorMessage(null);

    try {
      const result = await actions.sendToken({
        recipientFid,
        token: "eip155:8453/slip44:60", // Native ETH on Base (CAIP-19)
        amount: TIP_ETH_WEI,
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
      const message =
        error instanceof Error ? error.message : "Something went wrong while sending the tip.";
      setErrorMessage(message);
    }
  }, [actions, readyToTip, recipientFid]);

  const isPending = status === "pending";
  const isSuccess = status === "success";

  const preventSend = !readyToTip;
  const buttonDisabled = preventSend || isPending;

  const label = isPending
    ? "Opening tip flow..."
    : isSuccess
      ? "Tip sent!"
      : `Tip ${username ? `@${username}` : "this user"} 0.000111 ETH`;

  const resolvedVariant = variant ?? (isSuccess ? "primary" : "secondary");
  const resolvedSize = size ?? "md";

  return (
    <div className={`w-full space-y-1.5 text-center ${className ?? ""}`}>
      <Button
        onClick={handleTip}
        disabled={buttonDisabled}
        isLoading={isPending}
        variant={resolvedVariant}
        size={resolvedSize}
        className="max-w-full"
      >
        {preventSend && !isPending ? "Preparing Warpcast..." : label}
      </Button>
      {status === "error" && errorMessage && (
        <p className="text-xs text-error">{errorMessage}</p>
      )}
    </div>
  );
}

