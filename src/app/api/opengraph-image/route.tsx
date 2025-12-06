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

    return { ...user, score };
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
  const scoreDisplay = score !== null ? score.toFixed(2) : null;
  const displayName = user?.display_name || user?.username || 'User';

  // If no user/fid provided, show a welcoming default image
  if (!user || !fid) {
    return new ImageResponse(
      (
        <div tw="flex h-full w-full flex-col justify-center items-center relative" style={{ background: 'linear-gradient(135deg, #FF9861 0%, #FF7A3D 50%, #8A68FF 100%)' }}>
          <div tw="flex flex-col items-center justify-center">
            <h1 tw="text-7xl font-bold text-white mb-6">Neynar Score</h1>
            <p tw="text-4xl text-white opacity-90 mb-8">A metric ranging from 0 to 1 that evaluates the quality of user interactions on the Farcaster platform</p>
            <div tw="flex items-center justify-center bg-white/20 rounded-3xl px-12 py-8 border-4 border-white/80 backdrop-blur">
              <p tw="text-5xl font-semibold text-white">Launch the app →</p>
            </div>
            <p tw="text-3xl text-white opacity-80 mt-10">Powered by Neynar</p>
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

  return new ImageResponse(
    (
      <div tw="flex h-full w-full flex-col justify-center items-center relative" style={{ background: 'linear-gradient(135deg, #FF9861 0%, #FF7A3D 50%, #8A68FF 100%)' }}>
        {user?.pfp_url && (
          <div tw="flex w-64 h-64 rounded-full overflow-hidden mb-8 border-8 border-white/80 shadow-2xl">
            <img src={user.pfp_url} alt="Profile" tw="w-full h-full object-cover" />
          </div>
        )}
        <h1 tw="text-6xl font-bold text-white mb-4">{displayName}&apos;s Neynar Score</h1>
        {scoreDisplay !== null ? (
          <div tw="flex items-center justify-center mb-4">
            <div tw="text-9xl font-bold text-white drop-shadow-lg">{scoreDisplay}</div>
          </div>
        ) : (
          <div tw="flex flex-col items-center justify-center mb-4">
            <p tw="text-5xl text-white opacity-80 mb-4">Open the app to check your Neynar Score</p>
            <div tw="flex items-center justify-center bg-white/20 rounded-2xl px-8 py-4 border-2 border-white/80 backdrop-blur">
              <p tw="text-4xl font-semibold text-white">Launch Mini App →</p>
            </div>
          </div>
        )}
        <p tw="text-4xl mt-6 text-white opacity-90">Neynar Score</p>
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