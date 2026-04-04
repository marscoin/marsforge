'use client';

import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Stat card component
function StatCard({ title, value, subtitle, trend }: {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="card">
      <div className="card-body">
        <p className="stat-label">{title}</p>
        <p className="stat-value flex items-center gap-2">
          {value}
          {trend === 'up' && <span className="text-green-400 text-sm">↑</span>}
          {trend === 'down' && <span className="text-red-400 text-sm">↓</span>}
        </p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

// Wallet lookup component
function WalletLookup() {
  const [wallet, setWallet] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wallet.startsWith('M')) {
      window.location.href = `/wallet/${wallet}`;
    }
  };

  return (
    <div className="card">
      <div className="card-header">Check Your Stats</div>
      <div className="card-body">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter your MARS wallet address..."
            className="input flex-1"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
          />
          <button type="submit" className="btn-primary whitespace-nowrap">
            Look Up
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Wallet addresses start with M
        </p>
      </div>
    </div>
  );
}

// Quick start guide
function QuickStart() {
  const stratumCmd = `-a scrypt -o stratum+tcp://mining-mars.com:3433 -u YOUR_MARS_WALLET.worker -p c=MARS`;

  return (
    <div className="card">
      <div className="card-header">Quick Start</div>
      <div className="card-body space-y-4">
        <div>
          <p className="text-sm text-gray-400 mb-2">Mining command:</p>
          <code className="block bg-[#1a1a2e] p-3 rounded text-sm text-[#e77d11] overflow-x-auto">
            {stratumCmd}
          </code>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Algorithm</p>
            <p className="text-[#f4e3d7]">Scrypt</p>
          </div>
          <div>
            <p className="text-gray-400">Port</p>
            <p className="text-[#f4e3d7]">3433</p>
          </div>
          <div>
            <p className="text-gray-400">Min Payout</p>
            <p className="text-[#f4e3d7]">0.001 MARS</p>
          </div>
          <div>
            <p className="text-gray-400">Fee</p>
            <p className="text-[#f4e3d7]">2% (Solo: 2%)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Recent blocks component
function RecentBlocks() {
  const { data, isLoading } = useSWR('/api/blocks?limit=5', fetcher, {
    refreshInterval: 30000
  });

  if (isLoading) return (
    <div className="card">
      <div className="card-header">Recent Blocks</div>
      <div className="card-body text-center text-gray-500">Loading...</div>
    </div>
  );

  // Extract blocks array from API response
  const rawData = data?.data;
  const blocks = Array.isArray(rawData) ? rawData
    : Array.isArray(rawData?.blocks) ? rawData.blocks
    : [];

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center">
        <span>Recent Blocks</span>
        <a href="/blocks" className="text-sm text-[#e77d11] hover:underline">View All →</a>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Height</th>
              <th>Time</th>
              <th>Reward</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((block: { height?: number; time: number; amount: number; category?: string; symbol: string }, i: number) => (
              <tr key={i}>
                <td className="font-mono">{block.height?.toLocaleString()}</td>
                <td className="text-gray-400">
                  {new Date(block.time * 1000).toLocaleTimeString()}
                </td>
                <td>{block.amount} {block.symbol}</td>
                <td>
                  <span className={block.category === 'generate' ? 'badge-online' : 'badge-pending'}>
                    {block.category || 'confirmed'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: poolData } = useSWR('/api/pool', fetcher, {
    refreshInterval: 30000
  });
  const { data: priceData } = useSWR('/api/price', fetcher, {
    refreshInterval: 300000
  });

  // Price data
  const priceInfo = priceData?.data?.data?.['154']?.quote?.USD;
  const usdPrice = priceInfo?.price || 0;
  const change24h = priceInfo?.percent_change_24h || 0;

  // Extract stats or use defaults
  const stats = poolData?.data || {};
  const coin = Array.isArray(stats.coins) ? stats.coins[0] : null;
  const hashrate = Array.isArray(stats.hashstats) && stats.hashstats[0] ? Number(stats.hashstats[0].hashrate) : 0;
  const workers = Array.isArray(stats.workers) && stats.workers[0] ? Number(stats.workers[0].count) : 0;
  const difficulty = coin?.difficulty || 0;
  const blockTime = coin?.block_time || 120;
  const reward = coin?.reward || 0.195;

  // Shares
  const shares = Array.isArray(stats.shareStats) && stats.shareStats[0] ? stats.shareStats[0] : null;
  const accepted = Number(shares?.accepted || 0);
  const rejected = Number(shares?.rejected || 0);
  const rejectRate = accepted + rejected > 0 ? (rejected / (accepted + rejected)) * 100 : 0;

  // Network hashrate = difficulty * 2^32 / block_time
  const networkHashrate = difficulty > 0 ? (difficulty * Math.pow(2, 32)) / blockTime : 0;
  const poolShare = networkHashrate > 0 ? (hashrate / networkHashrate) * 100 : 0;

  // Estimated time to block (seconds)
  const etbSeconds = poolShare > 0 ? blockTime / (poolShare / 100) : 0;
  const formatEtb = (s: number) => {
    if (s <= 0) return '—';
    if (s < 3600) return `${Math.round(s / 60)}m`;
    if (s < 86400) return `${(s / 3600).toFixed(1)}h`;
    return `${(s / 86400).toFixed(1)}d`;
  };

  // Format hashrate
  const formatHashrate = (h: number) => {
    if (h >= 1e12) return `${(h/1e12).toFixed(2)} TH/s`;
    if (h >= 1e9) return `${(h/1e9).toFixed(2)} GH/s`;
    if (h >= 1e6) return `${(h/1e6).toFixed(2)} MH/s`;
    if (h >= 1e3) return `${(h/1e3).toFixed(2)} KH/s`;
    return `${h} H/s`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-[#e77d11] via-[#ff6b35] to-[#c1440e] bg-clip-text text-transparent">
            MarsForge
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Forging the future on the Red Planet. Mine Marscoin to support the Martian Republic.
        </p>
      </div>

      {/* Stats Grid - two rows of 4 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          title="Pool Hashrate"
          value={formatHashrate(hashrate)}
          subtitle={poolShare > 0 ? `${poolShare.toFixed(2)}% of network` : '—'}
        />
        <StatCard
          title="Network Hashrate"
          value={formatHashrate(networkHashrate)}
          subtitle={`Difficulty: ${difficulty ? (difficulty/1000).toFixed(0) + 'K' : '—'}`}
        />
        <StatCard
          title="Active Workers"
          value={workers.toString()}
          subtitle="Connected miners"
        />
        <StatCard
          title="Est. Time to Block"
          value={formatEtb(etbSeconds)}
          subtitle="At current pool hashrate"
        />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Block Reward"
          value={`${reward} MARS`}
          subtitle={usdPrice > 0 ? `~$${(reward * usdPrice).toFixed(4)}` : ''}
        />
        <StatCard
          title="MARS Price"
          value={usdPrice > 0 ? `$${usdPrice.toFixed(4)}` : '—'}
          subtitle={usdPrice > 0 ? `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}% (24h)` : ''}
          trend={usdPrice > 0 ? (change24h >= 0 ? 'up' : 'down') : undefined}
        />
        <StatCard
          title="Shares (1h)"
          value={accepted.toLocaleString()}
          subtitle={`${rejectRate.toFixed(1)}% rejected`}
          trend={rejectRate > 5 ? 'down' : rejectRate > 0 ? 'neutral' : 'up'}
        />
        <StatCard
          title="Block Height"
          value={coin?.block_height ? coin.block_height.toLocaleString() : '—'}
          subtitle={`${coin?.connections || 0} peers connected`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <WalletLookup />
          <RecentBlocks />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          <QuickStart />

          {/* Network Status */}
          <div className="card">
            <div className="card-header">Network Status</div>
            <div className="card-body space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Stratum</span>
                <span className="badge-online">Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Node</span>
                <span className="badge-online">Synced</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mempool</span>
                <span className="text-[#f4e3d7]">0 tx</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="card">
            <div className="card-header">Resources</div>
            <div className="card-body">
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://marscoin.org" className="text-[#e77d11] hover:underline" target="_blank" rel="noreferrer">
                    → Get a Marscoin Wallet
                  </a>
                </li>
                <li>
                  <a href="https://explore.marscoin.org" className="text-[#e77d11] hover:underline" target="_blank" rel="noreferrer">
                    → Block Explorer
                  </a>
                </li>
                <li>
                  <a href="https://github.com/marscoin/marsforge" className="text-[#e77d11] hover:underline" target="_blank" rel="noreferrer">
                    → GitHub Repository
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
