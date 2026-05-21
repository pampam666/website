# Local Development Setup

**Purpose:** Configure local development environment for hub-and-spoke subdomain routing  
**OS:** Windows, macOS, Linux

---

## Overview

The DBSN platform uses a hub-and-spoke architecture with multiple subdomains served from a single Next.js 15 codebase. This document explains how to test subdomain routing locally.

### Subdomain Architecture

| Domain | Purpose | Route Group |
|--------|---------|-------------|
| `sentradaya.com` | Hub — Corporate trust center | `(hub)` |
| `pju.sentradaya.com` | PJU / Street Lighting spoke | `(spokes)` |
| `solarcell.sentradaya.com` | Solar Cell spoke | `(spokes)` |
| `alatpetir.sentradaya.com` | Lightning Protection spoke | `(spokes)` |
| `baterai.sentradaya.com` | Battery spoke | `(spokes)` |
| `dashboard.sentradaya.com` | Client tracking portal | `(dashboard)` |

---

## Method A: Using lvh.me (Recommended)

**Pros:** No system file modifications, works immediately  
**Cons:** Requires port specification in URL

### How lvh.me Works

The domain `lvh.me` (and all subdomains `*.lvh.me`) resolves to `127.0.0.1` (localhost). This allows you to test subdomain routing without modifying your system's hosts file.

### Access URLs

Replace `:3000` with your dev server port if different:

| Production Domain | Local Access URL |
|------------------|-------------------|
| `sentradaya.com` | `lvh.me:3000` |
| `pju.sentradaya.com` | `pju.lvh.me:3000` |
| `solarcell.sentradaya.com` | `solarcell.lvh.me:3000` |
| `alatpetir.sentradaya.com` | `alatpetir.lvh.me:3000` |
| `baterai.sentradaya.com` | `baterai.lvh.me:3000` |
| `dashboard.sentradaya.com` | `dashboard.lvh.me:3000` |

### Middleware Configuration

Create `middleware.ts` at the project root:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')?.split(':')[0] || '';

  // Hub routing
  if (hostname === 'lvh.me' || hostname === 'sentradaya.com') {
    return NextResponse.rewrite(new URL('/', request.url));
  }

  // Spoke routing
  if (hostname.startsWith('pju.')) {
    return NextResponse.rewrite(new URL('/(spokes)/pju', request.url));
  }

  if (hostname.startsWith('solarcell.')) {
    return NextResponse.rewrite(new URL('/(spokes)/solarcell', request.url));
  }

  if (hostname.startsWith('alatpetir.')) {
    return NextResponse.rewrite(new URL('/(spokes)/alatpetir', request.url));
  }

  if (hostname.startsWith('baterai.')) {
    return NextResponse.rewrite(new URL('/(spokes)/baterai', request.url));
  }

  // Dashboard routing
  if (hostname.startsWith('dashboard.')) {
    return NextResponse.rewrite(new URL('/(dashboard)', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Usage

1. Start dev server: `pnpm dev`
2. Navigate to: `http://pju.lvh.me:3000`
3. Verify you see the PJU spoke page

---

## Method B: Hosts File Modification

**Pros:** No port specification needed in URL  
**Cons:** Requires admin privileges, manual cleanup required

### Windows

1. Open Notepad as Administrator
2. Open file: `C:\Windows\System32\drivers\etc\hosts`
3. Add entries:

```
127.0.0.1 sentradaya.com
127.0.0.1 pju.sentradaya.com
127.0.0.1 solarcell.sentradaya.com
127.0.0.1 alatpetir.sentradaya.com
127.0.0.1 baterai.sentradaya.com
127.0.0.1 dashboard.sentradaya.com
```

4. Save file

### macOS / Linux

1. Edit `/etc/hosts` with sudo:
   ```bash
   sudo nano /etc/hosts
   ```

2. Add entries:
   ```
   127.0.0.1 sentradaya.com
   127.0.0.1 pju.sentradaya.com
   127.0.0.1 solarcell.sentradaya.com
   127.0.0.1 alatpetir.sentradaya.com
   127.0.0.1 baterai.sentradaya.com
   127.0.0.1 dashboard.sentradaya.com
   ```

3. Save (Ctrl+O, Enter, Ctrl+X)

4. Flush DNS cache:
   ```bash
   sudo dscacheutil -flushcache
   sudo killall -HUP mDNSResponder
   ```

### Usage

1. Start dev server: `pnpm dev`
2. Navigate to: `http://pju.sentradaya.com:3000`
3. Verify you see the PJU spoke page

---

## Environment Variables

### Required Variables

Create `.env.local` in project root:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbsn"

# Sanity CMS
SANITY_PROJECT_ID="your-project-id"
SANITY_API_READ_TOKEN="your-read-token"

# Email (Resend)
RESEND_API_KEY="re_your-api-key-here"

# Telegram Bot
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_CHAT_ID="-1001234567890"

# Analytics
GA_TRACKING_ID="G-XXXXXXXXXX"

# Environment
NODE_ENV=development
```

### Verification

```bash
# Verify environment variables are loaded
pnpm exec node -e "console.log(require('dotenv').config()); console.log(process.env.DATABASE_URL)"
```

---

## Development Server Configuration

### Port Configuration

Default port is `3000`. To use a different port:

```bash
# Environment variable
PORT=4000 pnpm dev

# Or in package.json scripts
"dev": "next dev -p 4000"
```

### Hot Module Replacement

Next.js 15 with Turbopack provides fast HMR. No additional configuration needed.

---

## Troubleshooting

### Subdomain routing not working

1. Verify middleware.ts exists at project root
2. Check hostname extraction:
   ```typescript
   // Add debug logging to middleware.ts
   console.log('Hostname:', hostname);
   ```
3. Ensure matcher configuration includes your routes

### lvh.me not resolving

1. Verify DNS resolution:
   ```bash
   # Windows
   nslookup lvh.me
   nslookup pju.lvh.me
   
   # macOS / Linux
   dig lvh.me
   dig pju.lvh.me
   ```
2. Both should resolve to `127.0.0.1`

### Port already in use

```bash
# Find process using port 3000 (Windows)
netstat -ano | findstr :3000

# Find process using port 3000 (macOS / Linux)
lsof -ti:3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F  # Windows
kill -9 <PID>  # macOS / Linux
```

### Environment variables not loading

1. Verify `.env.local` file exists
2. Check file encoding (must be UTF-8)
3. Restart dev server after adding variables

---

## Testing Checklist

Before committing code, verify:

- [ ] Hub page loads at `lvh.me:3000`
- [ ] At least one spoke loads at `*.lvh.me:3000`
- [ ] Dashboard routes correctly with authentication
- [ ] Environment variables are properly set
- [ ] No console errors in browser dev tools
- [ ] Network requests resolve correctly

---

## Related Documentation

- [Project Roadmap](../project-roadmap.md) — Phase 2.7 (Subdomain Middleware) status
- [Mocking Specs](../testing/mocking-specs.md) — External service mocking patterns
- [TDD v1](../architecture/tdd-v1.md) — Middleware routing architecture

---

*Last modified: 2026-05-20*