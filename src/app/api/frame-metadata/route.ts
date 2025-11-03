import { NextRequest, NextResponse } from 'next/server';
import { getMiniAppEmbedMetadata } from '~/lib/utils';

/**
 * Dynamic API route that returns frame metadata based on query params
 * This allows embeds to show different titles/content based on URL params
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const hasScore = searchParams.has('score');
  const tabParam = searchParams.get('tab');
  const isScore = hasScore || tabParam === 'score' || tabParam === 'what-is-neynar-score';

  const embed = getMiniAppEmbedMetadata(undefined, { mode: isScore ? 'scoreInfo' : 'default' });

  return NextResponse.json(embed, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}

