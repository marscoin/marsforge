import { NextResponse } from 'next/server';
import { getBlocks } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '25');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await getBlocks(limit, offset);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Blocks error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blocks' },
      { status: 500 }
    );
  }
}
