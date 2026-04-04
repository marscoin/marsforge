import { NextResponse } from 'next/server';
import { getRecentBlocks } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const blocks = await getRecentBlocks(limit);
    return NextResponse.json({ success: true, data: blocks });
  } catch (error) {
    console.error('Blocks error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blocks' },
      { status: 500 }
    );
  }
}
