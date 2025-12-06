import { NextResponse } from 'next/server';

/**
 * API route to fetch cast data by hash or URL
 * 
 * Usage: 
 * - /api/cast?hash=0xb5446dc5
 * - /api/cast?url=https://farcaster.xyz/girl-ua/0xb5446dc5
 * 
 * Note: The hash from farcaster.xyz URLs might be a short identifier.
 * Neynar API v2 endpoint for looking up casts.
 */
export async function GET(request: Request) {
  const apiKey = process.env.NEYNAR_API_KEY;
  const { searchParams } = new URL(request.url);
  const hash = searchParams.get('hash');
  const url = searchParams.get('url');
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Neynar API key is not configured. Please add NEYNAR_API_KEY to your environment variables.' },
      { status: 500 }
    );
  }

  // Determine identifier - prefer URL if provided, otherwise use hash
  const identifier = url || hash;
  
  if (!identifier) {
    return NextResponse.json(
      { error: 'Either hash or url parameter is required' },
      { status: 400 }
    );
  }

  try {
    const headers = {
      "accept": "application/json",
      "x-api-key": apiKey,
    };

    // If URL is provided, use it directly; otherwise try hash
    // Neynar API works better with full URLs
    const identifierParam = identifier;
    const typeParam = url ? 'url' : 'hash';
    
    // Try with the appropriate type first
    let response = await fetch(
      `https://api.neynar.com/v2/farcaster/cast?identifier=${encodeURIComponent(identifierParam)}&type=${typeParam}`,
      { headers }
    );

    // If that fails and we have a hash, try without type (auto-detect)
    if (!response.ok && hash && !url) {
      response = await fetch(
        `https://api.neynar.com/v2/farcaster/cast?identifier=${encodeURIComponent(hash)}`,
        { headers }
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || response.statusText;
      
      console.error('Neynar API error:', {
        status: response.status,
        statusText: response.statusText,
        message: errorMessage,
        hash,
      });
      
      // If cast not found, it might be that the hash from Farcaster URL is not the full hash
      // Suggest using the full cast hash or the cast URL
      return NextResponse.json(
        { 
          error: `Cast not found: ${errorMessage}`,
          hint: 'The hash from Farcaster URL might be shortened. Try using the full cast hash or cast URL.',
          hash: hash,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Neynar API returns cast in result.cast or directly as cast
    const cast = data.result?.cast || data.cast;
    
    if (!cast) {
      return NextResponse.json(
        { error: 'Cast not found in response' },
        { status: 404 }
      );
    }

    return NextResponse.json({ cast });
  } catch (error) {
    console.error('Failed to fetch cast:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: `Failed to fetch cast: ${errorMessage}` },
      { status: 500 }
    );
  }
}

