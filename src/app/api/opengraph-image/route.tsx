import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
            <h1 tw="text-7xl font-bold text-white mb-6">Check Your Neynar User Score</h1>
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
        <h1 tw="text-6xl font-bold text-white mb-4">{displayName}&apos;s Neynar User Score</h1>
        {scoreDisplay !== null ? (
          <div tw="flex items-center justify-center mb-4">
            <div tw="text-9xl font-bold text-white drop-shadow-lg">{scoreDisplay}</div>
          </div>
        ) : (
          <div tw="flex flex-col items-center justify-center mb-4">
            <p tw="text-5xl text-white opacity-80 mb-4">Open the app to check your Neynar User Score</p>
            <div tw="flex items-center justify-center bg-white/20 rounded-2xl px-8 py-4 border-2 border-white/80 backdrop-blur">
              <p tw="text-4xl font-semibold text-white">Launch Mini App →</p>
            </div>
          </div>
        )}
        <p tw="text-4xl mt-6 text-white opacity-90">Check your Neynar User Score</p>
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