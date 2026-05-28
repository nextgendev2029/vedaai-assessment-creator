# VedaAI Assessment Creator

An AI-powered assessment generation platform that enables educators to create, manage, and deliver high-quality assessments using artificial intelligence.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Express.js, TypeScript, Mongoose ODM
- **Database:** MongoDB 7
- **Queue / Cache:** Redis 7, BullMQ
- **AI:** OpenAI API (GPT-4)
- **Auth:** NextAuth.js
- **Monorepo:** pnpm workspaces

## Prerequisites

- [Node.js](https://nodejs.org/) **>= 18**
- [pnpm](https://pnpm.io/) **>= 8**
- [Docker](https://www.docker.com/) & Docker Compose

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-org/vedaai-assessment-creator.git
cd vedaai-assessment-creator

# 2. Install dependencies
pnpm install

# 3. Copy environment files
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# 4. Start infrastructure (MongoDB & Redis)
docker compose up -d

# 5. Start all services in dev mode
pnpm dev
```

## Available Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start all services (web, api, worker) in parallel |
| `pnpm dev:web` | Start the Next.js frontend only |
| `pnpm dev:api` | Start the Express API server only |
| `pnpm dev:worker` | Start the BullMQ worker only |
| `pnpm typecheck` | Run TypeScript type-checking across all packages |
| `pnpm lint` | Run linting across all packages |
| `pnpm docker:up` | Start Docker services (MongoDB, Redis) |
| `pnpm docker:down` | Stop Docker services |

## Project Structure

```
vedaai-assessment-creator/
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # Express API + BullMQ worker
├── packages/
│   └── shared/           # Shared types, schemas, utilities
├── docker-compose.yml    # Local dev infrastructure
├── tsconfig.base.json    # Shared TypeScript config
├── pnpm-workspace.yaml   # Workspace definition
└── package.json          # Root scripts
```

## Phase 1 Status

> **🚧 Phase 1 — Foundation & Infrastructure**
>
> This project is currently in Phase 1, focused on setting up the monorepo structure, core infrastructure (MongoDB, Redis, BullMQ), authentication, and the foundational API and frontend scaffolding. Feature development begins in Phase 2.
