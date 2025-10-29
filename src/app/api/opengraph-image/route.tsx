import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';

export const dynamic = 'force-dynamic';

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

  return new ImageResponse(
    (
      <div tw="flex h-full w-full flex-col justify-center items-center relative" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
        {user?.pfp_url && (
          <div tw="flex w-64 h-64 rounded-full overflow-hidden mb-8 border-8 border-white shadow-2xl">
            <img src={user.pfp_url} alt="Profile" tw="w-full h-full object-cover" />
          </div>
        )}
        <h1 tw="text-6xl font-bold text-white mb-4">{displayName}&apos;s Neynar Score</h1>
        {scoreDisplay !== null ? (
          <div tw="flex items-center justify-center">
            <div tw="text-9xl font-bold text-white">{scoreDisplay}</div>
          </div>
        ) : (
          <p tw="text-5xl text-white opacity-80">Score not available</p>
        )}
        <p tw="text-4xl mt-6 text-white opacity-90">Check your Neynar score</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}