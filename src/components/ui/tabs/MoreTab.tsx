"use client";

import { useCallback } from "react";
import { useMiniApp } from "@neynar/react";
import { sdk } from "@farcaster/miniapp-sdk";
import { ShareButton } from "../Share";
import { Button } from "../Button";
import { TipButtonWithModal } from "../wallet/TipButtonWithModal";
import { DEVELOPER_FID, DEVELOPER_TIP_ADDRESS, DEVELOPER_USERNAME, APP_URL } from "~/lib/constants";

type MoreTabProps = {
  fid?: number;
  score?: number | null;
  username?: string;
};

/**
 * MoreTab component provides secondary actions and information.
 * 
 * This includes:
 * - Share functionality
 * - Support developer section
 * - Future: Settings/preferences
 */
export function MoreTab({ fid, score, username }: MoreTabProps) {
  const { actions, isSDKLoaded, context } = useMiniApp();

  const handleFollowDeveloper = useCallback(() => {
    if (!isSDKLoaded || !actions) {
      return;
    }
    if (typeof actions.viewProfile === "function") {
      actions.viewProfile({ fid: DEVELOPER_FID });
      return;
    }
    if (typeof actions.openUrl === "function") {
      actions.openUrl(`https://warpcast.com/${DEVELOPER_USERNAME}`);
    }
  }, [actions, isSDKLoaded]);

  const handleShare = useCallback(async () => {
    try {
      // Trigger haptic feedback
      const capabilities = await sdk.getCapabilities();
      if (capabilities.includes("haptics.impactOccurred")) {
        await sdk.haptics.impactOccurred("light");
      }
    } catch (error) {
      // Haptics not available, continue
      console.debug("Haptics not available:", error);
    }
  }, []);

  return (
    <div className="relative flex items-start justify-center px-1 py-4">
      <div className="w-full max-w-md space-y-4">
        {/* Share Section */}
        {fid && score !== null && score !== undefined && (
          <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
            <div className="space-y-4">
              <div className="space-y-1 text-center">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Share Your Score
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Share your Neynar Score with others.
                </p>
              </div>
              <div className="space-y-3">
                <div onClick={handleShare}>
                  <ShareButton
                    buttonText="Share Score"
                    cast={{
                      text: `My Neynar Score is ${score <= 1 ? score.toFixed(2) : Math.round(score)}. Check your score`,
                      embeds: [
                        {
                          path: `/share/${fid}`,
                        },
                      ],
                    }}
                    className="w-full"
                  />
                </div>
                <TipUsdc
                  recipientFid={fid}
                  username={username}
                  variant="secondary"
                  size="md"
                />
              </div>
            </div>
          </div>
        )}

        {/* Support Developer Section */}
        <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
          <div className="space-y-4">
            <div className="space-y-1 text-center">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Support the Developer
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Follow and tip to keep updates coming.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleFollowDeveloper}
                variant="outline"
                size="sm"
                className="w-full text-xs"
                disabled={!isSDKLoaded || (!actions?.viewProfile && !actions?.openUrl)}
              >
                Follow @{DEVELOPER_USERNAME}
              </Button>
              <TipButtonWithModal
                recipientFid={DEVELOPER_FID}
                username={DEVELOPER_USERNAME}
                recipientAddress={DEVELOPER_TIP_ADDRESS}
                variant="secondary"
                size="md"
                className="w-full"
                buttonText="Tip Developer"
              />
            </div>
          </div>
        </div>

        {/* App Info Section */}
        <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
          <div className="space-y-3 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Neynar Score Mini App
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Check your Farcaster quality score
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
