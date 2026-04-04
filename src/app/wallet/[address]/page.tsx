'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

function timeAgo(unix: number) {
  if (!unix) return 'never';
  const seconds = Math.floor(Date.now() / 1000 - unix);
  if (seconds < 0) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

interface Worker {
  id: number;
  name: string;
  difficulty: number;
  time: number;
  algo: string;
  ip: string;
  version: string;
}

interface Balance {
  id: number;
  username: string;
  balance: number;
  donation: number;
  symbol: string;
}

interface Earning {
  coinid: number;
  amount: number;
  create_time: number;
  status: number;
  symbol: string;
  coin_name: string;
}

function earningStatus(status: number): { label: string; className: string } {
  switch (status) {
    case 0: return { label: 'Pending', className: 'bg-yellow-900/50 text-yellow-400 border-yellow-700' };
    case 1: return { label: 'Confirmed', className: 'bg-green-900/50 text-green-400 border-green-700' };
    case 2: return { label: 'Paid', className: 'bg-blue-900/50 text-blue-400 border-blue-700' };
    default: return { label: 'Unknown', className: 'bg-gray-900/50 text-gray-400 border-gray-700' };
  }
}

export default function WalletPage() {
  const params = useParams();
  const address = params.address as string;

  const { data, isLoading, error } = useSWR(
    address ? `/api/wallet/${address}` : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  const walletData = data?.data || {};
  const workers: Worker[] = walletData.workers || [];
  const balances: Balance[] = walletData.balance || [];
  const earnings: Earning[] = walletData.earnings || [];

  const totalBalance = balances.reduce((sum: number, b: Balance) => sum + (b.balance || 0), 0);
  const totalEarned = earnings.reduce((sum: number, e: Earning) => sum + (e.amount || 0), 0);
  const activeWorkers = workers.filter((w: Worker) => {
    const age = Date.now() / 1000 - w.time;
    return age < 600; // active in last 10 min
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500 py-20">Loading wallet data...</div>
      </div>
    );
  }

  if (error || (!data?.success && data)) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <p className="text-red-400 text-lg mb-4">Failed to load wallet data</p>
          <Link href="/" className="btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-gray-500 mb-1">Wallet</p>
        <h1 className="text-xl md:text-2xl font-bold text-[#f4e3d7] font-mono break-all">
          {address}
        </h1>
        <a
          href={`https://explore.marscoin.org/address/${address}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-[#e77d11] hover:underline mt-1 inline-block"
        >
          View on Explorer
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="card-body text-center">
            <p className="stat-label">Pending Balance</p>
            <p className="stat-value text-lg">{totalBalance.toFixed(8)}</p>
            <p className="text-xs text-gray-500">MARS</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="stat-label">Total Earned</p>
            <p className="stat-value text-lg">{totalEarned.toFixed(8)}</p>
            <p className="text-xs text-gray-500">MARS</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="stat-label">Active Workers</p>
            <p className="stat-value text-lg text-green-400">{activeWorkers.length}</p>
            <p className="text-xs text-gray-500">of {workers.length} total</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="stat-label">Donation</p>
            <p className="stat-value text-lg">
              {balances[0]?.donation !== undefined ? `${balances[0].donation}%` : '—'}
            </p>
            <p className="text-xs text-gray-500">to pool</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Workers */}
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <span>Workers</span>
            <span className="text-sm text-gray-400">{workers.length} total</span>
          </div>
          <div className="overflow-x-auto">
            {workers.length === 0 ? (
              <div className="card-body text-center text-gray-500 py-8">
                No workers found. Start mining to see your workers here.
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Difficulty</th>
                    <th>Algo</th>
                    <th>Last Seen</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((w: Worker) => {
                    const age = Date.now() / 1000 - w.time;
                    const isActive = age < 600;
                    return (
                      <tr key={w.id} className={isActive ? '' : 'opacity-50'}>
                        <td className="font-mono text-sm text-[#f4e3d7]">
                          {w.name?.split('.')[1] || w.name || '—'}
                        </td>
                        <td className="text-gray-400">{w.difficulty?.toLocaleString()}</td>
                        <td className="text-gray-400">{w.algo}</td>
                        <td className="text-gray-400">{timeAgo(w.time)}</td>
                        <td>
                          <span className={isActive ? 'badge-online' : 'px-2 py-0.5 rounded text-xs border bg-gray-900/50 text-gray-400 border-gray-700'}>
                            {isActive ? 'Online' : 'Offline'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Balance per coin */}
        <div className="card">
          <div className="card-header">Balances</div>
          <div className="card-body">
            {balances.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No balance found for this address</p>
            ) : (
              <div className="space-y-3">
                {balances.map((b: Balance) => (
                  <div key={b.id} className="flex justify-between items-center border-b border-[#2d3a5c] pb-3 last:border-0">
                    <div>
                      <p className="text-[#f4e3d7] font-medium">{b.symbol || 'MARS'}</p>
                      <p className="text-xs text-gray-500">Account #{b.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#e77d11] font-mono font-semibold">{b.balance?.toFixed(8)}</p>
                      <p className="text-xs text-gray-500">pending</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Earnings History */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <span>Earnings History</span>
          <span className="text-sm text-gray-400">{earnings.length} records</span>
        </div>
        <div className="overflow-x-auto">
          {earnings.length === 0 ? (
            <div className="card-body text-center text-gray-500 py-8">
              No earnings recorded yet for this address
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Coin</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((e: Earning, i: number) => {
                  const s = earningStatus(e.status);
                  return (
                    <tr key={i}>
                      <td className="text-gray-400">{timeAgo(e.create_time)}</td>
                      <td className="text-[#f4e3d7]">{e.symbol || e.coin_name || 'MARS'}</td>
                      <td className="text-[#e77d11] font-mono">{e.amount?.toFixed(8)}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-xs border ${s.className}`}>
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Back link */}
      <div className="mt-6 text-center">
        <Link href="/" className="text-[#e77d11] hover:underline text-sm">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
