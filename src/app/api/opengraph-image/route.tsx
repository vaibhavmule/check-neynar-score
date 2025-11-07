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

  const gradientBackground = 'linear-gradient(135deg, #FF9861 0%, #FF7A3D 50%, #8A68FF 100%)';
  const cardBackground = 'rgba(12, 12, 24, 0.82)';
  const surfaceBorder = '1px solid rgba(255, 255, 255, 0.08)';

  // If no user/fid provided, show a welcoming default image
  if (!user || !fid) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', background: '#0A0D1A' }}>
          <div style={{ width: '1000px', borderRadius: '48px', padding: '56px', background: cardBackground, border: surfaceBorder, boxShadow: '0 28px 80px rgba(11, 12, 24, 0.55)', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div style={{ background: gradientBackground, borderRadius: '36px', padding: '48px', display: 'flex', flexDirection: 'column', gap: '28px', boxShadow: '0 40px 80px rgba(138, 104, 255, 0.28)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '65%' }}>
                  <h1 style={{ fontSize: '80px', lineHeight: '1.05', fontWeight: 700, color: '#FFFFFF' }}>Check Your Neynar User Score</h1>
                  <p style={{ fontSize: '32px', lineHeight: '1.35', color: 'rgba(255,255,255,0.92)' }}>
                    The Neynar User Score is a metric ranging from 0 to 1 that evaluates the quality of user
                    interactions on the Farcaster platform. View yours instantly by launching the app.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '18px 42px', borderRadius: '24px', border: '2px solid rgba(255,255,255,0.75)', color: '#FFFFFF', fontSize: '40px', fontWeight: 600, background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(10px)' }}>
                  Launch the app →
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.65)', fontSize: '30px', fontWeight: 500 }}>Powered by Neynar</div>
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
      <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', background: '#0A0D1A' }}>
        <div style={{ width: '1000px', borderRadius: '48px', padding: '56px', background: cardBackground, border: surfaceBorder, boxShadow: '0 28px 80px rgba(11, 12, 24, 0.55)', display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <div style={{ background: gradientBackground, borderRadius: '36px', padding: '54px', display: 'flex', flexDirection: 'column', gap: '42px', boxShadow: '0 40px 80px rgba(138, 104, 255, 0.28)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                <div style={{ width: '220px', height: '220px', borderRadius: '50%', padding: '16px', background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: gaugeGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 12px 28px rgba(0,0,0,0.25)' }}>
                    <div style={{ width: '75%', height: '75%', borderRadius: '50%', background: 'rgba(12,12,24,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: '72px', fontWeight: 700 }}>
                      {scoreText ?? '—'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ fontSize: '30px', fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>{displayName}&apos;s</span>
                  <span style={{ fontSize: '34px', fontWeight: 600, letterSpacing: '0.42em', color: 'rgba(255,255,255,0.92)' }}>NEYNAR USER SCORE</span>
                  <span style={{ fontSize: '28px', color: 'rgba(255,255,255,0.85)' }}>Quality metric for Farcaster</span>
                  <span style={{ fontSize: '22px', color: 'rgba(255,255,255,0.72)' }}>
                    Updated weekly to reflect the value an account adds to the network.
                  </span>
                </div>
              </div>
              {user?.pfp_url && (
                <div style={{ width: '180px', height: '180px', borderRadius: '50%', overflow: 'hidden', border: '8px solid rgba(255,255,255,0.85)', boxShadow: '0 20px 35px rgba(0,0,0,0.25)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={user.pfp_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', paddingTop: '8px' }}>
              {user?.fid && (
                <div style={{ padding: '14px 28px', borderRadius: '999px', background: 'rgba(10,13,25,0.42)', border: '1px solid rgba(255,255,255,0.22)', color: 'rgba(255,255,255,0.92)', fontSize: '24px', fontWeight: 500 }}>
                  FID: {user.fid}
                </div>
              )}
              {user?.username && (
                <div style={{ padding: '14px 28px', borderRadius: '999px', background: 'rgba(10,13,25,0.42)', border: '1px solid rgba(255,255,255,0.22)', color: 'rgba(255,255,255,0.92)', fontSize: '24px', fontWeight: 500 }}>
                  @{user.username}
                </div>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.72)', fontSize: '30px', fontWeight: 500 }}>
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