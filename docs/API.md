# API Documentation

This document describes the REST API endpoints and Socket.IO event structures supported by the VedaAI Assessment Creator API.

## Base URLs

* **Local Development**: `http://localhost:4000`
* **Production Deployed API**: `https://vedaai-api-kk5b.onrender.com`

---

## REST Endpoints

### Health Check

#### `GET /health` or `GET /api/health`
Checks the connection status of the MongoDB database, Redis instance, and reports the current server uptime.
* **Response (200 OK)**:
  ```json
  {
    "status": "ok",
    "service": "vedaai-api",
    "environment": "production",
    "uptimeSeconds": 145.23,
    "mongo": "connected",
    "redis": "connected",
    "timestamp": "2026-05-28T10:00:00.000Z"
  }
  ```

---

### Assignments Management

#### `GET /api/assignments`
Lists all created assignments, filterable by search term and status.
* **Query Parameters**:
  * `search` (string, optional): Filters assignments by title/subject/topic.
  * `status` (string, optional): Filters by `draft`, `queued`, `processing`, `completed`, or `failed`.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "603fde1a6530a21a99876543",
        "title": "Introduction to Algorithms",
        "subject": "Computer Science",
        "gradeLevel": "Grade 11",
        "topic": "Sorting & Searching",
        "status": "completed",
        "createdAt": "2026-05-28T10:00:00.000Z"
      }
    ]
  }
  ```

#### `POST /api/assignments`
Creates a new assignment configuration. Supports optional file attachments (e.g., PDFs, TXT, or images) to parse reference materials.
* **Request Format**: `multipart/form-data`
* **Payload Fields**:
  * `data` (JSON string, required): Serialized Zod schema representing the assignment:
    ```json
    {
      "title": "Linear Algebra Basics",
      "subject": "Mathematics",
      "gradeLevel": "Grade 10",
      "topic": "Vector Spaces & Matrices",
      "questions": [
        { "type": "mcq", "difficulty": "easy", "count": 5 }
      ],
      "additionalInstructions": "Focus on dot products."
    }
    ```
  * `file` (Binary File, optional): Supporting materials file (max 10MB).
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "603fde1a6530a21a99876544",
      "title": "Linear Algebra Basics",
      "subject": "Mathematics",
      "gradeLevel": "Grade 10",
      "status": "draft",
      "fileMeta": {
        "fileName": "lecture1.pdf",
        "mimeType": "application/pdf",
        "size": 1048576
      }
    }
  }
  ```

#### `GET /api/assignments/:id`
Retrieves a single assignment by its MongoDB ObjectId.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "603fde1a6530a21a99876544",
      "title": "Linear Algebra Basics",
      "status": "draft"
    }
  }
  ```

#### `PATCH /api/assignments/:id`
Updates an assignment's configuration (only allowed for assignments in `draft` or `failed` states).
* **Payload (JSON)**: Partial assignment configuration fields.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "603fde1a6530a21a99876544",
      "title": "Linear Algebra Advanced"
    }
  }
  ```

#### `DELETE /api/assignments/:id`
Deletes an assignment along with its generated paper and any associated PDF documents.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": { "id": "603fde1a6530a21a99876544" }
  }
  ```

---

### AI Paper Generation

#### `POST /api/assignments/:id/generate`
Queues a BullMQ background job to generate the assessment paper.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "assignmentId": "603fde1a6530a21a99876544",
      "jobId": "12",
      "status": "queued"
    }
  }
  ```

#### `POST /api/assignments/:id/regenerate`
Queues a new generation job, forcing the worker to skip Redis caches and generate fresh questions.
* **Response (200 OK)**: Same as `/api/assignments/:id/generate`.

#### `GET /api/assignments/:id/generation-state`
Retrieves the real-time processing status of the generation job.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "assignmentId": "603fde1a6530a21a99876544",
      "jobId": "12",
      "status": "processing",
      "progress": 40,
      "message": "Generating structured question paper...",
      "currentStep": "generating_questions"
    }
  }
  ```

#### `GET /api/assignments/:id/result`
Retrieves the latest generated assessment paper for an assignment.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "603fde1a6530a21a99876599",
      "assignmentId": "603fde1a6530a21a99876544",
      "title": "Linear Algebra Basics",
      "subject": "Mathematics",
      "className": "Grade 10",
      "topic": "Vector Spaces & Matrices",
      "sections": [
        {
          "title": "Section A: Multiple Choice Questions",
          "questions": [
            {
              "type": "mcq",
              "text": "What is the identity matrix?",
              "options": ["A", "B", "C", "D"],
              "answer": "A",
              "difficulty": "easy",
              "marks": 2
            }
          ]
        }
      ],
      "generatedBy": "gemini"
    }
  }
  ```

---

### PDF Operations

#### `POST /api/assignments/:id/pdf`
Starts compilation of the generated paper into a PDF document.
* **Request Payload**:
  * `force` (boolean, optional): Set to `true` to overwrite any existing PDF document.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "assignmentId": "603fde1a6530a21a99876544",
      "jobId": "pdf_12",
      "status": "processing"
    }
  }
  ```

#### `GET /api/assignments/:id/pdf/state`
Returns the status of the PDF compilation job.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "status": "ready",
      "size": 142054,
      "fileName": "Mathematics_Grade_10_Vector_Spaces.pdf"
    }
  }
  ```

#### `GET /api/assignments/:id/pdf/download`
Streams the binary PDF buffer directly for browser download.
* **Response Headers**:
  * `Content-Type: application/pdf`
  * `Content-Disposition: attachment; filename="..."`
  * `Content-Length: ...`

---

## WebSocket Events (Socket.IO)

Clients connect to the root namespace.

### Outgoing Events (Client → Server)

#### `subscribe`
Subscribes the connection to receive progress updates for a specific assignment ID.
* **Payload**:
  ```json
  { "assignmentId": "603fde1a6530a21a99876544" }
  ```

---

### Incoming Events (Server → Client)

#### `progress`
Pushed when the worker updates the paper generation progress.
* **Payload**:
  ```json
  {
    "status": "processing",
    "progress": 40,
    "message": "Generating structured question paper...",
    "currentStep": "generating_questions"
  }
  ```

#### `completed`
Pushed when paper generation completes.
* **Payload**:
  ```json
  {
    "status": "completed",
    "progress": 100,
    "message": "Question paper generated successfully!",
    "resultId": "603fde1a6530a21a99876599"
  }
  ```

#### `failed`
Pushed if paper generation fails.
* **Payload**:
  ```json
  {
    "status": "failed",
    "progress": 0,
    "error": "Failed to connect to AI provider"
  }
  ```
