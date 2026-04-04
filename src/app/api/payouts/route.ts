import { NextResponse } from 'next/server';
import { getPayouts } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const payouts = await getPayouts();
    return NextResponse.json({ success: true, data: payouts });
  } catch (error) {
    console.error('Payouts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}
