# Architecture Overview

This document provides a detailed overview of the system architecture, design decisions, and data flow of the VedaAI Assessment Creator.

## High-Level Architecture

The VedaAI Assessment Creator is built as a TypeScript monorepo using `pnpm` workspaces. It follows a decoupled, queue-driven architecture to handle heavy operations (such as AI content generation and PDF compilation) asynchronously without blocking the user-facing web server.

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

---

## Component Roles

### 1. Frontend (`apps/web`)
* **Next.js 15 (App Router)**: Handles client-side routing, dashboard displays, and reactive UI.
* **Zustand**: Handles frontend global state management (assessments lists, filtering, selection, and Socket connection status).
* **Socket.IO Client**: Establishes a persistent connection to the backend to receive real-time, step-by-step progress updates for paper generation.
* **Vanilla CSS / PostCSS**: Standard CSS styling without utility-first Tailwind locks to maintain full flexibility.

### 2. Backend Express API (`apps/api`)
* **Express.js Server**: Serves REST endpoints for managing assignments, initiating paper generation, requesting PDFs, and querying status.
* **Socket.IO Server**: Manages WebSocket connections and maps active client sockets to their corresponding BullMQ jobs.
* **TSup Build System**: Compiles the Express server and BullMQ workers into separate production-optimized bundles (`dist/server.js` and `dist/worker.js`).
* **Embedded Worker Mode**: For free-tier deployment constraints, the Express server can spin up the background worker threads internally, preventing the need for a separate paid Render service.

### 3. Worker Process (`apps/api/src/workers`)
* **BullMQ Worker threads**: Subscribes to the `assessment-generation` and `pdf-generation` queues.
* **Decoupled execution**: Performs heavy workloads (AI API calls, schema repairs, and PDF generation with `pdfkit`) in background threads.
* **Redis Pub/Sub Connection**: Emits progress percentage updates to Redis, which the API server catches and pushes down to the specific connected browser socket.

### 4. Shared Package (`packages/shared`)
* **Types**: Common TypeScript models and interfaces shared across the workspace.
* **Zod Schemas**: Strict input validation schemas (e.g., `CreateAssignmentSchema`) shared between the client forms and backend route handlers, ensuring complete type safety.

---

## Key Data Flows

### Assessment Generation Flow
1. **Request**: The teacher clicks "Generate" on the Next.js UI, triggering a `POST` request to `/api/assignments/:id/generate`.
2. **Queueing**: The API server changes the assignment status to `queued` in MongoDB and pushes a job containing the assignment metadata onto the BullMQ `assessment-generation` queue.
3. **Execution**: The BullMQ worker picks up the job, changes the status to `processing`, and calls the designated AI provider (Gemini or Groq) with a custom-engineered prompt.
4. **Real-time updates**: Throughout generation, the worker updates the job progress (e.g., 25% - Prompt Construction, 40% - Generating Questions, 75% - Zod Validation, 90% - Database Insertion). These steps are published via Redis Pub/Sub, handled by the API, and broadcasted to the frontend via Socket.IO.
5. **Output Validation**: When the AI responds, the worker runs the JSON output through Zod schemas. If the AI output fails validation, a repair routine corrects common formatting issues.
6. **Completion**: The final validated paper is saved to MongoDB, and the assignment status is updated to `completed`. A final socket message sends the new document ID to the client, which automatically redirects the teacher to the output dashboard.

### PDF Export Flow
1. **Trigger**: The user clicks the "Download PDF" button.
2. **Check**: The frontend calls `POST /api/assignments/:id/pdf`. If a PDF has already been generated and is stored in MongoDB, the API returns its metadata immediately.
3. **Queueing**: If no PDF exists, a job is pushed to the `pdf-generation` queue.
4. **Compilation**: The PDF worker picks up the job and uses `pdfkit` to compile the paper (including student header, custom typography, difficulty badges, sections, and answer keys) into a raw buffer.
5. **Storage**: The worker saves the buffer directly to MongoDB as a binary blob associated with the generated paper.
6. **Streaming**: Once the generation status reads `ready`, the client hits `GET /api/assignments/:id/pdf/download`, and the API streams the binary buffer with proper `Content-Type: application/pdf` headers.
