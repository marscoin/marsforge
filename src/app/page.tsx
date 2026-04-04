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
  const { data, error, isLoading } = useSWR('/api/blocks?limit=5', fetcher, {
    refreshInterval: 30000
  });

  if (isLoading) return (
    <div className="card">
      <div className="card-header">Recent Blocks</div>
      <div className="card-body text-center text-gray-500">Loading...</div>
    </div>
  );

  // Mock data for display if API not connected
  const blocks = data?.data || [
    { height: 3443974, time: Date.now()/1000, amount: 0.195, category: 'generate', symbol: 'MARS' },
    { height: 3443973, time: Date.now()/1000 - 180, amount: 0.195, category: 'generate', symbol: 'MARS' },
    { height: 3443972, time: Date.now()/1000 - 420, amount: 0.195, category: 'generate', symbol: 'MARS' },
  ];

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
            {blocks.map((block: any, i: number) => (
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

  // Extract stats or use defaults
  const coin = poolData?.data?.[0] || {};
  const hashrate = coin.hashrate || 0;
  const workers = coin.workers || 0;
  const difficulty = coin.difficulty || 0;

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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Pool Hashrate"
          value={formatHashrate(hashrate)}
          subtitle="Combined mining power"
        />
        <StatCard
          title="Active Workers"
          value={workers.toString()}
          subtitle="Mining devices"
        />
        <StatCard
          title="Network Difficulty"
          value={difficulty ? `${(difficulty/1000).toFixed(1)}K` : '—'}
          subtitle="Current difficulty"
        />
        <StatCard
          title="Block Reward"
          value="0.195 MARS"
          subtitle="Per block found"
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
