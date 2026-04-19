import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:9434/metrics', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Metrics returned ${res.status}`);
    const text = await res.text();

    // Parse the Prometheus-format metrics we care about
    const parseMetric = (name: string, labels?: string): number => {
      const escaped = labels ? `${name}\\{${labels}\\}` : name;
      const re = new RegExp(`^${escaped} (\\S+)$`, 'm');
      const m = text.match(re);
      return m ? Number(m[1]) : 0;
    };

    return NextResponse.json({
      success: true,
      data: {
        up: parseMetric('marsqnet_stratum_up') === 1,
        miners: parseMetric('marsqnet_stratum_miners_connected'),
        height: parseMetric('marsqnet_stratum_height'),
        shares: parseMetric('marsqnet_stratum_shares_total'),
        blocks: parseMetric('marsqnet_stratum_blocks_found'),
        blocksRejected: parseMetric('marsqnet_stratum_blocks_rejected'),
        rejects: {
          lowDifficulty: parseMetric('marsqnet_stratum_shares_invalid', 'reason="low_difficulty"'),
          stale: parseMetric('marsqnet_stratum_shares_invalid', 'reason="stale_job"'),
          duplicate: parseMetric('marsqnet_stratum_shares_invalid', 'reason="duplicate_nonce"'),
          badHash: parseMetric('marsqnet_stratum_shares_invalid', 'reason="bad_hash"'),
        },
      },
    });
  } catch (error) {
    console.error('Stratum metrics error:', error);
    return NextResponse.json(
      { success: false, error: 'Stratum metrics unavailable' },
      { status: 503 }
    );
  }
}
