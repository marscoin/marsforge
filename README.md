# 🔴 MarsForge

**A modern, lightweight UI for YIIMP-based mining pools**

MarsForge is a Next.js frontend designed to work with existing YIIMP mining pool databases. It provides a clean, Mars-themed interface for the Marscoin mining pool while keeping the battle-tested YIIMP backend (stratum server, block processing, payouts) intact.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Modern Stack**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Real-time Updates**: SWR for automatic data refreshing
- **Mars Theme**: Custom dark theme with Mars color palette
- **YIIMP Compatible**: Connects directly to existing YIIMP MySQL database
- **Responsive**: Mobile-first design
- **Fast**: Server-side rendering, optimized assets

## Architecture

```
┌─────────────────────────────────────────┐
│  MarsForge (Next.js)                    │
│  - Dashboard, Stats, Wallet Lookup      │
│  - Real-time hashrate graphs            │
│  - Block explorer integration           │
└──────────────┬──────────────────────────┘
               │ API Routes (MySQL queries)
               ▼
┌─────────────────────────────────────────┐
│  YIIMP Database (existing)              │
│  - coins, blocks, workers, hashrate     │
│  - accounts, earnings, payouts          │
└─────────────────────────────────────────┘
               ▲
               │ (unchanged)
┌─────────────────────────────────────────┐
│  YIIMP Backend (existing)               │
│  - Stratum server (C++)                 │
│  - Block processing                     │
│  - Automatic payouts                    │
└─────────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18+
- Access to YIIMP MySQL database
- Running YIIMP backend (stratum, main.sh, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/marscoin/marsforge.git
cd marsforge

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your database credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

### Environment Variables

Create `.env.local` with:

```env
# Database (YIIMP MySQL)
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=yaamp

# Pool Configuration
NEXT_PUBLIC_POOL_NAME=MarsForge
NEXT_PUBLIC_POOL_URL=mining-mars.com
NEXT_PUBLIC_STRATUM_URL=mining-mars.com
NEXT_PUBLIC_STRATUM_PORT=3433
NEXT_PUBLIC_EXPLORER_URL=https://explore.marscoin.org
```

## Project Structure

```
marsforge/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── pool/      # Pool statistics
│   │   │   ├── blocks/    # Recent blocks
│   │   │   ├── hashrate/  # Hashrate history
│   │   │   └── wallet/    # Wallet lookup
│   │   ├── globals.css    # Mars theme styles
│   │   ├── layout.tsx     # Root layout with nav
│   │   └── page.tsx       # Dashboard
│   └── lib/
│       └── db.ts          # Database connection
├── .env.local             # Environment config
└── package.json
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/pool` | Pool statistics (coins, hashrate, workers) |
| `GET /api/blocks?limit=20` | Recent blocks found |
| `GET /api/hashrate?algo=scrypt&hours=24` | Hashrate history |
| `GET /api/wallet/[address]` | Wallet stats, balance, earnings |

## Deployment

### Production Build

```bash
npm run build
npm start
```

### With PM2

```bash
pm2 start npm --name "marsforge" -- start
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name forge.mining-mars.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Credits

- [Marscoin](https://marscoin.org) - The cryptocurrency for Mars
- [YIIMP](https://github.com/tpruvot/yiimp) - Original mining pool software
- Built with [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), [SWR](https://swr.vercel.app)

---

**MarsForge** - Forging the future on the Red Planet 🔴
