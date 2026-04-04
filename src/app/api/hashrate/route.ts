import { NextResponse } from 'next/server';
import { getHashrateHistory } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const algo = searchParams.get('algo') || 'scrypt';
    const hours = parseInt(searchParams.get('hours') || '24');

    const history = await getHashrateHistory(algo, hours);
    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error('Hashrate error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hashrate history' },
      { status: 500 }
    );
  }
}
