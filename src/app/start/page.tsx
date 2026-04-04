'use client';

import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const miners = [
  {
    name: 'cpuminer-multi',
    platform: 'CPU',
    url: 'https://github.com/tpruvot/cpuminer-multi',
    command: './cpuminer -a scrypt -o stratum+tcp://mining-mars.com:3433 -u YOUR_MARS_ADDRESS.worker1 -p c=MARS',
  },
  {
    name: 'cgminer',
    platform: 'GPU / ASIC',
    url: 'https://github.com/ckolivas/cgminer',
    command: './cgminer --scrypt -o stratum+tcp://mining-mars.com:3433 -u YOUR_MARS_ADDRESS.worker1 -p c=MARS',
  },
  {
    name: 'bfgminer',
    platform: 'FPGA / ASIC',
    url: 'https://github.com/luke-jr/bfgminer',
    command: './bfgminer -S all --scrypt -o stratum+tcp://mining-mars.com:3433 -u YOUR_MARS_ADDRESS.worker1 -p c=MARS',
  },
];

function StepCard({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#e77d11] to-[#c1440e] flex items-center justify-center text-white font-bold text-lg">
            {step}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#f4e3d7] mb-2">{title}</h3>
            <div className="text-gray-400 text-sm space-y-2">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2 py-1 rounded bg-[#2d3a5c] text-[#e77d11] hover:bg-[#3d4a6c] transition-colors"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function EarningsCalculator() {
  const [hashrate, setHashrate] = useState('100');
  const [unit, setUnit] = useState('GH');
  const { data: poolData } = useSWR('/api/pool', fetcher);

  const stats = poolData?.data || {};
  const coin = Array.isArray(stats.coins) ? stats.coins[0] : null;
  const netDiff = coin?.difficulty || 1000000;
  const reward = coin?.reward || 0.1953125;
  const blockTime = coin?.block_time || 120;

  // Convert input to H/s
  const multipliers: Record<string, number> = { 'MH': 1e6, 'GH': 1e9, 'TH': 1e12 };
  const hashrateHs = parseFloat(hashrate || '0') * (multipliers[unit] || 1e9);

  // Network hashrate from difficulty: H/s = diff * 2^32 / block_time
  const networkHashrate = (netDiff * Math.pow(2, 32)) / blockTime;
  const poolShare = networkHashrate > 0 ? hashrateHs / networkHashrate : 0;

  // Expected blocks per day
  const blocksPerDay = (86400 / blockTime) * poolShare;
  const dailyMars = blocksPerDay * reward;
  const weeklyMars = dailyMars * 7;
  const monthlyMars = dailyMars * 30;

  return (
    <div className="mt-12 card">
      <div className="card-header">Earnings Calculator</div>
      <div className="card-body">
        <p className="text-sm text-gray-400 mb-4">
          Estimate your daily earnings based on your hashrate. These are approximations assuming current network conditions.
        </p>
        <div className="flex gap-3 mb-6">
          <input
            type="number"
            value={hashrate}
            onChange={(e) => setHashrate(e.target.value)}
            className="input flex-1 max-w-[200px]"
            placeholder="Hashrate"
            min="0"
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="input w-24"
          >
            <option value="MH">MH/s</option>
            <option value="GH">GH/s</option>
            <option value="TH">TH/s</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1a1a2e] rounded-lg p-4 border border-[#2d3a5c] text-center">
            <p className="text-gray-500 text-sm mb-1">Daily</p>
            <p className="text-2xl font-bold text-[#e77d11]">{dailyMars.toFixed(4)}</p>
            <p className="text-xs text-gray-500">MARS / day</p>
          </div>
          <div className="bg-[#1a1a2e] rounded-lg p-4 border border-[#2d3a5c] text-center">
            <p className="text-gray-500 text-sm mb-1">Weekly</p>
            <p className="text-2xl font-bold text-[#e77d11]">{weeklyMars.toFixed(4)}</p>
            <p className="text-xs text-gray-500">MARS / week</p>
          </div>
          <div className="bg-[#1a1a2e] rounded-lg p-4 border border-[#2d3a5c] text-center">
            <p className="text-gray-500 text-sm mb-1">Monthly</p>
            <p className="text-2xl font-bold text-[#e77d11]">{monthlyMars.toFixed(4)}</p>
            <p className="text-xs text-gray-500">MARS / month</p>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <p>Network difficulty: {netDiff.toLocaleString()} | Block reward: {reward} MARS | Block time: ~{blockTime}s</p>
          <p>Estimates assume constant difficulty and hashrate. Actual earnings may vary.</p>
        </div>
      </div>
    </div>
  );
}

export default function StartPage() {
  const [selectedMiner, setSelectedMiner] = useState(0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-[#e77d11] to-[#c1440e] bg-clip-text text-transparent">
            Start Mining Marscoin
          </span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Join the Martian Republic by mining MARS. Follow these steps to get started in minutes.
        </p>
      </div>

      <div className="space-y-6">
        <StepCard step={1} title="Get a Marscoin Wallet">
          <p>
            You need a MARS wallet address to receive mining rewards. Wallet addresses start with the letter <code className="text-[#e77d11]">M</code>.
          </p>
          <div className="flex gap-3 mt-3">
            <a
              href="https://marscoin.org"
              target="_blank"
              rel="noreferrer"
              className="btn-primary inline-block text-sm"
            >
              Download Wallet
            </a>
            <a
              href="https://explore.marscoin.org"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 border border-[#2d3a5c] text-[#e77d11] rounded-lg hover:bg-[#1e2746] text-sm"
            >
              Block Explorer
            </a>
          </div>
        </StepCard>

        <StepCard step={2} title="Choose Your Mining Software">
          <p>Pick a miner that matches your hardware. Marscoin uses the <code className="text-[#e77d11]">scrypt</code> algorithm.</p>
          <div className="flex gap-2 mt-3">
            {miners.map((m, i) => (
              <button
                key={m.name}
                onClick={() => setSelectedMiner(i)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedMiner === i
                    ? 'bg-gradient-to-r from-[#e77d11] to-[#c1440e] text-white'
                    : 'bg-[#1e2746] border border-[#2d3a5c] text-gray-300 hover:border-[#e77d11]'
                }`}
              >
                {m.name}
                <span className="block text-xs opacity-70">{m.platform}</span>
              </button>
            ))}
          </div>
          <div className="mt-3">
            <a
              href={miners[selectedMiner].url}
              target="_blank"
              rel="noreferrer"
              className="text-[#e77d11] hover:underline text-sm"
            >
              Download {miners[selectedMiner].name} →
            </a>
          </div>
        </StepCard>

        <StepCard step={3} title="Configure and Run">
          <p>
            Replace <code className="text-[#e77d11]">YOUR_MARS_ADDRESS</code> with your wallet address and <code className="text-[#e77d11]">worker1</code> with any name for this miner.
          </p>
          <div className="mt-3 relative">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">{miners[selectedMiner].name} command</span>
              <CopyButton text={miners[selectedMiner].command} />
            </div>
            <code className="block bg-[#1a1a2e] p-4 rounded-lg text-[#e77d11] text-sm overflow-x-auto border border-[#2d3a5c]">
              {miners[selectedMiner].command}
            </code>
          </div>
        </StepCard>

        <StepCard step={4} title="Monitor Your Mining">
          <p>
            Once your miner connects, you can track your hashrate, earnings, and workers by entering your wallet address on the dashboard.
          </p>
          <div className="mt-3">
            <a href="/" className="btn-primary inline-block text-sm">
              Go to Dashboard
            </a>
          </div>
        </StepCard>
      </div>

      {/* Earnings Calculator */}
      <EarningsCalculator />

      {/* Pool Details */}
      <div className="mt-12 card">
        <div className="card-header">Pool Details</div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
                <span className="text-gray-400">Stratum URL</span>
                <code className="text-[#e77d11]">stratum+tcp://mining-mars.com:3433</code>
              </div>
              <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
                <span className="text-gray-400">Algorithm</span>
                <span className="text-[#f4e3d7]">Scrypt</span>
              </div>
              <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
                <span className="text-gray-400">Port</span>
                <span className="text-[#f4e3d7]">3433</span>
              </div>
              <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
                <span className="text-gray-400">Difficulty</span>
                <span className="text-[#f4e3d7]">Variable (auto-adjusted)</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
                <span className="text-gray-400">Pool Fee</span>
                <span className="text-[#f4e3d7]">0.5%</span>
              </div>
              <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
                <span className="text-gray-400">Solo Fee</span>
                <span className="text-[#f4e3d7]">1%</span>
              </div>
              <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
                <span className="text-gray-400">Minimum Payout</span>
                <span className="text-[#f4e3d7]">0.001 MARS</span>
              </div>
              <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
                <span className="text-gray-400">Payout Frequency</span>
                <span className="text-[#f4e3d7]">Every 3 hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Options */}
      <div className="mt-6 card">
        <div className="card-header">Password Options</div>
        <div className="card-body">
          <p className="text-gray-400 text-sm mb-4">
            The password field in your miner configuration supports these options:
          </p>
          <div className="overflow-x-auto">
            <table className="data-table text-sm">
              <thead>
                <tr>
                  <th>Option</th>
                  <th>Example</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code className="text-[#e77d11]">c=SYMBOL</code></td>
                  <td><code>c=MARS</code></td>
                  <td className="text-gray-400">Select coin to mine</td>
                </tr>
                <tr>
                  <td><code className="text-[#e77d11]">d=DIFF</code></td>
                  <td><code>d=128</code></td>
                  <td className="text-gray-400">Set fixed difficulty</td>
                </tr>
                <tr>
                  <td><code className="text-[#e77d11]">m=solo</code></td>
                  <td><code>m=solo</code></td>
                  <td className="text-gray-400">Enable solo mining mode</td>
                </tr>
                <tr>
                  <td><code className="text-[#e77d11]">m=party.NAME</code></td>
                  <td><code>m=party.mars</code></td>
                  <td className="text-gray-400">Join a party mining group</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-500 text-xs mt-3">
            Combine options with commas: <code className="text-[#e77d11]">c=MARS,d=128</code>
          </p>
        </div>
      </div>
    </div>
  );
}
