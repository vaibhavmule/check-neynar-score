import { NextResponse } from 'next/server';
import { getNeynarClient } from '~/lib/neynar';
import { DEVELOPER_FID } from '~/lib/constants';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const viewerFidParam = searchParams.get('viewerFid');
    const developerFidParam = searchParams.get('developerFid');

    if (!viewerFidParam) {
      return NextResponse.json(
        { error: 'viewerFid is required' },
        { status: 400 }
      );
    }

    const viewerFid = parseInt(viewerFidParam, 10);
    const developerFid = developerFidParam ? parseInt(developerFidParam, 10) : DEVELOPER_FID;

    if (Number.isNaN(viewerFid) || Number.isNaN(developerFid)) {
      return NextResponse.json(
        { error: 'Invalid FID parameter(s)' },
        { status: 400 }
      );
    }

    const client = getNeynarClient();
    const { users } = await client.fetchBulkUsers({
      fids: [developerFid],
      viewerFid,
    });

    const developer = users?.[0];
    const isFollowing = Boolean(developer?.viewer_context?.following);

    return NextResponse.json({
      isFollowing,
      developer,
    });
  } catch (error) {
    console.error('Follow check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check follow status' },
      { status: 500 }
    );
  }
}


