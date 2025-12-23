"use client";

import { useEffect, useState, useCallback } from "react";
import { CASTS } from "~/lib/constants";

interface CastData {
  hash: string;
  author: {
    fid: number;
    username: string;
    display_name: string;
    pfp_url?: string;
  };
  text: string;
  timestamp: string;
  embeds?: Array<{
    url?: string;
    cast_id?: {
      hash: string;
    };
  }>;
  reactions?: {
    likes_count?: number;
    recasts_count?: number;
    replies_count?: number;
  };
  parent_author?: {
    fid: number;
    username: string;
  };
}

interface CastDisplayProps {
  castHash: string;
  castUrl?: string;
  mode?: "api" | "iframe" | "embed";
  className?: string;
}

/**
 * Component to display a Farcaster cast
 * 
 * Supports three modes:
 * 1. "api" - Fetches cast data via Neynar API and renders custom UI
 * 2. "iframe" - Embeds cast using iframe
 * 3. "embed" - Uses Farcaster embed URL
 */
export function CastDisplay({ castHash, castUrl, mode = "api", className = "" }: CastDisplayProps) {
  const [cast, setCast] = useState<CastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCast = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use URL if provided, otherwise use hash
      const apiUrl = castUrl 
        ? `/api/cast?url=${encodeURIComponent(castUrl)}`
        : `/api/cast?hash=${castHash}`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch cast: ${response.statusText}`);
      }
      const data = await response.json();
      setCast(data.cast);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cast");
    } finally {
      setLoading(false);
    }
  }, [castHash, castUrl]);

  useEffect(() => {
    if (mode === "api") {
      fetchCast();
    }
  }, [mode, fetchCast]);

  // Iframe mode - embed the cast URL directly
  if (mode === "iframe") {
    return (
      <div className={`w-full ${className}`}>
        <iframe
          src={`https://farcaster.xyz/girl-ua/${castHash}`}
          className="w-full h-[600px] border-0 rounded-lg"
          title="Farcaster Cast"
          allow="clipboard-read; clipboard-write"
        />
      </div>
    );
  }

  // Embed mode - use Farcaster's embed script
  if (mode === "embed") {
    return (
      <div className={`w-full ${className}`}>
        <div
          className="farcaster-embed"
          data-cast-hash={castHash}
          data-cast-url={`https://farcaster.xyz/girl-ua/${castHash}`}
        />
        <script
          async
          src="https://farcaster.xyz/embed.js"
          onLoad={() => {
            // Initialize embed after script loads
            if (typeof window !== "undefined" && (window as any).FarcasterEmbed) {
              (window as any).FarcasterEmbed.init();
            }
          }}
        />
      </div>
    );
  }

  // API mode - custom rendering
  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="spinner-primary h-8 w-8 border-white"></div>
        <span className="ml-3 text-white">Loading cast...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`p-4 rounded-lg ${className}`}
        style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}
      >
        <p className="text-red-400 mb-2">Error loading cast:</p>
        <p className="text-red-300 text-sm">{error}</p>
        {castUrl && (
          <p className="text-gray-400 text-xs mt-2">URL: {castUrl}</p>
        )}
        {castHash && !castUrl && (
          <p className="text-gray-400 text-xs mt-2">Hash: {castHash}</p>
        )}
      </div>
    );
  }

  if (!cast) {
    return null;
  }

  // Get custom image URL from cast config if available
  const castConfig = CASTS.find(c => c.url === castUrl || c.url.includes(castHash));
  const imageUrl = castConfig?.imageUrl || cast.author.pfp_url;

  return (
    <div 
      className={`space-y-4 ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '1.5rem',
      }}
    >
      {/* Author info */}
      <div className="flex items-center gap-3">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={cast.author.display_name || cast.author.username}
            width={48}
            height={48}
            className="rounded-full"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
        )}
        <div className="flex-1">
          <div className="font-semibold text-white">
            {cast.author.display_name || cast.author.username}
          </div>
          <div className="text-sm" style={{ color: 'var(--fid-color)' }}>
            @{cast.author.username}
          </div>
        </div>
        <div className="text-xs" style={{ color: 'var(--fid-color)' }}>
          {new Date(cast.timestamp).toLocaleDateString()}
        </div>
      </div>

      {/* Cast text */}
      <div className="text-base leading-relaxed whitespace-pre-wrap break-words text-white">
        {cast.text}
      </div>

      {/* Embeds */}
      {cast.embeds && cast.embeds.length > 0 && (
        <div className="space-y-2">
          {cast.embeds.map((embed, idx) => (
            <div 
              key={idx} 
              className="rounded-lg overflow-hidden"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {embed.url && (
                <a
                  href={embed.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 hover:opacity-80 transition-opacity"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <div className="text-sm text-blue-400 truncate">{embed.url}</div>
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reactions */}
      {cast.reactions && (
        <div 
          className="flex items-center gap-4 text-sm pt-2"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            color: 'var(--fid-color)',
          }}
        >
          {cast.reactions.likes_count !== undefined && (
            <span>❤️ {cast.reactions.likes_count}</span>
          )}
          {cast.reactions.recasts_count !== undefined && (
            <span>🔄 {cast.reactions.recasts_count}</span>
          )}
          {cast.reactions.replies_count !== undefined && (
            <span>💬 {cast.reactions.replies_count}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="pt-2 flex items-center justify-between">
        <a
          href={`https://farcaster.xyz/${cast.author.username}/${castHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-400 hover:underline"
        >
          View on Farcaster →
        </a>
      </div>
    </div>
  );
}




