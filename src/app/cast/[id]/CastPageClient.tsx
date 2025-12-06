"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { CastDisplay } from "~/components/ui/CastDisplay";
import { CASTS, APP_URL } from "~/lib/constants";
import { cleanTitle } from "~/lib/utils";

interface CastPageClientProps {
  castConfig: typeof CASTS[0] | null;
  castId: string;
}

export function CastPageClient({ castConfig, castId }: CastPageClientProps) {
  const router = useRouter();
  const { context, actions } = useMiniApp();

  // Extract hash and URL from the cast config
  const hashMatch = castConfig?.url.match(/\/([0-9a-fx]+)$/i);
  const hash = hashMatch ? hashMatch[1] : "";

  return (
    <div
      className="min-h-screen text-white overflow-y-auto"
      style={{
        backgroundColor: 'var(--bg-deep)',
        backgroundImage: 'radial-gradient(circle at 50% 0%, #1a1a1a 0%, #000 100%)',
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      <div className="container py-6">
        {/* Header with back button and share */}
        <div className="flex items-center justify-between mb-8 px-2">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5"
              className="group-hover:-translate-x-0.5 transition-transform"
            >
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>

          {/* Share button - shares mini app cast URL */}
          {castConfig && (() => {
            // Generate share URL: check-neynar-score.vercel.app/cast/0x686b5d5a
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : APP_URL;
            const shareUrl = `${baseUrl}/cast/${castId}`;
            
            return (
              <button
                onClick={async () => {
                  try {
                    await actions.composeCast({
                      text: castConfig.title || 'Check out this tip on improving your Neynar Score!',
                      embeds: [shareUrl], // Mini app cast URL: check-neynar-score.vercel.app/cast/0x686b5d5a
                    });
                  } catch (error) {
                    console.error('Failed to share:', error);
                  }
                }}
                className="bg-transparent border-none cursor-pointer text-gray-400 hover:text-white transition-colors"
                style={{
                  fontSize: '1rem',
                }}
              >
                share
              </button>
            );
          })()}
        </div>

        {/* Cast title if available */}
        {castConfig?.title && (
          <h2 
            className="text-xl font-bold mb-6 text-white"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 900,
            }}
          >
            {cleanTitle(castConfig.title)}
          </h2>
        )}

        {/* Cast display */}
        {castConfig ? (
          <CastDisplay 
            castHash={hash}
            castUrl={castConfig.url}
            mode="api"
            className="w-full"
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">Cast not found</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 text-blue-400 hover:text-blue-300"
            >
              Go to home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

