import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';
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
    // Use Configuration for consistent initialization (matches neynar.ts)
    const config = new Configuration({ apiKey });
    const neynar = new NeynarAPIClient(config);
    
    // Parse and validate FIDs
    const fidsArray = fids.split(',').map(fid => {
      const parsed = parseInt(fid.trim(), 10);
      if (isNaN(parsed)) {
        throw new Error(`Invalid FID: ${fid}`);
      }
      return parsed;
    });

    if (fidsArray.length === 0) {
      return NextResponse.json(
        { error: 'No valid FIDs provided' },
        { status: 400 }
      );
    }
    
    // Fetch users - scores are already included in the user object
    const usersResponse = await neynar.fetchBulkUsers({ fids: fidsArray });

    // Validate response structure
    if (!usersResponse || typeof usersResponse !== 'object') {
      throw new Error('Invalid response from fetchBulkUsers');
    }

    const users = usersResponse.users || [];
    if (!Array.isArray(users)) {
      throw new Error('Users response is not an array');
    }

    // Extract scores from user objects and fetch missing ones if needed
    // The score is available in experimental.neynar_user_score (will be moved to score field after June 1, 2025)
    const usersWithScores = await Promise.all(
      users.map(async (user) => {
        // Check for score in the stable field first (for future compatibility)
        let score = user.score ?? null;
        
        // Fall back to experimental.neynar_user_score if available
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
        
        return {
          ...user,
          score,
        };
      })
    );

    return NextResponse.json({ users: usersWithScores });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    
    // Provide more detailed error information in logs
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.stack : String(error);
    console.error('Error details:', errorDetails);

    return NextResponse.json(
      { 
        error: 'Failed to fetch users. Please check your Neynar API key and try again.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
