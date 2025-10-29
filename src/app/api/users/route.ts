import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const apiKey = process.env.NEYNAR_API_KEY;
  const { searchParams } = new URL(request.url);
  const fids = searchParams.get('fids');
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Neynar API key is not configured. Please add NEYNAR_API_KEY to your environment variables.' },
      { status: 500 }
    );
  }

  if (!fids) {
    return NextResponse.json(
      { error: 'FIDs parameter is required' },
      { status: 400 }
    );
  }

  try {
    const neynar = new NeynarAPIClient({ apiKey });
    const fidsArray = fids.split(',').map(fid => parseInt(fid.trim()));
    
    // Fetch users and scores in parallel
    const [usersResponse, scores] = await Promise.all([
      neynar.fetchBulkUsers({ fids: fidsArray }),
      Promise.all(
        fidsArray.map(async (fid) => {
          try {
            const response = await fetch(
              `https://api.neynar.com/v2/farcaster/user/quality_score?fid=${fid}`,
              {
                headers: {
                  'x-api-key': apiKey,
                },
              }
            );
            if (response.ok) {
              const data = await response.json();
              // Handle different possible response structures
              const score = data.score ?? data.result?.score ?? data.result ?? null;
              return { fid, score };
            } else {
              const errorText = await response.text();
              console.error(`Quality score API error for fid ${fid}:`, response.status, errorText);
              return { fid, score: null };
            }
          } catch (err) {
            console.error(`Failed to fetch score for fid ${fid}:`, err);
            return { fid, score: null };
          }
        })
      ),
    ]);

    const { users } = usersResponse;

    // Create a map of fid -> score for quick lookup
    const scoreMap = new Map(scores.map((s) => [s.fid, s.score]));

    // Combine user data with scores
    const usersWithScores = users.map((user) => ({
      ...user,
      score: scoreMap.get(user.fid) ?? null,
    }));

    return NextResponse.json({ users: usersWithScores });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users. Please check your Neynar API key and try again.' },
      { status: 500 }
    );
  }
}
