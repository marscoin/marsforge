import { NextResponse } from 'next/server';
import { getPoolStats } from '@/lib/db';

export async function GET() {
  try {
    const stats = await getPoolStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Pool stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pool stats' },
      { status: 500 }
    );
  }
}
