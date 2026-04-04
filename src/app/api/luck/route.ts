import { NextResponse } from 'next/server';
import { getPoolLuck } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '24');

    const luck = await getPoolLuck(hours);
    return NextResponse.json({ success: true, data: luck });
  } catch (error) {
    console.error('Luck error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate pool luck' },
      { status: 500 }
    );
  }
}
