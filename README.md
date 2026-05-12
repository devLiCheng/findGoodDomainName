# Find Good Domain Name

AI-powered domain name generator using Bun + Hono SSR + DeepSeek V4 Pro.

## Features

- **AI Domain Suggestions**: Input keywords, get creative domain name ideas with reasoning
- **Accurate Availability Check**: Three-tier verification (RDAP → WHOIS → DNS)
- **User Accounts**: Register/login with JWT cookie auth, save favorite domains
- **Server-Side Rendering**: Fast SSR with Hono JSX
- **i18n**: Chinese/English language switching
- **SEO News**: Server-rendered news/articles for SEO (CLI-managed)
- **Google Ads Ready**: Ad placeholder slots integrated in layout

## Quick Start

```bash
# Install dependencies
bun install

# Configure environment
cp .env.example .env
# Edit .env with your DeepSeek API key

# Run
bun run index.ts
# Server: http://localhost:3000
```

## Project Structure

```
findGoodDomainName/
├── src/
│   ├── app.tsx              # Hono app entry (SSR routes + API)
│   ├── cli/news.ts          # CLI tool for managing news
│   ├── middleware/auth.ts    # JWT auth middleware
│   ├── routes/
│   │   ├── auth.ts          # Register/login/logout API
│   │   ├── domain.ts        # Domain suggestion API
│   │   ├── favorites.ts     # Favorites CRUD API
│   │   └── news.ts          # News CRUD API (admin)
│   ├── services/
│   │   ├── db.ts            # SQLite database layer
│   │   ├── deepseek.ts      # DeepSeek V4 Pro client
│   │   └── domain-checker.ts # Three-tier domain check
│   ├── types/index.ts       # TypeScript types
│   └── views/               # Hono JSX views
│       ├── layout.tsx        # Base layout with i18n
│       ├── home.tsx           # Domain search page
│       ├── login.tsx          # Login/register page
│       ├── favorites.tsx      # User's saved domains
│       ├── news-list.tsx      # News list page
│       └── news-detail.tsx    # News detail page
├── scripts/
│   ├── deploy.sh            # Linux/Mac deploy script
│   └── deploy.ps1           # Windows PowerShell deploy script
├── skills/                  # Project skill documentation
├── index.ts                 # Entry point
└── .env.example             # Environment template
```

## Managing News (for SEO)

```bash
# Create news article
bun run src/cli/news.ts create "Title" "url-slug" "Content text" "Optional summary"

# List news
bun run src/cli/news.ts list 1

# Update news
bun run src/cli/news.ts update 1 "New Title" "New content" "New summary"

# Delete news
bun run src/cli/news.ts delete 1
```

Environment variables for CLI: `ADMIN_API_URL` (default: http://localhost:3000), `ADMIN_TOKEN` (from .env)

## Deployment

### Prerequisites
- Server with SSH access
- `sshpass` or SSH key configured (recommended)

### One-Click Deploy

**Windows (PowerShell):**
```powershell
.\scripts\deploy.ps1
```

**Linux/Mac:**
```bash
bash scripts/deploy.sh
```

After deployment, set your DeepSeek API key on the server:
```bash
ssh root@YOUR_SERVER
cd /root/findgooddomain/app
echo 'DEEPSEEK_API_KEY=sk-...' >> .env
pkill -f 'bun.*index.ts'
nohup bun run index.ts > /var/log/findgooddomain.log 2>&1 &
```

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono (SSR with JSX)
- **AI**: DeepSeek V4 Pro
- **Database**: SQLite (bun:sqlite)
- **Auth**: JWT (hono/jwt) + bcrypt (Bun.password)
- **Domain Check**: RDAP + WHOIS + DNS (three-tier)
