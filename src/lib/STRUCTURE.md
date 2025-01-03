├── .env.example        # Environment variables with validation schemas
├── .gitignore          # Excludes: node_modules, .env, *.db, dist, etc.
├── .prettierrc         # Prettier config: tabs, quotes, semicolons
├── .eslintrc           # ESLint: TypeScript + Astro rules
├── LICENSE             # MIT License (open source)
├── README.md           # Installation, setup, backup & recovery
├── package.json        # Dependencies + npm scripts + Node/npm versions
├── tsconfig.json       # TypeScript: strict mode + path aliases
├── tsconfig.node.json  # TypeScript for config files (*.config.ts)
│
├── public/              # Static assets served at root (/)
│   ├── favicon.ico     # Browser tab icon (32x32)
│   ├── logo.svg        # Vector logo for retina displays
│   └── robots.txt      # Search engine crawling rules
│
├── scripts/             # Utility scripts for installation and maintenance
│   ├── enable-wal.ts    # Enable SQLite Write-Ahead Logging (WAL) mode
│   ├── install.sh       # Install Dokkubase (+ optional Dokku if not detected)
│   ├── update.sh        # Safe update with automatic backup
│   └── backup.sh        # SQLite backup/restore with safety checks
│
├── src/
│   ├── assets/         # Source assets (processed at build)
│   │   └── app.css     # Tailwind 4.0: @theme config + @import + CSS variables
│   │                   # - Color system (oklch)
│   │                   # - Breakpoints
│   │                   # - Typography
│   │                   # - Custom utilities
│   │
│   ├── actions/        # Astro Server Actions
│   │   ├── setup.ts          # Initial setup validation
│   │   ├── auth.ts           # Custom auth actions (based on lucia-guide)
│   │   ├── apps.ts           # App management actions
│   │   └── index.ts          # Server actions export
│   │
│   ├── lib/                 # Core logic
│   │   ├── core/            # Core functionality
│   │   │   ├── auth/        # Custom auth implementation
│   │   │   │   ├── setup.ts     # Initial setup flow
│   │   │   │   ├── verify.ts    # Token verification
│   │   │   │   ├── rate-limit.ts # Token bucket algorithm (lucia-guide)
│   │   │   │   └── middleware.ts # Auth middleware for API/Actions
│   │   │   ├── validation.ts # Zod schemas
│   │   │   ├── headers.ts    # Security headers (CSP, HSTS itp.)
│   │   │   │
│   │   │   └── notifications/ # Real-time notifications system
│   │   │       ├── index.ts      # Notification manager + event emitter
│   │   │       ├── channels/     # Notification channels
│   │   │       │   ├── browser.ts  # Browser toast + web push
│   │   │       │   ├── slack.ts    # Slack webhooks (planned)
│   │   │       │   ├── discord.ts  # Discord webhooks (planned)
│   │   │       │   ├── telegram.ts # Telegram notifications (planned)
│   │   │       │   └── email.ts    # Email notifications (planned)
│   │   │       ├── templates.ts  # Type-safe message templates
│   │   │       └── config.ts     # Channel configuration + validation
│   │   │
│   │   ├── config/          # Application configuration
│   │   │   ├── env.ts       # Environment variables validation (Zod)
│   │   │   └── constants.ts # App constants and feature flags
│   │   │
│   │   ├── dokku/           # Dokku SSH integration
│   │   │   ├── client/      # SSH client implementation
│   │   │   │   ├── index.ts # SSH connection manager
│   │   │   │   ├── core/    # Core Dokku commands
│   │   │   │   │   ├── apps.ts    # Create/delete/list apps
│   │   │   │   │   ├── config.ts  # Set/get/unset ENV vars
│   │   │   │   │   ├── domains.ts # Add/remove domains + SSL
│   │   │   │   │   ├── proxy.ts   # Proxy ports + settings
│   │   │   │   │   ├── ps.ts      # Process status + scaling
│   │   │   │   │   ├── git.ts     # Git push + deploy hooks
│   │   │   │   │   └── logs.ts    # Real-time log streaming
│   │   │   │   └── plugins/  # Dokku plugins integration
│   │   │   │       ├── postgres.ts # PostgreSQL service
│   │   │   │       ├── redis.ts    # Redis service
│   │   │   │       ├── redirect.ts # URL redirects
│   │   │   │       ├── letsencrypt.ts # SSL certificates
│   │   │   │       └── registry.ts # Private registry support
│   │   │   ├── types.ts     # Dokku command types + responses
│   │   │   └── mock/        # Development mock client
│   │   │       ├── index.ts  # Mock with artificial delays
│   │   │       ├── apps.ts   # Mock app operations
│   │   │       └── events.ts  # Mock logs + events
│   │   │
│   │   ├── queue/           # Background jobs (BullMQ)
│   │   │   ├── worker.ts    # Queue processor + error handling
│   │   │   ├── jobs/        # Job definitions
│   │   │   │   ├── deploy.ts   # Monitor git push + build status
│   │   │   │   ├── backup.ts   # Database backup jobs
│   │   │   │   └── cleanup.ts  # Clean old logs + temp files
│   │   │   ├── events.ts    # Job progress + completion events
│   │   │   └── types.ts     # Job payloads + results types
│   │   │
│   │   ├── sse/             # Real-time operation monitoring
│   │   │   ├── index.ts     # SSE connection + heartbeat
│   │   │   ├── events/      # Event streams
│   │   │   │   ├── deploy.ts   # Deployment progress
│   │   │   │   ├── logs.ts     # Real-time app logs
│   │   │   │   └── status.ts   # App status changes
│   │   │   └── types.ts     # Event type definitions
│   │   │
│   │   └── db/              # SQLite + Drizzle ORM
│   │       ├── schema/      # Database tables
│   │       │   ├── admin.ts    # Admin token + settings
│   │       │   ├── apps.ts     # Basic app info + last status
│   │       │   ├── events.ts   # Operation history log
│   │       │   └── activity.ts # Audit log (who did what when)
│   │       ├── migrations/  # Drizzle migrations
│   │       │   └── .gitkeep
│   │       └── client.ts    # DB client with WAL mode
│   │
│   ├── components/          # UI Components
│   │   ├── ui/             # Shared UI components
│   │   │   ├── errors/        # Error handling
│   │   │   │   ├── View.astro     # Dokku error output display
│   │   │   │   └── Tip.astro      # Contextual help tips
│   │   │   ├── notifications/ # Real-time notifications
│   │   │   │   ├── Toast.astro     # Toast with view transitions
│   │   │   │   └── Settings.astro  # Notification preferences
│   │   │   │
│   │   │   └── terminal/     # Terminal output
│   │   │       ├── View.astro      # Auto-scrolling terminal
│   │   │       └── Line.astro      # ANSI color support
│   │   │
│   │   ├── apps/           # App management
│   │   │   ├── AppCard.astro    # Single app status card
│   │   │   └── AppList.astro    # Real-time app list
│   │   │
│   │   └── setup/          # Initial setup
│   │       └── TokenForm.astro  # Admin token validation
│   │
│   ├── layouts/            # Astro layouts
│   │   ├── Layout.astro     # Root layout with:
│   │   │                  # - Security headers
│   │   │                  # - View transitions
│   │   │                  # - Toast container
│   │   │                  # - Error boundary
│   │   └── Auth.astro     # Protected routes wrapper
│   │
│   ├── pages/             # File-based routing
│   │   ├── 404.astro       # "App/page not found" error
│   │   ├── 500.astro       # "System error" page
│   │   ├── api/           # External API endpoints
│   │   │   ├── setup/     # Setup endpoints
│   │   │   │   └── status.ts    # Public setup status check
│   │   │   │
│   │   │   └── sse/       # Server-Sent Events
│   │   │       └── events.ts     # Real-time operation monitoring
│   │   │
│   │   ├── index.astro    # Dashboard with app list
│   │   ├── setup.astro    # Initial setup (uses Server Actions)
│   │   ├── login.astro    # Login page with session handling
│   │   ├── logout.astro   # Session cleanup + redirect
│   │   ├── settings/      # User settings
│   │   │   ├── index.astro   # Settings dashboard
│   │   │   ├── security.astro # Password + token management
│   │   │   └── notifications.astro # Notification preferences
│   │   └── apps/          # App pages
│   │       └── [name].astro  # Single app dashboard
│   │
│   └── tests/             # Vitest test suite
│       ├── setup.ts       # Test environment setup
│       ├── mocks/         # Test doubles
│       │   ├── dokku/       # Mock Dokku SSH responses
│       │   │   ├── apps.ts    # App list/status mocks
│       │   │   └── logs.ts    # Log stream mocks
│       │   └── events.ts    # SSE event mocks
│       │
│       └── integration/   # Integration tests
│           ├── setup/       # Initial setup flow
│           ├── monitoring/  # App monitoring features
│           └── auth/        # Auth + security tests
│
├── data/                  # Persistent storage
│   ├── .gitkeep          # Ensures directory is tracked
│   └── README.md         # Storage path + backup instructions
│
├── drizzle.config.ts     # Database configuration:
│                      # - SQLite path
│                      # - WAL mode
│                      # - Migrations
│
└── astro.config.ts       # Astro configuration:
                         # - Server mode
                         # - Security headers
                         # - View transitions



dokkubase-docs/
├── src/
│   ├── pages/
│   │   ├── docs/
│   │   │   ├── getting-started/
│   │   │   │   ├── installation.md     # Install Dokkubase
│   │   │   │   ├── first-setup.md      # Admin token setup
│   │   │   │   └── security.md         # Security best practices
│   │   │   │
│   │   │   ├── monitoring/
│   │   │   │   ├── dashboard.md        # Real-time app monitoring
│   │   │   │   ├── logs.md            # Log streaming features
│   │   │   │   └── notifications.md    # Alert configuration
│   │   │   │
│   │   │   ├── management/
│   │   │   │   ├── apps.md            # App status overview
│   │   │   │   ├── domains.md         # Domain management
│   │   │   │   └── plugins.md         # Plugin monitoring
│   │   │   │
│   │   │   └── troubleshooting/
│   │   │       ├── common-issues.md    # Known issues + fixes
│   │   │       └── dokku-logs.md      # Understanding Dokku logs
│   │   │
│   │   └── index.astro               # Landing page + quick start
│   │
│   └── components/                   # Doc components


Kurwa, dobre że kazałeś mi to przeczytać Szymon! Teraz wszystko się układa w spójną całość:

1. **Astro Server Actions** (z `@actions.md`):
   - To jest nowa feature z Astro 4.15
   - Pozwala na type-safe komunikację client-server
   - Automatycznie waliduje dane przez Zod
   - Działa nawet bez JS (progressive enhancement)
   - Wszystkie akcje muszą być w `src/actions/index.ts`

2. **Server Endpoints** (z `@endpoints.md`):
   - To są tradycyjne REST API endpointy
   - Dobre do zewnętrznego API
   - Mniej wygodne niż Server Actions do wewnętrznej komunikacji

3. **Server Islands** (z `@server-islands.md`):
   - Pozwalają na server-side rendering pojedynczych komponentów
   - Używają `server:defer` do lazy loadingu
   - Świetne do personalizowanego contentu

4. **On-demand Rendering** (z `@on-demand-rendering.md`):
   - Potrzebny adapter (np. Netlify)
   - Można mieszać static i server rendering
   - Daje dostęp do cookies, headers itp.

Kurwa, teraz to ma sens! Powinniśmy:

1. ZOSTAWIĆ folder `actions/` - to jest dobre miejsce na Astro Server Actions
2. Przenieść logikę biznesową do `lib/`
3. Użyć Server Actions zamiast REST API do wewnętrznej komunikacji
4. Użyć Server Islands do personalizowanych części UI

Przykład jak to powinno wyglądać:

```typescript
// src/actions/index.ts
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { verifyToken } from '../lib/setup/verify';

export const server = {
  setup: {
    verifyToken: defineAction({
      input: z.object({
        token: z.string()
      }),
      handler: async (input) => {
        return verifyToken(input.token);
      }
    })
  }
}
```

Co o tym myślisz Szymon? To będzie bardziej "Astro way" i wykorzysta wszystkie nowe ficzery!

Nie musimy się spieszyć - możemy to robić krok po kroku. Na początek możemy zostawić obecne REST API, ale stopniowo migrować do Server Actions tam gdzie to ma sens.
