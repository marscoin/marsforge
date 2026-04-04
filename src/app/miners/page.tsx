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

function timeAgo(unix: number) {
  if (!unix) return 'never';
  const seconds = Math.floor(Date.now() / 1000 - unix);
  if (seconds < 0) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function truncateAddress(addr: string) {
  if (!addr || addr.length < 16) return addr;
  return `${addr.substring(0, 10)}...${addr.slice(-8)}`;
}

interface Miner {
  id: number;
  username: string;
  balance: number;
  coinid: number;
  coinsymbol: string;
  last_earning: number;
  symbol: string;
  coin_name: string;
  worker_count: number;
  hashrate: number | null;
}

export default function MinersPage() {
  const { data: minersData, isLoading } = useSWR('/api/miners', fetcher, { refreshInterval: 30000 });
  const { data: poolData } = useSWR('/api/pool', fetcher, { refreshInterval: 30000 });

  const miners: Miner[] = minersData?.data || [];
  const stats = poolData?.data || {};
  const hashrate = Array.isArray(stats.hashstats) && stats.hashstats[0] ? Number(stats.hashstats[0].hashrate) : 0;

  const activeMiners = miners.filter(m => m.hashrate && m.hashrate > 0);
  const inactiveMiners = miners.filter(m => !m.hashrate || m.hashrate === 0);
  const totalBalance = miners.reduce((sum, m) => sum + (m.balance || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-[#e77d11] to-[#c1440e] bg-clip-text text-transparent">
            Miners
          </span>
        </h1>
        <p className="text-gray-400">Active and recent miners on the pool</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="card-body text-center">
            <p className="stat-label">Total Miners</p>
            <p className="stat-value text-lg">{miners.length}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="stat-label">Active Now</p>
            <p className="stat-value text-lg text-green-400">{activeMiners.length}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="stat-label">Pool Hashrate</p>
            <p className="stat-value text-lg">{formatHashrate(hashrate)}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="stat-label">Pending Balance</p>
            <p className="stat-value text-lg">{totalBalance.toFixed(4)} MARS</p>
          </div>
        </div>
      </div>

      {/* Active Miners */}
      {activeMiners.length > 0 && (
        <div className="card mb-6">
          <div className="card-header flex justify-between items-center">
            <span>Active Miners</span>
            <span className="text-sm text-green-400">{activeMiners.length} mining now</span>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Hashrate</th>
                  <th>Workers</th>
                  <th>Balance</th>
                  <th>Coin</th>
                  <th>Last Earning</th>
                </tr>
              </thead>
              <tbody>
                {activeMiners.map((miner: Miner) => (
                  <tr key={miner.id} className="hover:bg-[#1e2746]/50">
                    <td className="font-mono text-sm">
                      <a href={`/wallet/${miner.username}`} className="text-[#e77d11] hover:underline">
                        {truncateAddress(miner.username)}
                      </a>
                    </td>
                    <td className="text-[#f4e3d7] font-semibold">{formatHashrate(Number(miner.hashrate))}</td>
                    <td className="text-gray-400">{miner.worker_count}</td>
                    <td className="text-[#e77d11]">{miner.balance?.toFixed(8)}</td>
                    <td className="text-gray-400">{miner.symbol || miner.coinsymbol || 'MARS'}</td>
                    <td className="text-gray-400">{timeAgo(miner.last_earning)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Miners */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <span>{activeMiners.length > 0 ? 'Inactive Miners' : 'All Miners'}</span>
          <span className="text-sm text-gray-400">{inactiveMiners.length} accounts</span>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center text-gray-500 py-12">Loading miners...</div>
          ) : inactiveMiners.length === 0 && activeMiners.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No miners registered yet</p>
              <a href="/start" className="btn-primary">Start Mining</a>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Workers</th>
                  <th>Balance</th>
                  <th>Coin</th>
                  <th>Last Earning</th>
                </tr>
              </thead>
              <tbody>
                {inactiveMiners.map((miner: Miner) => (
                  <tr key={miner.id} className="hover:bg-[#1e2746]/50 opacity-70">
                    <td className="font-mono text-sm">
                      <a href={`/wallet/${miner.username}`} className="text-[#e77d11] hover:underline">
                        {truncateAddress(miner.username)}
                      </a>
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded text-xs border bg-gray-900/50 text-gray-400 border-gray-700">
                        Inactive
                      </span>
                    </td>
                    <td className="text-gray-500">{miner.worker_count}</td>
                    <td className="text-gray-400">{miner.balance?.toFixed(8)}</td>
                    <td className="text-gray-500">{miner.symbol || miner.coinsymbol || 'MARS'}</td>
                    <td className="text-gray-500">{timeAgo(miner.last_earning)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
