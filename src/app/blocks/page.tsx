'use client';

import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

function timeAgo(unix: number) {
  if (!unix) return '—';
  const seconds = Math.floor(Date.now() / 1000 - unix);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function formatDifficulty(d: number) {
  if (!d) return '—';
  if (d >= 1e9) return `${(d / 1e9).toFixed(2)}G`;
  if (d >= 1e6) return `${(d / 1e6).toFixed(2)}M`;
  if (d >= 1e3) return `${(d / 1e3).toFixed(2)}K`;
  return d.toFixed(2);
}

interface Block {
  id: number;
  coin_id: number;
  height: number;
  time: number;
  amount: number;
  confirmations: number;
  difficulty: number;
  difficulty_user: number;
  blockhash: string;
  category: string;
  algo: string;
  solo: number;
  effort: number;
  symbol: string;
  coin_name: string;
}

function CategoryBadge({ category }: { category: string }) {
  const styles: Record<string, string> = {
    generate: 'bg-green-900/50 text-green-400 border-green-700',
    immature: 'bg-yellow-900/50 text-yellow-400 border-yellow-700',
    orphan: 'bg-red-900/50 text-red-400 border-red-700',
    new: 'bg-blue-900/50 text-blue-400 border-blue-700',
  };
  const style = styles[category] || 'bg-gray-900/50 text-gray-400 border-gray-700';

  return (
    <span className={`px-2 py-0.5 rounded text-xs border ${style}`}>
      {category || 'confirmed'}
    </span>
  );
}

export default function BlocksPage() {
  const [page, setPage] = useState(0);
  const limit = 25;

  const { data, isLoading } = useSWR(
    `/api/blocks?limit=${limit}&offset=${page * limit}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  const blocks: Block[] = data?.data?.blocks || data?.data || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-[#e77d11] to-[#c1440e] bg-clip-text text-transparent">
            Blocks Found
          </span>
        </h1>
        <p className="text-gray-400">
          {total > 0 ? `${total.toLocaleString()} blocks found by the pool` : 'Pool block history'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="card-body text-center">
            <p className="stat-label">Total Blocks</p>
            <p className="stat-value text-lg">{total.toLocaleString()}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="stat-label">Confirmed</p>
            <p className="stat-value text-lg text-green-400">
              {blocks.filter((b: Block) => b.category === 'generate').length}
            </p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="stat-label">Immature</p>
            <p className="stat-value text-lg text-yellow-400">
              {blocks.filter((b: Block) => b.category === 'immature').length}
            </p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="stat-label">Orphaned</p>
            <p className="stat-value text-lg text-red-400">
              {blocks.filter((b: Block) => b.category === 'orphan').length}
            </p>
          </div>
        </div>
      </div>

      {/* Blocks Table */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <span>Block History</span>
          {totalPages > 1 && (
            <span className="text-sm text-gray-400">
              Page {page + 1} of {totalPages}
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center text-gray-500 py-12">Loading blocks...</div>
          ) : blocks.length === 0 ? (
            <div className="text-center text-gray-500 py-12">No blocks found yet</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Height</th>
                  <th>Coin</th>
                  <th>Time</th>
                  <th>Reward</th>
                  <th>Difficulty</th>
                  <th>Confirmations</th>
                  <th>Block Hash</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((block: Block) => (
                  <tr key={block.id} className="hover:bg-[#1e2746]/50">
                    <td className="font-mono font-semibold text-[#f4e3d7]">
                      {block.height?.toLocaleString()}
                    </td>
                    <td>
                      <span className="text-[#e77d11]">{block.symbol}</span>
                    </td>
                    <td className="text-gray-400 whitespace-nowrap">{timeAgo(block.time)}</td>
                    <td className="text-[#e77d11]">
                      {block.amount?.toFixed(4)} {block.symbol}
                      {block.solo ? <span className="ml-1 text-xs text-purple-400">(solo)</span> : null}
                    </td>
                    <td className="text-gray-400">{formatDifficulty(block.difficulty)}</td>
                    <td className="text-gray-400">{block.confirmations ?? '—'}</td>
                    <td className="font-mono text-xs text-gray-500">
                      {block.blockhash ? (
                        <a
                          href={`https://explore.marscoin.org/block/${block.blockhash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#e77d11] hover:underline"
                        >
                          {block.blockhash.substring(0, 16)}...
                        </a>
                      ) : '—'}
                    </td>
                    <td><CategoryBadge category={block.category} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-[#2d3a5c] flex justify-between items-center">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 rounded-lg text-sm border border-[#2d3a5c] text-gray-300 hover:bg-[#1e2746] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (page < 3) {
                  pageNum = i;
                } else if (page > totalPages - 4) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded text-sm ${
                      page === pageNum
                        ? 'bg-gradient-to-r from-[#e77d11] to-[#c1440e] text-white'
                        : 'text-gray-400 hover:bg-[#1e2746]'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 rounded-lg text-sm border border-[#2d3a5c] text-gray-300 hover:bg-[#1e2746] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
