'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const fetcher = (url: string) => fetch(url).then(res => res.json());

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
  if (range === '1') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (range === '24') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

interface DataPoint {
  time: number;
  hashrate: number;
  earnings?: number;
}

const ranges = [
  { label: '1H', value: '1' },
  { label: '24H', value: '24' },
  { label: '7D', value: '168' },
];

export default function HashrateChart({ algo = 'scrypt' }: { algo?: string }) {
  const [hours, setHours] = useState('24');
  const { data, isLoading } = useSWR(
    `/api/hashrate?algo=${algo}&hours=${hours}`,
    fetcher,
    { refreshInterval: 60000 }
  );

  const points: DataPoint[] = (data?.data || []).map((p: DataPoint) => ({
    ...p,
    hashrate: Number(p.hashrate),
  }));

  const avgHashrate = points.length > 0
    ? points.reduce((sum, p) => sum + p.hashrate, 0) / points.length
    : 0;

  const maxHashrate = points.length > 0
    ? Math.max(...points.map(p => p.hashrate))
    : 0;

  const minHashrate = points.length > 0
    ? Math.min(...points.map(p => p.hashrate))
    : 0;

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center">
        <span>Pool Hashrate</span>
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
        {/* Summary stats */}
        {points.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-4 text-center text-sm">
            <div>
              <p className="text-gray-500">Average</p>
              <p className="text-[#e77d11] font-semibold">{formatHashrate(avgHashrate)}</p>
            </div>
            <div>
              <p className="text-gray-500">Peak</p>
              <p className="text-green-400 font-semibold">{formatHashrate(maxHashrate)}</p>
            </div>
            <div>
              <p className="text-gray-500">Low</p>
              <p className="text-red-400 font-semibold">{formatHashrate(minHashrate)}</p>
            </div>
          </div>
        )}

        {/* Chart */}
        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-gray-500">Loading chart...</div>
        ) : points.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No hashrate data for this period
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="hashrateGradient" x1="0" y1="0" x2="0" y2="1">
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
                  formatter={(value) => [formatHashrate(Number(value)), 'Hashrate']}
                />
                <Area
                  type="monotone"
                  dataKey="hashrate"
                  stroke="#e77d11"
                  strokeWidth={2}
                  fill="url(#hashrateGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#e77d11', stroke: '#fff', strokeWidth: 1 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
