import { NextResponse } from 'next/server';
import { getMiners } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const miners = await getMiners();
    return NextResponse.json({ success: true, data: miners });
  } catch (error) {
    console.error('Miners error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch miners' },
      { status: 500 }
    );
  }
}
