import mysql from 'mysql2/promise';

// YIIMP Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'yaamp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query<T>(sql: string, params?: (string | number | boolean | null)[]): Promise<T> {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

// Pool statistics
export async function getPoolStats() {
  const [coins] = await pool.execute(`
    SELECT
      c.id, c.name, c.symbol, c.algo, c.enable, c.auto_ready,
      c.difficulty, c.price, c.network_hash, c.block_height,
      c.connections, c.balance, c.available, c.reward, c.block_time
    FROM coins c
    WHERE c.enable = 1 AND c.auto_ready = 1
  `);

  const [hashstats] = await pool.execute(`
    SELECT algo, hashrate
    FROM hashstats
    ORDER BY time DESC
    LIMIT 1
  `);

  const [workers] = await pool.execute(`
    SELECT COUNT(*) as count
    FROM workers
  `);

  const [blockCount] = await pool.execute(`
    SELECT COUNT(*) as total FROM blocks
  `);

  const [lastBlock] = await pool.execute(`
    SELECT time FROM blocks ORDER BY time DESC LIMIT 1
  `);

  return { coins, hashstats, workers, blockCount, lastBlock };
}

// Get blocks with pagination
export async function getBlocks(limit = 50, offset = 0) {
  const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 100);
  const safeOffset = Math.max(0, Math.floor(offset));

  const [blocks] = await pool.query(`
    SELECT
      b.id, b.coin_id, b.height, b.time, b.amount, b.confirmations,
      b.difficulty, b.blockhash, b.category, b.algo, b.difficulty_user,
      b.solo, b.effort,
      c.symbol, c.name as coin_name
    FROM blocks b
    LEFT JOIN coins c ON b.coin_id = c.id
    ORDER BY b.time DESC
    LIMIT ${safeLimit} OFFSET ${safeOffset}
  `);

  const [countResult] = await pool.execute(`SELECT COUNT(*) as total FROM blocks`);

  return { blocks, total: (countResult as Array<{total: number}>)[0]?.total || 0 };
}

// Get recent blocks (simple)
export async function getRecentBlocks(limit = 20) {
  const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 100);
  const [blocks] = await pool.query(`
    SELECT
      b.id, b.coin_id, b.height, b.time, b.amount, b.confirmations,
      b.difficulty, b.blockhash, b.category,
      c.symbol, c.name as coin_name
    FROM blocks b
    LEFT JOIN coins c ON b.coin_id = c.id
    ORDER BY b.time DESC
    LIMIT ${safeLimit}
  `);
  return blocks;
}

// Get hashrate history for graphs
export async function getHashrateHistory(algo: string, hours = 24) {
  const [history] = await pool.execute(`
    SELECT time, hashrate, earnings
    FROM hashstats
    WHERE algo = ?
    AND time > UNIX_TIMESTAMP() - ? * 3600
    ORDER BY time ASC
  `, [algo, hours]);
  return history;
}

// Get detailed hashrate data with bad shares
export async function getHashrateDetailed(algo: string, hours = 24) {
  const [history] = await pool.execute(`
    SELECT time, hashrate, hashrate_bad, difficulty, earnings
    FROM hashrate
    WHERE algo = ?
    AND time > UNIX_TIMESTAMP() - ? * 3600
    ORDER BY time ASC
  `, [algo, hours]);
  return history;
}

// Get miners (accounts with recent hashrate activity)
export async function getMiners() {
  const [miners] = await pool.execute(`
    SELECT
      a.id, a.username, a.balance, a.coinid, a.coinsymbol, a.last_earning,
      c.symbol, c.name as coin_name,
      (SELECT COUNT(*) FROM workers w WHERE w.userid = a.id) as worker_count,
      (SELECT MAX(hu.hashrate) FROM hashuser hu WHERE hu.userid = a.id
        AND hu.time > UNIX_TIMESTAMP() - 3600) as hashrate
    FROM accounts a
    LEFT JOIN coins c ON a.coinid = c.id
    WHERE a.username != '' AND a.username != 'username'
    ORDER BY a.last_earning DESC
    LIMIT 100
  `);
  return miners;
}

// Get payouts
export async function getPayouts(limit = 50) {
  const [payouts] = await pool.execute(`
    SELECT
      p.id, p.account_id, p.time, p.completed, p.amount, p.fee, p.tx,
      a.username,
      c.symbol
    FROM payouts p
    LEFT JOIN accounts a ON p.account_id = a.id
    LEFT JOIN coins c ON p.idcoin = c.id
    ORDER BY p.time DESC
    LIMIT ?
  `, [limit]);
  return payouts;
}

// Get worker stats for a wallet
export async function getWalletStats(wallet: string) {
  const [workers] = await pool.execute(`
    SELECT
      w.id, w.name, w.difficulty, w.time, w.algo, w.ip, w.version
    FROM workers w
    WHERE w.name LIKE ?
    ORDER BY w.time DESC
  `, [`${wallet}%`]);
  return workers;
}

// Get earnings for a wallet
export async function getWalletEarnings(wallet: string) {
  const [earnings] = await pool.execute(`
    SELECT
      e.coinid, e.amount, e.create_time, e.status,
      c.symbol, c.name as coin_name
    FROM earnings e
    LEFT JOIN coins c ON e.coinid = c.id
    WHERE e.userid IN (
      SELECT id FROM accounts WHERE username = ?
    )
    ORDER BY e.create_time DESC
    LIMIT 100
  `, [wallet]);
  return earnings;
}

// Get account balance
export async function getWalletBalance(wallet: string) {
  const [balance] = await pool.execute(`
    SELECT
      a.id, a.username, a.balance, a.donation,
      c.symbol
    FROM accounts a
    LEFT JOIN coins c ON a.coinid = c.id
    WHERE a.username = ?
  `, [wallet]);
  return balance;
}

// Network hashrate history (derived from difficulty in hashrate table)
export async function getNetworkHashrateHistory(algo: string, hours = 24) {
  const [history] = await pool.execute(`
    SELECT time, difficulty, hashrate as pool_hashrate
    FROM hashrate
    WHERE algo = ?
    AND difficulty > 0
    AND time > UNIX_TIMESTAMP() - ? * 3600
    ORDER BY time ASC
  `, [algo, hours]);
  return history;
}

// Pool luck: compare actual blocks found vs expected
export async function getPoolLuck(hours = 24) {
  // Get blocks found in period
  const [blocksResult] = await pool.execute(`
    SELECT COUNT(*) as found
    FROM blocks
    WHERE time > UNIX_TIMESTAMP() - ? * 3600
  `, [hours]);
  const found = (blocksResult as Array<{ found: number }>)[0]?.found || 0;

  // Get average pool hashrate and network difficulty in period
  const [statsResult] = await pool.execute(`
    SELECT AVG(hashrate) as avg_hashrate
    FROM hashstats
    WHERE algo = 'scrypt'
    AND time > UNIX_TIMESTAMP() - ? * 3600
  `, [hours]);
  const avgHashrate = (statsResult as Array<{ avg_hashrate: number }>)[0]?.avg_hashrate || 0;

  // Get current network difficulty
  const [coinResult] = await pool.execute(`
    SELECT difficulty, block_time FROM coins WHERE symbol = 'MARS' AND enable = 1 LIMIT 1
  `);
  const coin = (coinResult as Array<{ difficulty: number; block_time: number }>)[0];
  const netDiff = coin?.difficulty || 1;

  // Expected blocks = (pool_hashrate / network_hashrate) * (seconds / block_time)
  // For scrypt: network_hash ~= difficulty * 2^32 / block_time
  const blockTime = coin?.block_time || 120; // default 2 min
  const networkHashrate = (netDiff * Math.pow(2, 32)) / blockTime;
  const poolShare = networkHashrate > 0 ? avgHashrate / networkHashrate : 0;
  const expected = poolShare * (hours * 3600 / blockTime);

  const luck = expected > 0 ? (found / expected) * 100 : 0;

  return { found, expected: Math.round(expected * 100) / 100, luck: Math.round(luck), hours };
}

export default pool;
