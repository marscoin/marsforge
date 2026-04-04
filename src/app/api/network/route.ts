import { NextResponse } from 'next/server';
import { getNetworkHashrateHistory } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const algo = searchParams.get('algo') || 'scrypt';
    const hours = parseInt(searchParams.get('hours') || '24');

    const history = await getNetworkHashrateHistory(algo, hours);
    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error('Network hashrate error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch network hashrate' },
      { status: 500 }
    );
  }
}
