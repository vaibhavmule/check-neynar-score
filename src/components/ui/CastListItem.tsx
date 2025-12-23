"use client";

import { useState, useEffect, useCallback } from "react";
import { CastConfig, CASTS } from "~/lib/constants";
import { cleanTitle } from "~/lib/utils";
import Link from "next/link";

interface CastListItemProps {
  cast: CastConfig;
  index: number;
}

interface CastPreview {
  author: {
    username: string;
    display_name?: string;
    pfp_url?: string;
  };
  text: string;
  reactions?: {
    likes_count?: number;
    recasts_count?: number;
    replies_count?: number;
  };
}

/**
 * Component to display a single cast item in the list with preview
 */
export function CastListItem({ cast, index }: CastListItemProps) {
  const [preview, setPreview] = useState<CastPreview | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract username from URL
  const usernameMatch = cast.url.match(/farcaster\.xyz\/([^/]+)/);
  const username = usernameMatch ? usernameMatch[1] : "unknown";
  
  // Extract hash for the route
  const hashMatch = cast.url.match(/\/([0-9a-fx]+)$/i);
  const hash = hashMatch ? hashMatch[1] : "";
  
  // Use just the hash as the cast ID
  const castId = hash;

  // Get custom image URL from cast config if available
  const castConfig = CASTS.find(c => c.url === cast.url);
  const imageUrl = castConfig?.imageUrl || preview?.author?.pfp_url;

  const fetchPreview = useCallback(async () => {
    try {
      const response = await fetch(`/api/cast?url=${encodeURIComponent(cast.url)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.cast) {
          setPreview({
            author: data.cast.author || { username },
            text: data.cast.text || "",
            reactions: data.cast.reactions,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch preview:', error);
    } finally {
      setLoading(false);
    }
  }, [cast.url, username]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  // Truncate text for preview
  const previewText = preview?.text 
    ? (preview.text.length > 150 ? preview.text.substring(0, 150) + "..." : preview.text)
    : null;

  return (
    <Link 
      href={`/cast/${castId}`}
      className="block"
    >
      <div
        className="w-full p-4 rounded-lg transition-all hover:opacity-80 cursor-pointer"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="flex items-start gap-3">
          {/* Profile Picture */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={preview?.author?.display_name || preview?.author?.username || username}
              className="w-12 h-12 rounded-full flex-shrink-0"
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          ) : (
            <div 
              className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <span className="text-white text-lg">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Author info */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-sm text-white font-semibold">
                {preview?.author?.display_name || username}
              </span>
              <span 
                className="text-xs"
                style={{ color: 'var(--fid-color)' }}
              >
                @{preview?.author?.username || username}
              </span>
              
              {/* Badge if available */}
              {cast.badge && (
                <a
                  href={cast.badgeUrl || '#'}
                  target={cast.badgeUrl ? "_blank" : undefined}
                  rel={cast.badgeUrl ? "noopener noreferrer" : undefined}
                  onClick={(e) => {
                    if (!cast.badgeUrl) {
                      e.preventDefault();
                    }
                  }}
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    color: '#a78bfa',
                  }}
                >
                  {cast.badge}
                </a>
              )}
              
              <span 
                className="text-xs font-mono ml-auto"
                style={{ color: 'var(--fid-color)' }}
              >
                #{index + 1}
              </span>
            </div>

            {/* Cast preview text */}
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded animate-pulse" style={{ width: '80%' }}></div>
                <div className="h-4 bg-gray-700 rounded animate-pulse" style={{ width: '60%' }}></div>
              </div>
            ) : previewText ? (
              <p className="text-sm text-white mb-2 line-clamp-3">
                {previewText}
              </p>
            ) : cast.title ? (
              <h3 className="text-base text-white font-medium mb-1">
                {cleanTitle(cast.title)}
              </h3>
            ) : (
              <p className="text-sm text-gray-400">
                View cast by @{username}
              </p>
            )}

            {/* Reactions */}
            {preview?.reactions && (
              <div className="flex items-center gap-4 text-xs mt-2" style={{ color: 'var(--fid-color)' }}>
                {preview.reactions.likes_count !== undefined && (
                  <span>❤️ {preview.reactions.likes_count}</span>
                )}
                {preview.reactions.recasts_count !== undefined && (
                  <span>🔄 {preview.reactions.recasts_count}</span>
                )}
                {preview.reactions.replies_count !== undefined && (
                  <span>💬 {preview.reactions.replies_count}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}




