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
  const displayName = user?.display_name || user?.username || 'User';

  const rawScore = score;
  const normalizedScore = rawScore !== null
    ? Math.max(0, Math.min(1, rawScore <= 1 ? rawScore : rawScore / 100))
    : null;
  const scoreDisplayValue = rawScore !== null
    ? (rawScore <= 1 ? rawScore : rawScore / 100)
    : null;
  const scoreText = scoreDisplayValue !== null ? scoreDisplayValue.toFixed(2) : null;
  const gaugeDegrees = normalizedScore !== null ? normalizedScore * 360 : 0;
  const gaugeGradient = `conic-gradient(rgba(255,255,255,0.92) 0deg ${gaugeDegrees}deg, rgba(255,255,255,0.18) ${gaugeDegrees}deg 360deg)`;

  const gradientBackground = 'linear-gradient(135deg, #FF9861 0%, #FF7A3D 45%, #8A68FF 100%)';
  const darkBackground = '#080A16';

  // If no user/fid provided, show a welcoming default image
  if (!user || !fid) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', background: darkBackground }}>
          <div style={{ width: '940px', borderRadius: '36px', padding: '48px', background: '#111324', boxShadow: '0 24px 72px rgba(8,10,22,0.6)', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ background: gradientBackground, borderRadius: '28px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h1 style={{ fontSize: '76px', lineHeight: '1.05', fontWeight: 700, color: '#FFFFFF' }}>Check Your Neynar User Score</h1>
              <p style={{ fontSize: '32px', lineHeight: '1.35', color: 'rgba(255,255,255,0.92)' }}>
                The Neynar User Score is a metric ranging from 0 to 1 that evaluates the quality of user
                interactions on the Farcaster platform. View yours instantly by launching the app.
              </p>
              <div style={{ display: 'inline-flex', padding: '14px 36px', borderRadius: '24px', border: '2px solid rgba(255,255,255,0.85)', color: '#FFFFFF', fontSize: '34px', fontWeight: 600 }}>
                Launch the app →
              </div>
            </div>
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '28px', fontWeight: 500 }}>Powered by Neynar</div>
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
      <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', background: darkBackground }}>
        <div style={{ width: '940px', borderRadius: '36px', padding: '48px', background: '#111324', boxShadow: '0 24px 72px rgba(8,10,22,0.6)', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ background: gradientBackground, borderRadius: '28px', padding: '44px', display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <div style={{ width: '200px', height: '200px', borderRadius: '50%', padding: '14px', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: gaugeGradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '70%', height: '70%', borderRadius: '50%', background: 'rgba(8,10,22,0.65)', color: '#FFFFFF', fontSize: '66px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {scoreText ?? '—'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '28px', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>{displayName}&apos;s</span>
                <span style={{ fontSize: '34px', fontWeight: 700, letterSpacing: '0.36em', color: 'rgba(255,255,255,0.95)' }}>NEYNAR USER SCORE</span>
                <span style={{ fontSize: '26px', color: 'rgba(255,255,255,0.9)' }}>Quality metric for Farcaster</span>
                <span style={{ fontSize: '21px', color: 'rgba(255,255,255,0.78)' }}>Updated weekly to reflect the value an account adds to the network.</span>
                <div style={{ display: 'flex', gap: '14px', marginTop: '14px' }}>
                  {user?.fid && (
                    <div style={{ padding: '12px 24px', borderRadius: '999px', background: 'rgba(8,10,22,0.55)', border: '1px solid rgba(255,255,255,0.28)', color: 'rgba(255,255,255,0.9)', fontSize: '22px', fontWeight: 500 }}>
                      FID: {user.fid}
                    </div>
                  )}
                  {user?.username && (
                    <div style={{ padding: '12px 24px', borderRadius: '999px', background: 'rgba(8,10,22,0.55)', border: '1px solid rgba(255,255,255,0.28)', color: 'rgba(255,255,255,0.9)', fontSize: '22px', fontWeight: 500 }}>
                      @{user.username}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.75)', fontSize: '28px', fontWeight: 500 }}>
            Check your Neynar User Score
          </div>
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