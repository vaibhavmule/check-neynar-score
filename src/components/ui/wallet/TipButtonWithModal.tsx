"use client";

import { useState } from "react";
import { Button } from "../Button";
import { TipModal } from "./TipModal";

type TipButtonWithModalProps = {
  recipientFid?: number;
  username?: string;
  recipientAddress?: `0x${string}`;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  buttonText?: string;
};

/**
 * TipButtonWithModal component provides a button that opens a tip modal.
 * 
 * This component combines a button trigger with the TipModal for a complete
 * tipping experience with predefined amounts and custom input.
 */
export function TipButtonWithModal({
  recipientFid,
  username,
  recipientAddress,
  className,
  variant = "secondary",
  size = "md",
  buttonText = "Tip",
}: TipButtonWithModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant={variant}
        size={size}
        className={className}
      >
        {buttonText}
      </Button>
      <TipModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recipientFid={recipientFid}
        username={username}
        recipientAddress={recipientAddress}
      />
    </>
  );
}

