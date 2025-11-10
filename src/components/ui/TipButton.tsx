"use client";

import { useCallback, useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { Button } from "./Button";

type TipButtonProps = {
  recipientFid?: number;
  username?: string;
  className?: string;
};

type TipStatus = "idle" | "pending" | "success" | "error";

export function TipButton({ recipientFid, username, className }: TipButtonProps) {
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
      const result = await actions.sendToken({ recipientFid });
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

  // Hide button if we are missing the required data or the user is trying to tip themselves
  if (!recipientFid || context?.user?.fid === recipientFid) {
    return null;
  }

  const isPending = status === "pending";
  const isSuccess = status === "success";
  const label = isPending
    ? "Opening tip flow..."
    : isSuccess
      ? "Tip sent!"
      : `Tip ${username ? `@${username}` : "this user"}`;

  return (
    <div className="w-full space-y-1.5 text-center">
      <Button
        onClick={handleTip}
        disabled={isPending}
        isLoading={isPending}
        variant="primary"
        size="lg"
        className={`max-w-full ${className ?? ""}`}
      >
        {label}
      </Button>
      {status === "error" && errorMessage && (
        <p className="text-xs text-error">{errorMessage}</p>
      )}
    </div>
  );
}

