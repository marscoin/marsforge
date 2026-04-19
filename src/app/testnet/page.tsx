'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

function formatHashrate(h: number) {
  if (!h || h === 0) return '0 H/s';
  if (h >= 1e12) return `${(h / 1e12).toFixed(2)} TH/s`;
  if (h >= 1e9) return `${(h / 1e9).toFixed(2)} GH/s`;
  if (h >= 1e6) return `${(h / 1e6).toFixed(2)} MH/s`;
  if (h >= 1e3) return `${(h / 1e3).toFixed(2)} KH/s`;
  return `${h.toFixed(2)} H/s`;
}

interface TestnetData {
  chain: string;
  blocks: number;
  difficulty: number;
  networkHashrate: number;
  connections: number;
  version: string;
  protocolVersion: number;
  mempool: { size: number; bytes: number };
  bestBlockHash: string;
  chainWork: string;
  recentBlocks: { height: number; hash: string; time: number; txCount: number; size: number; difficulty: number }[];
}

export default function TestnetPage() {
  const { data, isLoading } = useSWR('/api/testnet', fetcher, { refreshInterval: 10000 });

  const testnet: TestnetData | null = data?.success ? data.data : null;

  // Pool stratum for marsqnet
  const stratumReady = true;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500 py-20">Connecting to marsqnet node...</div>
      </div>
    );
  }

  if (!testnet) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <p className="text-red-400 text-lg mb-2">Testnet node offline</p>
          <p className="text-gray-500 text-sm">The marsqnet node is not responding.</p>
        </div>
      </div>
    );
  }

  // Estimate block time from difficulty
  const blockReward = 50; // marsqnet coinbase value
  const networkHashrate = testnet.networkHashrate;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Quantum Testnet Pool
            </span>
          </h1>
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-900/50 text-purple-300 border border-purple-700">
            marsqnet
          </span>
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-900/50 text-green-400 border border-green-700">
            RandomX
          </span>
        </div>
        <p className="text-gray-400">
          CPU-minable testnet for Marscoin&apos;s quantum-resistant future. No ASICs, no special hardware &mdash; just your CPU.
        </p>
      </div>

      {/* Node Status */}
      <div className="card mb-6 border-purple-800/50">
        <div className="card-body flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${testnet.connections > 0 ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <div>
              <p className="text-sm text-[#f4e3d7]">
                Node {testnet.version}
              </p>
              <p className="text-xs text-gray-500">{testnet.connections} peer{testnet.connections !== 1 ? 's' : ''} connected</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-300 font-semibold">Height {testnet.blocks}</p>
            <p className="text-xs text-gray-500">
              <a href="https://explore.marscoin.org/marsqnet/" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">
                View in Explorer
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Mining Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="card-body text-center">
            <p className="stat-label">Network Hashrate</p>
            <p className="text-2xl font-bold text-purple-400">{formatHashrate(networkHashrate)}</p>
            <p className="text-xs text-gray-500">All miners combined</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="stat-label">Difficulty</p>
            <p className="text-2xl font-bold text-purple-400">
              {testnet.difficulty < 1 ? testnet.difficulty.toFixed(6) : testnet.difficulty.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Current target</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="stat-label">Block Reward</p>
            <p className="text-2xl font-bold text-purple-400">{blockReward} MARS</p>
            <p className="text-xs text-gray-500">Per block (testnet)</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="stat-label">Pool Stratum</p>
            <p className="text-2xl font-bold text-yellow-400">
              {stratumReady ? 'Online' : 'Soon'}
            </p>
            <p className="text-xs text-gray-500">{stratumReady ? 'Port 3434' : 'Building stratum...'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* How to Mine */}
        <div className="card">
          <div className="card-header text-purple-400">How to Mine</div>
          <div className="card-body space-y-5">
            {/* Step 1: Download */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Step 1 &mdash; Download XMRig</p>
              <p className="text-sm text-gray-400 mb-3">
                The industry-standard RandomX miner. Works on any modern CPU.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://github.com/xmrig/xmrig/releases"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium hover:from-purple-500 hover:to-indigo-500 transition"
                >
                  Download XMRig &rarr;
                </a>
                <a
                  href="https://xmrig.com/wizard"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a2e] border border-[#2d3a5c] text-purple-300 text-sm hover:bg-[#1e2746] transition"
                >
                  Config Wizard
                </a>
                <a
                  href="https://github.com/xmrig/xmrig"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a2e] border border-[#2d3a5c] text-gray-400 text-sm hover:bg-[#1e2746] transition"
                >
                  Source
                </a>
              </div>
            </div>

            {/* Step 2: Run */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Step 2 &mdash; Run the miner</p>
              <p className="text-sm text-gray-400 mb-2">
                From the xmrig folder, run:
              </p>
              <code className="block bg-[#1a1a2e] p-3 rounded-lg text-purple-300 text-sm border border-[#2d3a5c] overflow-x-auto whitespace-nowrap">
                ./xmrig -a rx/0 -o stratum+tcp://mining-mars.com:3434 -u WORKER_NAME -p x
              </code>
              <p className="text-xs text-gray-500 mt-2">
                Replace <code className="text-purple-300">WORKER_NAME</code> with any identifier (e.g. <code>alice.laptop</code>). Addresses aren&apos;t required on testnet.
              </p>
            </div>

            {/* Pool specs */}
            <div className="border-t border-[#2d3a5c] pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pool Specs</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Algorithm</span>
                  <span className="text-purple-300 font-mono">rx/0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Port</span>
                  <span className="text-purple-300 font-mono">3434</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Share diff</span>
                  <span className="text-purple-300 font-mono">1000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hardware</span>
                  <span className="text-purple-300">Any CPU</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why RandomX */}
        <div className="card">
          <div className="card-header text-purple-400">Why RandomX?</div>
          <div className="card-body text-sm text-gray-400 space-y-3">
            <div className="flex gap-3">
              <span className="text-purple-400 text-lg">&#x1F4BB;</span>
              <div>
                <p className="text-[#f4e3d7] font-medium">CPU-Friendly</p>
                <p>Mine with any laptop or desktop. No GPUs or ASICs needed.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-purple-400 text-lg">&#x1F512;</span>
              <div>
                <p className="text-[#f4e3d7] font-medium">Quantum Resistant</p>
                <p>Preparing the network for post-quantum cryptography.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-purple-400 text-lg">&#x1F30D;</span>
              <div>
                <p className="text-[#f4e3d7] font-medium">True Decentralization</p>
                <p>When anyone can mine, no single entity controls the hashrate.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Network Details */}
      <div className="card">
        <div className="card-header text-purple-400">Network Details</div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
              <span className="text-gray-400">Chain</span>
              <span className="text-[#f4e3d7]">{testnet.chain}</span>
            </div>
            <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
              <span className="text-gray-400">P2P Port</span>
              <span className="text-[#f4e3d7]">49338</span>
            </div>
            <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
              <span className="text-gray-400">Node Version</span>
              <span className="text-[#f4e3d7]">{testnet.version}</span>
            </div>
            <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
              <span className="text-gray-400">Protocol</span>
              <span className="text-[#f4e3d7]">{testnet.protocolVersion}</span>
            </div>
            <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
              <span className="text-gray-400">Block Height</span>
              <span className="text-[#f4e3d7]">{testnet.blocks}</span>
            </div>
            <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
              <span className="text-gray-400">Peers</span>
              <span className="text-[#f4e3d7]">{testnet.connections}</span>
            </div>
            <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
              <span className="text-gray-400">Mempool</span>
              <span className="text-[#f4e3d7]">{testnet.mempool.size} tx ({testnet.mempool.bytes} bytes)</span>
            </div>
            <div className="flex justify-between border-b border-[#2d3a5c] pb-2">
              <span className="text-gray-400">Explorer</span>
              <a href="https://explore.marscoin.org/marsqnet/" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">
                explore.marscoin.org/marsqnet
              </a>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-1">Best Block Hash</p>
            <p className="font-mono text-xs text-gray-400 break-all">{testnet.bestBlockHash}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
