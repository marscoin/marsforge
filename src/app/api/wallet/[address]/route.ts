import { NextResponse } from 'next/server';
import { getWalletStats, getWalletBalance, getWalletEarnings } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    const [workers, balance, earnings] = await Promise.all([
      getWalletStats(address),
      getWalletBalance(address),
      getWalletEarnings(address),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        address,
        workers,
        balance,
        earnings,
      },
    });
  } catch (error) {
    console.error('Wallet error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wallet data' },
      { status: 500 }
    );
  }
}
