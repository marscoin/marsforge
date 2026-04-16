import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Read cookie file for marsqnet RPC auth
async function readCookie(): Promise<string> {
  try {
    const fs = await import('fs/promises');
    const data = await fs.readFile('/var/lib/marscoin-marsqnet/regtest/.cookie', 'utf8');
    return data.trim();
  } catch {
    return '';
  }
}

async function rpcCall(method: string, params: unknown[] = []) {
  const cookie = await readCookie();
  const [user, pass] = cookie.split(':');

  const res = await fetch('http://127.0.0.1:49332/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64'),
    },
    body: JSON.stringify({
      jsonrpc: '1.0',
      id: 1,
      method,
      params,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`RPC ${method} failed: HTTP ${res.status}`);
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(`RPC ${method} error: ${data.error.message}`);
  }
  return data.result;
}

export async function GET() {
  try {
    const [miningInfo, networkInfo, blockchainInfo, mempoolInfo] = await Promise.all([
      rpcCall('getmininginfo'),
      rpcCall('getnetworkinfo'),
      rpcCall('getblockchaininfo'),
      rpcCall('getmempoolinfo'),
    ]);

    // Get last few block details
    const height = miningInfo.blocks;
    const recentBlocks = [];
    for (let i = height; i > Math.max(0, height - 10); i--) {
      try {
        const hash = await rpcCall('getblockhash', [i]);
        const block = await rpcCall('getblock', [hash]);
        recentBlocks.push({
          height: block.height,
          hash: block.hash,
          time: block.time,
          txCount: block.nTx,
          size: block.size,
          difficulty: block.difficulty,
          confirmations: block.confirmations,
        });
      } catch {
        break;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        chain: blockchainInfo.chain,
        blocks: miningInfo.blocks,
        difficulty: miningInfo.difficulty,
        networkHashrate: miningInfo.networkhashps,
        connections: networkInfo.connections,
        version: networkInfo.subversion,
        protocolVersion: networkInfo.protocolversion,
        mempool: {
          size: mempoolInfo.size,
          bytes: mempoolInfo.bytes,
        },
        bestBlockHash: blockchainInfo.bestblockhash,
        chainWork: blockchainInfo.chainwork,
        recentBlocks,
      },
    });
  } catch (error) {
    console.error('Testnet API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch testnet data' },
      { status: 500 }
    );
  }
}
