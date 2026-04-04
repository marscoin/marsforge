'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

function formatHashrate(h: number) {
  if (!h || h === 0) return '0 H/s';
  if (h >= 1e12) return `${(h / 1e12).toFixed(2)} TH/s`;
  if (h >= 1e9) return `${(h / 1e9).toFixed(2)} GH/s`;
  if (h >= 1e6) return `${(h / 1e6).toFixed(2)} MH/s`;
  if (h >= 1e3) return `${(h / 1e3).toFixed(2)} KH/s`;
  return `${h.toFixed(0)} H/s`;
}

function formatTime(unix: number) {
  if (!unix) return '—';
  return new Date(unix * 1000).toLocaleString();
}

function timeAgo(unix: number) {
  if (!unix) return '—';
  const seconds = Math.floor(Date.now() / 1000 - unix);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

interface CoinData {
  id: number;
  name: string;
  symbol: string;
  algo: string;
  difficulty: number;
  price: number;
  network_hash: number | null;
  block_height: number;
  connections: number;
  balance: number;
  available: number;
  reward: number;
  block_time: number;
}

interface HashStat {
  algo: string;
  hashrate: number;
}

interface PayoutRow {
  id: number;
  time: number;
  amount: number;
  fee: number;
  tx: string;
  username: string;
  symbol: string;
  completed: number;
}

export default function PoolPage() {
  const { data: poolData, isLoading } = useSWR('/api/pool', fetcher, { refreshInterval: 30000 });
  const { data: payoutsData } = useSWR('/api/payouts', fetcher, { refreshInterval: 60000 });
  const { data: hashrateData } = useSWR('/api/hashrate?algo=scrypt&hours=24', fetcher, { refreshInterval: 60000 });

  const stats = poolData?.data || {};
  const coin: CoinData | undefined = Array.isArray(stats.coins) ? stats.coins[0] : undefined;
  const hashrate = Array.isArray(stats.hashstats) && stats.hashstats[0] ? Number((stats.hashstats as HashStat[])[0].hashrate) : 0;
  const workerCount = Array.isArray(stats.workers) && stats.workers[0] ? Number(stats.workers[0].count) : 0;
  const totalBlocks = Array.isArray(stats.blockCount) && stats.blockCount[0] ? Number(stats.blockCount[0].total) : 0;
  const lastBlockTime = Array.isArray(stats.lastBlock) && stats.lastBlock[0] ? Number(stats.lastBlock[0].time) : 0;
  const payouts: PayoutRow[] = payoutsData?.data || [];
  const hashrateHistory = hashrateData?.data || [];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500 py-20">Loading pool statistics...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-[#e77d11] to-[#c1440e] bg-clip-text text-transparent">
            Pool Statistics
          </span>
        </h1>
        <p className="text-gray-400">Real-time Marscoin mining pool data</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="card-body text-center">
            <p className="stat-label">Pool Hashrate</p>
            <p className="stat-value text-lg">{formatHashrate(hashrate)}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="stat-label">Active Workers</p>
            <p className="stat-value text-lg">{workerCount}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="stat-label">Blocks Found</p>
            <p className="stat-value text-lg">{totalBlocks.toLocaleString()}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="stat-label">Last Block</p>
            <p className="stat-value text-lg">{timeAgo(lastBlockTime)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Coin Info */}
        <div className="card">
          <div className="card-header">Marscoin (MARS)</div>
          <div className="card-body space-y-3">
            {coin ? (
              <>
                <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
                  <span className="text-gray-400">Algorithm</span>
                  <span className="text-[#f4e3d7]">{coin.algo}</span>
                </div>
                <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
                  <span className="text-gray-400">Block Height</span>
                  <span className="text-[#f4e3d7]">{coin.block_height?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
                  <span className="text-gray-400">Network Difficulty</span>
                  <span className="text-[#f4e3d7]">{coin.difficulty?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
                  <span className="text-gray-400">Block Reward</span>
                  <span className="text-[#e77d11]">{coin.reward} MARS</span>
                </div>
                <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
                  <span className="text-gray-400">Price (BTC)</span>
                  <span className="text-[#f4e3d7]">{coin.price}</span>
                </div>
                <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
                  <span className="text-gray-400">Node Connections</span>
                  <span className="text-[#f4e3d7]">{coin.connections}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pool Balance</span>
                  <span className="text-[#e77d11]">{coin.balance?.toFixed(4)} MARS</span>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-4">No coin data available</p>
            )}
          </div>
        </div>

        {/* Pool Config */}
        <div className="card">
          <div className="card-header">Pool Configuration</div>
          <div className="card-body space-y-3">
            <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
              <span className="text-gray-400">Stratum</span>
              <code className="text-[#e77d11]">mining-mars.com:3433</code>
            </div>
            <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
              <span className="text-gray-400">Pool Fee</span>
              <span className="text-[#f4e3d7]">0.5%</span>
            </div>
            <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
              <span className="text-gray-400">Solo Fee</span>
              <span className="text-[#f4e3d7]">1%</span>
            </div>
            <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
              <span className="text-gray-400">Min Payout</span>
              <span className="text-[#f4e3d7]">0.001 MARS</span>
            </div>
            <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
              <span className="text-gray-400">Payout Interval</span>
              <span className="text-[#f4e3d7]">Every 3 hours</span>
            </div>
            <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
              <span className="text-gray-400">Stratum Status</span>
              <span className="badge-online">Online</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Node Status</span>
              <span className={coin && coin.connections > 0 ? 'badge-online' : 'badge-offline'}>
                {coin && coin.connections > 0 ? 'Synced' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hashrate History */}
      <div className="card mb-8">
        <div className="card-header">Hashrate History (24h)</div>
        <div className="card-body">
          {hashrateHistory.length > 0 ? (
            <div className="h-48 flex items-end gap-px">
              {hashrateHistory.map((point: { time: number; hashrate: number }, i: number) => {
                const maxH = Math.max(...hashrateHistory.map((p: { hashrate: number }) => Number(p.hashrate)));
                const pct = maxH > 0 ? (Number(point.hashrate) / maxH) * 100 : 0;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-[#c1440e] to-[#e77d11] rounded-t opacity-80 hover:opacity-100 transition-opacity relative group min-w-[2px]"
                    style={{ height: `${Math.max(pct, 2)}%` }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#1a1a2e] border border-[#2d3a5c] rounded px-2 py-1 text-xs whitespace-nowrap z-10">
                      {formatHashrate(Number(point.hashrate))}
                      <br />
                      <span className="text-gray-500">{formatTime(point.time)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hashrate data available for the last 24 hours</p>
          )}
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="card">
        <div className="card-header">Recent Payouts</div>
        <div className="card-body">
          {payouts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Address</th>
                    <th>Amount</th>
                    <th>TX</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.slice(0, 20).map((p: PayoutRow) => (
                    <tr key={p.id}>
                      <td className="text-gray-400">{timeAgo(p.time)}</td>
                      <td className="font-mono text-sm">
                        {p.username ? `${p.username.substring(0, 8)}...${p.username.slice(-6)}` : '—'}
                      </td>
                      <td className="text-[#e77d11]">{p.amount?.toFixed(8)} {p.symbol || 'MARS'}</td>
                      <td className="font-mono text-xs">
                        {p.tx ? (
                          <a
                            href={`https://explore.marscoin.org/tx/${p.tx}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#e77d11] hover:underline"
                          >
                            {p.tx.substring(0, 12)}...
                          </a>
                        ) : '—'}
                      </td>
                      <td>
                        <span className={p.completed ? 'badge-online' : 'badge-pending'}>
                          {p.completed ? 'Complete' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No payouts recorded yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
