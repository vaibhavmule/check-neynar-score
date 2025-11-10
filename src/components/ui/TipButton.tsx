"use client";

import { useCallback, useEffect, useState } from "react";
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

export function TipButton({ recipientFid, username, className, variant, size }: TipButtonProps) {
  const { actions, context } = useMiniApp();
  const [status, setStatus] = useState<TipStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset transient states when recipient changes
  useEffect(() => {
    setStatus("idle");
    setErrorMessage(null);
  }, [recipientFid]);

  const handleTip = useCallback(async () => {
    if (!recipientFid) {
      return;
    }

    setStatus("pending");
    setErrorMessage(null);

    try {
      const result = await actions.sendToken({
        recipientFid,
        token: "eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        amount: "0.39",
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
  }, [actions, recipientFid]);

  const viewingOwnProfile = recipientFid !== undefined && context?.user?.fid === recipientFid;
  const isPending = status === "pending";
  const isSuccess = status === "success";

  const preventSend = !recipientFid;
  const buttonDisabled = preventSend || isPending;

  const label = isPending
    ? "Opening tip flow..."
    : isSuccess
      ? "Tip sent!"
      : `Tip ${username ? `@${username}` : "this user"}`;

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
        {label}
      </Button>
      {status === "error" && errorMessage && (
        <p className="text-xs text-error">{errorMessage}</p>
      )}
    </div>
  );
}

