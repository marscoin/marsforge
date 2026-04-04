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

export async function query<T>(sql: string, params?: unknown[]): Promise<T> {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

// Pool statistics
export async function getPoolStats() {
  const [coins] = await pool.execute(`
    SELECT
      c.id, c.name, c.symbol, c.algo, c.enable, c.auto_ready,
      c.difficulty, c.price, c.market_cap,
      (SELECT COUNT(*) FROM workers w WHERE w.coinid = c.id) as workers,
      (SELECT SUM(w.hashrate) FROM workers w WHERE w.coinid = c.id) as hashrate
    FROM coins c
    WHERE c.enable = 1 AND c.auto_ready = 1
  `);
  return coins;
}

// Get recent blocks
export async function getRecentBlocks(limit = 20) {
  const [blocks] = await pool.execute(`
    SELECT
      b.id, b.coin_id, b.height, b.time, b.amount, b.confirmations,
      b.difficulty, b.blockhash, b.category,
      c.symbol, c.name as coin_name
    FROM blocks b
    LEFT JOIN coins c ON b.coin_id = c.id
    ORDER BY b.time DESC
    LIMIT ?
  `, [limit]);
  return blocks;
}

// Get hashrate history for graphs
export async function getHashrateHistory(algo: string, hours = 24) {
  const [history] = await pool.execute(`
    SELECT time, hashrate, hashrate_solo
    FROM hashstats
    WHERE algo = ?
    AND time > DATE_SUB(NOW(), INTERVAL ? HOUR)
    ORDER BY time ASC
  `, [algo, hours]);
  return history;
}

// Get worker stats for a wallet
export async function getWalletStats(wallet: string) {
  const [workers] = await pool.execute(`
    SELECT
      w.id, w.name, w.hashrate, w.difficulty, w.time,
      c.symbol, c.name as coin_name
    FROM workers w
    LEFT JOIN coins c ON w.coinid = c.id
    WHERE w.name LIKE ?
    ORDER BY w.time DESC
  `, [`${wallet}%`]);
  return workers;
}

// Get earnings for a wallet
export async function getWalletEarnings(wallet: string) {
  const [earnings] = await pool.execute(`
    SELECT
      e.coinid, e.amount, e.time, e.status,
      c.symbol, c.name as coin_name
    FROM earnings e
    LEFT JOIN coins c ON e.coinid = c.id
    WHERE e.userid IN (
      SELECT id FROM accounts WHERE username = ?
    )
    ORDER BY e.time DESC
    LIMIT 100
  `, [wallet]);
  return earnings;
}

// Get account balance
export async function getWalletBalance(wallet: string) {
  const [balance] = await pool.execute(`
    SELECT
      a.id, a.username, a.balance, a.donate,
      c.symbol
    FROM accounts a
    LEFT JOIN coins c ON a.coinid = c.id
    WHERE a.username = ?
  `, [wallet]);
  return balance;
}

export default pool;
