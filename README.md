# VedaAI Assessment Creator

A full-stack AI-powered assessment creator that lets teachers create assignments, generate structured question papers, view real-time generation progress, review the generated paper in an exam-style layout, and export a polished PDF.

---

## Live Links

* **Deployed Frontend**: [https://vedaai-assessment-creator-web.vercel.app/](https://vedaai-assessment-creator-web.vercel.app/)
* **Backend API Base URL**: [https://vedaai-api-kk5b.onrender.com](https://vedaai-api-kk5b.onrender.com)
* **Backend API Health Check**: [https://vedaai-api-kk5b.onrender.com/health](https://vedaai-api-kk5b.onrender.com/health)
* **GitHub Repository**: [https://github.com/nextgendev2029/vedaai-assessment-creator](https://github.com/nextgendev2029/vedaai-assessment-creator)

---

## Demo Credentials

* **Authentication**: Not required. The platform is open for immediate demo use to simplify evaluation.

---

## Assignment Requirements Coverage

- [x] **Assignment Creation**: Multi-step assignment configuration form capturing Title, Subject, Topic, Grade, and Question specifications.
- [x] **File Upload**: Supports uploading `.pdf` and `.txt` files as reference materials.
- [x] **Due Date**: Date validation and formatted display in UI.
- [x] **Question Types**: Renders Multiple Choice Questions (MCQs), Short Answer, Long Answer, and Case Study.
- [x] **Number of Questions and Marks**: Dynamic question count and marks definition.
- [x] **Additional Instructions**: Context input field included in the creation form.
- [x] **Proper Validation**: Dynamic form checks (React Hook Form + Zod) on the client, and Zod validator middleware on Express routes.
- [x] **Zustand State Management**: Stores assignment lists, filters, status indicators, and WebSocket connection states.
- [x] **WebSocket Management**: Connection handling and event listeners mapping realtime generation events.
- [x] **MongoDB Storage**: Mongoose schemas for Assignments, GeneratedPapers, and Compiled PDFs.
- [x] **Redis**: Connects via `ioredis` to manage queue storage, cached generation papers, and pub/sub events.
- [x] **BullMQ Background Jobs**: Queue-driven architecture for paper generation and PDF creation.
- [x] **Structured Prompt and AI Output Parsing**: System prompt builder with strict structure constraints.
- [x] **Sections/Questions/Difficulty/Marks**: Renders layout structures grouped by question types with marks and difficulty badges.
- [x] **Output Page with Student Info**: Exam layout header with slots for Student Name, Roll Number, and Section.
- [x] **Mobile Responsive UI**: Fully responsive UI tailored for both mobile devices and desktops.

---

## Bonus / Extra Functionality Implemented

The following features were implemented to demonstrate a high level of engineering completeness:

* **Proper Backend-Generated PDF Export**: Built using `pdfkit` rather than browser print sheets to guarantee pixel-perfect document rendering.
* **BullMQ-Driven PDF Compilation**: Compiles PDFs in background worker threads, keeping API HTTP connections open and lightweight.
* **MongoDB Binary PDF Storage**: PDF files are stored directly as binary Buffers in MongoDB and served via a database streaming endpoint.
* **Regenerate Action**: Direct UI command to run a new generation job and overwrite existing cached papers.
* **Difficulty Badges**: Visual indicators (Easy, Moderate, Hard) for each question.
* **Real-time WebSocket Updates**: Socket.IO progress timeline showing detailed generation step states.
* **Redis Pub/Sub & Caching**: Emits progress updates from workers to the API server in real time and caches papers.
* **Zod-Validated AI Outputs**: The AI response is normalized and validated against strict Zod schemas before being saved or rendered.
* **Multi-AI Provider Configuration**: Integrates Google Gemini (`@google/genai`) and Groq Cloud (`groq-sdk`) with automatic provider failover and a mock fallback for resilience.
* **Embedded Worker Mode**: Allows running background BullMQ workers within the API process for free single-container Render hosting.

---

## Key Features

* **Responsive Assignment Dashboard**: Displays created assignments with dynamic status filters, search bars, and detailed cards.
* **Wizard-Style Form**: Form fields validation, error messaging, and review step before submission.
* **Text Extraction Handler**: Integrates `pdf-parse` to extract and parse text from uploaded PDF/text files to insert directly into AI prompts.
* **Exam layout Viewer**: Layout displaying subject headers, duration, student detail slots, categorized sections, and an **Answer Key** block at the bottom.

---

## Tech Stack

| Technology | Purpose | Implementation Details |
|---|---|---|
| **Next.js 15** | Frontend Framework | TypeScript, React 19, Turbopack |
| **Zustand** | State Management | Global store for assignments lists and socket connection state |
| **Tailwind CSS v4** | UI Styling | CSS-first variables and premium dark/light layout tokens |
| **Express.js** | Backend API | Node.js, CORS, Helmet security headers |
| **BullMQ** | Task Queue | Asynchronous job queues for AI generation and PDF building |
| **Socket.IO** | Real-time Sockets | Client/Server WS connection for progress event emissions |
| **MongoDB / Mongoose** | Primary Database | Document schemas and binary buffer PDF storage |
| **Redis / ioredis** | Queue Storage & Cache | Key-value storage, caching, and Pub/Sub |
| **PDFKit** | PDF Canvas | Backend PDF layout compiler |
| **Zod** | Schema Validation | Data parsing on client, server, and AI JSON responses |
| **Google Gemini API** | Primary AI | `@google/genai` Integration |
| **Groq Cloud API** | Secondary AI | `groq-sdk` Integration |

---

## Technical Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                            CLIENT (Vercel)                             │
│                          Next.js Frontend                              │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                     HTTPS REST    │    WebSockets (Socket.IO)
                     & Payload     │    Real-time Progress
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            BACKEND (Render)                            │
│                 Express API & Socket.IO Web Server                     │
└──────┬───────────────────────────┬───────────────────────────────▲─────┘
       │                           │                               │
       │ Mongoose ODM              │ Push Generation               │ Subscribes
       ▼                           ▼ & PDF Jobs                    │ & Listens
┌──────────────┐            ┌──────────────┐               ┌───────┴──────┐
│   Database   │            │ Queue Server │               │  Pub/Sub     │
│ MongoDB Atlas│            │  Redis /     │               │  Redis       │
│              │            │  BullMQ      │               │  Channel     │
└──────▲───────┘            └──────┬───────┘               └───────▲──────┘
       │                           │                               │
       │ Reads/Writes              │ Pulls Jobs                    │ Emits
       │ Data & Buffers            ▼                               │ Progress
┌──────┴───────────────────────────┴───────────────────────────────┴──────┐
│                            WORKERS (BullMQ)                            │
│           Assessment Generation Worker  &  PDF Creator Worker          │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   │ Queries AI API
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL AI PROVIDERS                           │
│              Google Gemini API  /  Groq API  /  Mock                   │
└────────────────────────────────────────────────────────────────────────┘
```

> **Render Deployment Mode**: The live demo utilizes **Embedded Worker Mode** (`ENABLE_EMBEDDED_WORKER=true`) inside the single Render Web Service container to fit within Render's free tier. In production, workers can be run as separate background processes using `pnpm start:worker`.

* **Frontend**: Talks to the API server through HTTP REST calls and opens a persistent Socket.IO connection for real-time progress updates.
* **API Server**: Validates form inputs, stores assignment data in MongoDB, and pushes queue jobs to Redis using BullMQ.
* **Workers**: Standalone worker processes (or the embedded worker thread inside the API server) pull generation and PDF jobs, invoke Gemini/Groq APIs, validate the outputs with Zod, and write the finalized papers and PDF binary buffers back to MongoDB.
* **Socket updates**: The worker publishes progress states to Redis Pub/Sub. The API server listens to this channel and emits corresponding updates to the client frontend.

---

## Step-by-Step Flows

### 1. Assessment Generation Flow
1. **Teacher Action**: The teacher submits the form to configure an assignment.
2. **API Registration**: The API validates parameters, extracts text from reference files, saves the assignment metadata to MongoDB (status: `draft`), and redirects to the dashboard.
3. **Queueing**: Clicking **Generate** triggers a `POST` request, changing the status to `queued` and pushing a job to BullMQ.
4. **Worker Execution**: The worker pulls the job and shifts the status to `processing`.
5. **AI Querying & Validation**: The worker queries the AI provider (Gemini or Groq) with prompt contexts. The AI response is normalized and validated against strict Zod schemas before being saved or rendered.
6. **Socket Updates**: During execution (e.g. preparing, calling AI, saving), the worker publishes progress to Redis Pub/Sub, which the API server emits to the client socket.
7. **Completion**: The paper is saved to MongoDB, the status is set to `completed`, and a Socket event prompts the client to display the output screen.

### 2. PDF Flow
1. **Request**: The user clicks **Download PDF** on the generated paper.
2. **Metadata Lookup**: The client calls `POST /api/assignments/:id/pdf`. If a PDF exists, it returns its status immediately.
3. **Compilation**: If not generated, a job is pushed to the queue. The worker uses `pdfkit` to compile headers, student grids, questions, and the answer key, saving the compiled buffer directly into MongoDB.
4. **Download**: The client polls until status reads `ready`, then redirects to `GET /api/assignments/:id/pdf/download` to stream the binary buffer.

---

## Why This Architecture?

* **Asynchronous Jobs**: Heavy AI API calls and PDF rendering can easily block Node's event loop. Using BullMQ keeps the API responsive and ensures jobs are retried or logged on failure.
* **WebSocket Timeline**: Real-time progress updates replace polling, providing instant feedback as the AI generates questions.
* **Strict Schema Validation**: Normalizing and validating AI responses via Zod prevents malformed JSON strings from corrupting database fields.
* **Device-Consistent PDF Exports**: Rendering PDFs on the backend using `pdfkit` bypasses browser print variances, ensuring teachers always download properly styled paper sheets.
* **TSup Compilation**: Separate production bundles are generated for API and worker entry points using tsup, keeping deployment containers clean.
* **Single Container Deployments**: The embedded worker mode (`ENABLE_EMBEDDED_WORKER=true`) allows the API server and workers to run on a single Render container, providing a free deployment option.

---

## Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/nextgendev2029/vedaai-assessment-creator.git
cd vedaai-assessment-creator

# 2. Install monorepo dependencies
pnpm install

# 3. Setup configurations
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 4. Start local MongoDB & Redis Docker containers
pnpm docker:up

# 5. Boot all workspaces in development mode
pnpm dev
```

Verify that the local backend is online:
```bash
curl http://localhost:4000/health
```

---

## Environment Variables

### API Server (`apps/api/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Local server port | `4000` |
| `NODE_ENV` | Application environment (`development`, `production`, `test`) | `development` |
| `WEB_URL` | Frontend URL (used for CORS mapping) | `http://localhost:3000` |
| `ALLOWED_ORIGINS` | Comma-separated alternative origins | `http://localhost:3000` |
| `ENABLE_EMBEDDED_WORKER` | Run BullMQ workers internally in the API process | `false` |
| `MONGO_URI` | MongoDB Connection URL | `mongodb://localhost:27017/vedaai_assessment_creator` |
| `REDIS_URL` | Redis Database URL | `redis://localhost:6379` |
| `AI_PROVIDER` | Active AI Provider (`mock`, `gemini`, `groq`) | `mock` |
| `AI_FALLBACK_TO_GROQ` | Fallback to Groq if Gemini fails | `false` |
| `AI_FALLBACK_TO_MOCK` | Fallback to Mock generator if AI queries fail | `true` |
| `GEMINI_API_KEY` | Google Gemini API Key | `""` |
| `GEMINI_MODEL` | Gemini model target | `gemini-2.5-flash` |
| `GROQ_API_KEY` | Groq Cloud API Key | `""` |
| `GROQ_MODEL` | Groq model target | `llama-3.1-8b-instant` |

### Web Client (`apps/web/.env`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | REST API target URL | `http://localhost:4000` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO WebSocket endpoint | `http://localhost:4000` |

---

## API Endpoint Reference

| Method | Path | Description |
|---|---|---|
| **GET** | `/health` | Server uptime and datastores connection status |
| **GET** | `/api/health` | Server uptime and datastores connection status |
| **GET** | `/api/assignments` | List all assignments with optional query filters |
| **POST** | `/api/assignments` | Create a new assignment configuration (supports file attachment) |
| **GET** | `/api/assignments/:id` | Fetch details of a specific assignment |
| **PATCH** | `/api/assignments/:id` | Update assignment configuration details |
| **DELETE** | `/api/assignments/:id` | Delete assignment and its generated papers/PDFs |
| **POST** | `/api/assignments/:id/generate` | Queue BullMQ assessment generation job |
| **POST** | `/api/assignments/:id/regenerate` | Force queue a new generation job (skipping cache) |
| **GET** | `/api/assignments/:id/generation-state` | Fetch the current queue state for paper generation |
| **GET** | `/api/assignments/:id/result` | Fetch the generated paper questions data |
| **POST** | `/api/assignments/:id/pdf` | Start backend PDF compilation |
| **GET** | `/api/assignments/:id/pdf/state` | Fetch the current state of PDF compilation |
| **GET** | `/api/assignments/:id/pdf/download` | Stream compiled PDF binary |

---

## Folder Structure

```text
vedaai-assessment-creator/
├── apps/
│   ├── web/                     # Next.js frontend application
│   │   ├── src/app/             # Pages and CSS variables setup
│   │   ├── src/components/      # UI, layout, and assignment components
│   │   └── src/stores/          # Zustand states management
│   └── api/                     # Express REST/WS server & workers
│       ├── src/config/          # Database, Redis, and Zod Environment configurations
│       ├── src/routes/          # API Route handlers (Health, Assignments, PDF)
│       ├── src/services/        # Business logic, AI provider, and PDF Builder services
│       ├── src/workers/         # BullMQ queue workers
│       └── src/worker.ts        # Standalone worker daemon entrypoint
├── packages/
│   └── shared/                  # Common TypeScript types and Zod schemas
├── docs/                        # Project architecture and testing guides
├── docker-compose.yml           # Database and Redis containerization configuration
└── package.json                 # Monorepo task configurations
```

---

## Testing Checklist

- [x] **Create Assignment**: Verify validation errors block empty submissions.
- [x] **Generate Paper**: Verify dynamic WebSocket status updates appear sequentially.
- [x] **Real-time Status Check**: Confirm percentages update and redirect automatically on completion.
- [x] **Review Output**: Confirm exam structure displays student headers, difficulty badges, marks, and answer key.
- [x] **Regenerate Flow**: Verify clicking "Regenerate" initiates a new worker queue job.
- [x] **Download PDF**: Verify PDF downloads as a native file and layout matches the viewer.
- [x] **Delete Assignment**: Verify deleting an assignment cleans up MongoDB entries.
- [x] **Mobile Responsiveness**: Confirm dashboard lists, forms, and exam views scale correctly.

---

## Design Decisions

1. **Decoupled Task Processing**: Offloaded computational workloads (LLM generation, PDF rendering) to BullMQ background threads.
2. **WebSocket Events**: Socket.IO progress timelines replace polling.
3. **Structured Schemas**: Validated AI model outputs against Zod schemas before database saves.
4. **Binary MongoDB Storage**: Saved compiled PDF buffers in MongoDB as binary fields, avoiding external cloud storage requirements.
5. **Free Deployment Support**: Added `ENABLE_EMBEDDED_WORKER` configuration to run API and workers on a single Render container.

---

## Limitations & Future Extensions

### Limitations
* **Authentication**: Not implemented (not requested in the initial assessment scope).
* **Reference Material Uploads**: PDF/text files can be used as contextual reference material. Uploaded images are currently stored as metadata references; OCR can be added as a future improvement.
* **Render Web Service Cold Starts**: Render free Web Services sleep after 15 minutes of inactivity. Initial requests can take up to 50 seconds to wake up the service.
* **Content Quality**: Output quality depends on the active AI provider (Gemini or Groq).

### Future Extensions
* Add user authentication and workspace organization.
* Implement optical character recognition (OCR) for uploaded image reference documents.
* Add drag-and-drop question customization prior to PDF generation.

---

## Evaluator Notes

* **No Auth Required**: The deployed application has authentication disabled, allowing immediate testing.
* **Cold Starts**: Render free instances sleep after inactivity. If the app does not load immediately, please allow up to 50 seconds for the backend service to wake up.
* **Embedded worker**: The deployed live demo uses `ENABLE_EMBEDDED_WORKER=true` to merge workers and the API server on a single Web Service.
* **Standalone workers**: In production, background workers can be run separately with the command `pnpm start:worker`.

---

## Submission Note

This project was built with a production-style architecture to demonstrate not only UI implementation from Figma, but also backend job processing, real-time updates, structured AI validation, and export workflows.
