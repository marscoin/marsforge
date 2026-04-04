'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const BLOCK_TIME = 120; // Marscoin block time in seconds

function formatHashrate(h: number) {
  if (!h || h === 0) return '0 H/s';
  if (h >= 1e12) return `${(h / 1e12).toFixed(2)} TH/s`;
  if (h >= 1e9) return `${(h / 1e9).toFixed(2)} GH/s`;
  if (h >= 1e6) return `${(h / 1e6).toFixed(2)} MH/s`;
  if (h >= 1e3) return `${(h / 1e3).toFixed(2)} KH/s`;
  return `${h.toFixed(0)} H/s`;
}

function formatTimeLabel(unix: number, range: string) {
  const d = new Date(unix * 1000);
  if (range === '168') return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface RawPoint {
  time: number;
  difficulty: number;
  pool_hashrate: number;
}

const ranges = [
  { label: '24H', value: '24' },
  { label: '7D', value: '168' },
  { label: '30D', value: '720' },
];

export default function NetworkChart({ algo = 'scrypt' }: { algo?: string }) {
  const [hours, setHours] = useState('24');
  const { data, isLoading } = useSWR(
    `/api/network?algo=${algo}&hours=${hours}`,
    fetcher,
    { refreshInterval: 120000 }
  );

  const points = (data?.data || []).map((p: RawPoint) => ({
    time: p.time,
    network: (Number(p.difficulty) * Math.pow(2, 32)) / BLOCK_TIME,
    pool: Number(p.pool_hashrate),
  }));

  const latestNet = points.length > 0 ? points[points.length - 1].network : 0;
  const latestPool = points.length > 0 ? points[points.length - 1].pool : 0;
  const poolPct = latestNet > 0 ? ((latestPool / latestNet) * 100).toFixed(2) : '0';

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center">
        <span>Network vs Pool Hashrate</span>
        <div className="flex gap-1">
          {ranges.map(r => (
            <button
              key={r.value}
              onClick={() => setHours(r.value)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                hours === r.value
                  ? 'bg-gradient-to-r from-[#e77d11] to-[#c1440e] text-white'
                  : 'bg-[#1a1a2e] text-gray-400 hover:text-[#e77d11] border border-[#2d3a5c]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="card-body">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-center text-sm">
          <div>
            <p className="text-gray-500">Network</p>
            <p className="text-[#f4e3d7] font-semibold">{formatHashrate(latestNet)}</p>
          </div>
          <div>
            <p className="text-gray-500">Pool</p>
            <p className="text-[#e77d11] font-semibold">{formatHashrate(latestPool)}</p>
          </div>
          <div>
            <p className="text-gray-500">Pool Share</p>
            <p className="text-green-400 font-semibold">{poolPct}%</p>
          </div>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-gray-500">Loading chart...</div>
        ) : points.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No network data for this period
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="poolGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e77d11" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#e77d11" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3a5c" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(t) => formatTimeLabel(t, hours)}
                  stroke="#555"
                  fontSize={11}
                  interval="preserveStartEnd"
                  minTickGap={50}
                />
                <YAxis
                  tickFormatter={(v) => formatHashrate(v)}
                  stroke="#555"
                  fontSize={11}
                  width={70}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #2d3a5c',
                    borderRadius: '8px',
                    fontSize: 12,
                  }}
                  labelFormatter={(t) => new Date(Number(t) * 1000).toLocaleString()}
                  formatter={(value) => [formatHashrate(Number(value))]}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                <Area
                  type="monotone"
                  dataKey="network"
                  name="Network"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#netGradient)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="pool"
                  name="Pool"
                  stroke="#e77d11"
                  strokeWidth={2}
                  fill="url(#poolGradient2)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
