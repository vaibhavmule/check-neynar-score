import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';
import { CASTS } from "~/lib/constants";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function findCastById(castId: string): typeof CASTS[0] | null {
  // Match by hash only (e.g., 0x686b5d5a)
  return CASTS.find(cast => {
    const hashMatch = cast.url.match(/\/([0-9a-fx]+)$/i);
    const hash = hashMatch ? hashMatch[1] : "";
    return hash === castId || hash.toLowerCase() === castId.toLowerCase();
  }) || null;
}

async function fetchCast(castUrl?: string | null, castHash?: string | null) {
  if (!castUrl && !castHash) return null;

  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) return null;

  try {
    const identifier = castUrl || castHash;
    const typeParam = castUrl ? 'url' : 'hash';
    const apiUrl = `https://api.neynar.com/v2/farcaster/cast?identifier=${encodeURIComponent(identifier!)}&type=${typeParam}`;
    
    console.log('Fetching cast from Neynar API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        "accept": "application/json",
        "x-api-key": apiKey,
      },
    });

    console.log('Neynar API response status:', response.status, response.statusText);

    if (!response.ok) {
      // Try without type if hash was provided
      if (castHash && !castUrl) {
        const fallbackResponse = await fetch(
          `https://api.neynar.com/v2/farcaster/cast?identifier=${encodeURIComponent(castHash)}`,
          {
            headers: {
              "accept": "application/json",
              "x-api-key": apiKey,
            },
          }
        );
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          return data.result?.cast || data.cast || null;
        }
      }
      return null;
    }

    const data = await response.json();
    const cast = data.result?.cast || data.cast || null;
    console.log('Cast fetched successfully:', cast ? 'Yes' : 'No');
    return cast;
  } catch (error) {
    console.error('Error fetching cast:', error);
    return null;
  }
}

async function getUserWithScore(fid: number) {
  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) return null;

  try {
    const config = new Configuration({ apiKey });
    const neynar = new NeynarAPIClient(config);
    
    const usersResponse = await neynar.fetchBulkUsers({ fids: [fid] });
    const users = usersResponse.users || [];
    const user = users[0];
    
    if (!user) return null;

    // Extract score from user object
    let score = user.score ?? null;
    if (score === null && user.experimental?.neynar_user_score !== undefined) {
      score = user.experimental.neynar_user_score;
    }
    
    // If still no score, fetch it via the separate API endpoint
    if (score === null) {
      try {
        const response = await fetch(
          `https://api.neynar.com/v2/farcaster/user/quality_score?fid=${user.fid}`,
          {
            headers: {
              'x-api-key': apiKey,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          // Handle different possible response structures
          score = data.score ?? data.result?.score ?? data.result ?? null;
        }
      } catch (err) {
        console.error(`Failed to fetch score for fid ${user.fid}:`, err);
        // Leave score as null
      }
    }
    
    // Normalize score to 0-100 range (percentage)
    // Score might come as decimal (0-1) or already as percentage (0-100)
    let normalizedScore: number | null = null;
    if (score !== null && typeof score === 'number') {
      // If score is <= 1, it's likely a decimal (0-1 range), convert to percentage
      // If score is > 1, assume it's already in 0-100 range
      normalizedScore = score <= 1 ? score * 100 : score;
      // Clamp between 0 and 100 and round to nearest integer
      normalizedScore = Math.max(0, Math.min(100, Math.round(normalizedScore)));
    }

    return { ...user, score: normalizedScore };
  } catch (error) {
    console.error('Failed to fetch user with score:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');
  const castId = searchParams.get('castId');

  // Handle cast-specific images via castId (hash format)
  if (castId) {
    console.log('Looking for castId:', castId);
    const castConfig = findCastById(castId);
    if (!castConfig) {
      console.error('Cast not found for castId:', castId);
    } else {
      console.log('Found cast config:', { url: castConfig.url, title: castConfig.title });
      const cast = await fetchCast(castConfig.url, null);
      if (!cast) {
        console.error('Failed to fetch cast data for:', castConfig.url);
      } else {
        console.log('Cast data received:', {
          author: cast.author?.username,
          pfp_url: cast.author?.pfp_url,
          text: cast.text?.substring(0, 50) + '...',
        });
        const author = cast.author;
        console.log('Profile picture URL:', author?.pfp_url);
        console.log('Custom image URL from config:', castConfig.imageUrl);
        
        // Use custom image from config if available, otherwise use profile picture
        const imageUrl = castConfig.imageUrl || author?.pfp_url;
        
        let titleText = castConfig.title || cast.text || 'Cast';
        // Remove "by @username" from title if present
        titleText = titleText.replace(/\s+by\s+@\w+/i, '');
        // Remove trailing dash and spaces
        titleText = titleText.replace(/\s*-\s*$/, '').trim();
        // Truncate title if too long (max ~100 chars)
        const title = titleText.length > 100 
          ? titleText.substring(0, 97) + '...' 
          : titleText;
        // Truncate cast text for display (max ~200 chars)
        const castText = cast.text || '';
        const truncatedCastText = castText.length > 200 
          ? castText.substring(0, 197) + '...' 
          : castText;

        return new ImageResponse(
          (
            <div tw="flex h-full w-full flex-col justify-center items-center relative" style={{ display: 'flex', background: 'radial-gradient(circle at 50% 0%, #1a1a1a 0%, #000000 100%)' }}>
              {/* Glass card container */}
              <div tw="flex flex-col justify-center items-center" style={{ 
                display: 'flex',
                width: '900px',
                height: '500px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '30px',
                padding: '60px',
                boxShadow: '0 50px 100px -20px rgba(0,0,0,1)',
              }}>
                {/* Title */}
                <div tw="text-white text-4xl font-bold mb-12 text-center" style={{ fontFamily: 'serif', letterSpacing: '0.5px' }}>
                  {title}
                </div>

                {/* Image (custom or profile picture) */}
                {imageUrl && (
                  <div tw="flex flex-col items-center mb-2 mt-10" style={{ display: 'flex' }}>
                    <div tw="flex w-32 h-32 rounded-full overflow-hidden border-4 border-white/80" style={{ 
                      display: 'flex',
                      position: 'relative',
                    }}>
                      <img 
                        src={imageUrl} 
                        alt="Image" 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                        }}
                      />
                    </div>
                    {author?.username && (
                      <p tw="text-xl mt-3 text-center" style={{ fontFamily: 'monospace', color: '#a0a0a0', fontWeight: 500 }}>
                        @{author.username}
                      </p>
                    )}
                  </div>
                )}

                {/* Paragraph */}
                <div tw="flex flex-col justify-center items-center mt-2" style={{ display: 'flex' }}>
                  <p tw="text-white text-2xl text-center" style={{ fontFamily: 'serif', letterSpacing: '0.5px', fontWeight: 400, lineHeight: 1.6 }}>{truncatedCastText}</p>
                </div>
              </div>
            </div>
          ),
          {
            width: 1200,
            height: 630,
            ...(imageUrl && {
              images: [imageUrl],
            }),
            headers: {
              'Cache-Control': 'no-store, max-age=0, must-revalidate',
              'CDN-Cache-Control': 'no-store',
              'Vercel-CDN-Cache-Control': 'no-store',
            },
          }
        );
      }
    }
  }

  const user = fid ? await getUserWithScore(Number(fid)) : null;
  const score = user?.score ?? null;
  const displayName = user?.display_name || user?.username || 'User';
  const design = searchParams.get('design') || 'orange';
  
  // Format score based on design: orange = 0-1 decimal, glass = 0-100 integer
  const scoreDisplay = score !== null 
    ? (design === 'orange' ? (score / 100).toFixed(2) : Math.round(score).toString())
    : null;

  // If no user/fid provided, show a welcoming default image
  if (!user || !fid) {
    return new ImageResponse(
      (
        <div tw="flex h-full w-full flex-col justify-center items-center relative" style={{ background: 'linear-gradient(135deg, #FF9861 0%, #FF7A3D 50%, #8A68FF 100%)' }}>
          <div tw="flex flex-col items-center justify-center">
            <h1 tw="text-7xl font-bold text-white mb-6">Neynar Score</h1>
            <p tw="text-4xl text-white opacity-90 mb-8">A metric ranging from 0 to 1 that evaluates the quality of user interactions on the Farcaster platform</p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
          'CDN-Cache-Control': 'no-store',
          'Vercel-CDN-Cache-Control': 'no-store',
        },
      }
    );
  }

  // Glass design variant
  if (design === 'glass') {
    const displayScore = score !== null ? Math.max(0, Math.min(100, Math.round(score))) : null;
    return new ImageResponse(
      (
        <div tw="flex h-full w-full flex-col justify-center items-center relative" style={{ background: 'radial-gradient(circle at 50% 0%, #1a1a1a 0%, #000000 100%)' }}>
          {/* Glass card container */}
          <div tw="flex flex-col justify-center items-center" style={{ 
            display: 'flex',
            width: '900px',
            height: '500px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '30px',
            padding: '60px',
            boxShadow: '0 50px 100px -20px rgba(0,0,0,1)',
          }}>
            {/* Header */}
            <div tw="flex justify-between items-center w-full mb-8">
              <div tw="text-white text-3xl" style={{ fontFamily: 'serif', fontWeight: 900, letterSpacing: '0.5px' }}>
                {user?.username ? `@${user.username}` : '—'}
              </div>
              <div tw="text-gray-400 text-2xl" style={{ fontFamily: 'monospace', letterSpacing: '1.5px', fontWeight: 500, textTransform: 'uppercase' }}>
                FID: {fid}
              </div>
            </div>

            {/* Score Display */}
            {displayScore !== null ? (
              <div tw="text-white text-9xl font-bold" style={{ fontFamily: 'serif', lineHeight: 1 }}>
                {displayScore}
              </div>
            ) : (
              <div tw="text-white text-5xl opacity-80">Open the app to check your score</div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        ...(user?.pfp_url && {
          images: [user.pfp_url],
        }),
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
          'CDN-Cache-Control': 'no-store',
          'Vercel-CDN-Cache-Control': 'no-store',
        },
      }
    );
  }

  // Orange design variant (default)
  // Match the orange card layout: gradient header with profile pic, title, and score
  return new ImageResponse(
    (
      <div tw="flex h-full w-full flex-col relative" style={{ background: 'linear-gradient(135deg, #FF9861 0%, #FF7A3D 50%, #8A68FF 100%)' }}>
        {/* Card container matching orange card design */}
        <div tw="flex flex-col h-full" style={{ 
          width: '900px',
          margin: '0 auto',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px -20px rgba(0,0,0,0.5)',
        }}>
          {/* Header with gradient background */}
          <div tw="flex flex-col justify-center items-center flex-grow" style={{ 
            background: 'linear-gradient(to bottom right, #FF7A3D, #8A68FF)',
            padding: '60px',
          }}>
            {/* Profile Picture */}
            {user?.pfp_url && (
              <div tw="flex mb-8" style={{ width: '128px', height: '128px' }}>
                <div tw="flex rounded-full overflow-hidden" style={{ 
                  width: '128px', 
                  height: '128px',
                  border: '4px solid white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}>
                  <img src={user.pfp_url} alt="Profile" tw="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* Score Display */}
            <div tw="flex flex-col items-center text-center">
              <h1 tw="text-5xl font-bold text-white mb-4">
                {displayName}&apos;s Neynar Score
              </h1>
              {scoreDisplay !== null ? (
                <div tw="text-9xl font-bold text-white" style={{ lineHeight: 1 }}>
                  {scoreDisplay}
                </div>
              ) : (
                <p tw="text-3xl text-white opacity-80">No score available</p>
              )}
            </div>
          </div>

          {/* Footer (dark section) */}
          <div tw="flex" style={{ 
            backgroundColor: '#1a1a1a',
            padding: '40px 60px',
            justifyContent: 'center',
          }}>
            <div tw="flex rounded-lg" style={{ 
              background: 'linear-gradient(to right, #FF7A3D, #8A68FF)',
              padding: '12px 48px',
            }}>
              <p tw="text-2xl font-semibold text-white">Share</p>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      ...(user?.pfp_url && {
        images: [user.pfp_url],
      }),
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      },
    }
  );
}