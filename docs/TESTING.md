# Testing Guide

This document outlines the testing checklist and verification steps to validate the VedaAI Assessment Creator application.

## 1. Prerequisites

Make sure the local stack is running:
```bash
# Start MongoDB & Redis
pnpm docker:up

# Start local services
pnpm dev
```

---

## 2. Core Functional Testing Checklist

### 📋 Assignment Creation
1. Navigate to `http://localhost:3000/assignments/create`.
2. Try submitting the form empty. Verify Zod validation messages display for Title, Subject, Topic, Class, and Questions configuration.
3. Select "Multiple Choice Questions" (MCQs), set count to 3, difficulty to "Medium", and marks to 5.
4. Add a "Short Answer" question configuration: count 2, difficulty "Hard", marks 10.
5. Provide a valid due date (future date).
6. Click "Review & Confirm". Verify review details match your configurations.
7. Click "Submit". Verify redirect to dashboard and that the assignment status shows **Draft**.

### 📄 Supporting File Upload
1. Create a new assignment.
2. In the "Reference Material" section, upload a text file (`.txt`) or a PDF document.
3. Submit the assignment.
4. Verify that `fileMeta` (fileName, size, mimeType) is created in MongoDB and the file is successfully parsed.

### ⚙️ Real-time Generation Flow
1. Click **Generate** on any draft assignment on the dashboard.
2. Verify you are automatically redirected to `http://localhost:3000/assignments/:id/status`.
3. Verify that the stepper stages light up in sequence:
   - `Reading Materials`
   - `Constructing Prompts`
   - `AI Generation`
   - `Validation Checks`
   - `Database Save`
4. Confirm progress percentage bars fill up dynamically via WebSockets.
5. Verify that upon reaching 100%, the status panel shows a success checkmark and redirects you automatically to the output page.

### 🎓 Exam Paper Output & Layout
1. Verify the output page header shows details matching the Figma design:
   - Delhi Public School (Delhi NCR) header styling
   - Student details fields (Name, Roll Number, Section)
   - Duration and Total Marks (aggregated dynamically from question configurations)
2. Verify difficulty tags are present (color-coded badges for Easy, Medium, Hard).
3. Verify the layout divides questions into designated sections (e.g., Section A, Section B).
4. Verify that MCQs display multiple options (A, B, C, D) without redundant option prefixes.
5. Scroll down to the bottom and verify the **Answer Key** is present.

### 🔄 PDF Export & Streaming
1. On the output page, click the **Download PDF** button.
2. Verify a loading modal or progress indicator appears while the PDF kit compiles the document in the background.
3. Verify a native PDF download is triggered.
4. Open the downloaded PDF and confirm:
   - No text overlaps or page-cutoff issues.
   - Dynamic page numbers are placed at the bottom.
   - Clean spacing and table grids for questions.

---

## 3. Resilience & Fallback Testing

### 🤖 Mock Fallback Test
If you do not have active API keys configured, you can test the entire generation lifecycle using the mock provider:
1. In `apps/api/.env`, verify `AI_PROVIDER=mock`.
2. Click **Generate** on an assignment.
3. Verify the paper is generated instantly using the mock generation service with random dummy questions matching the requested configurations.

### 🔄 Fallback on API Failure
1. In `apps/api/.env`, configure `AI_PROVIDER=gemini` or `groq`, but provide an invalid or expired API key.
2. Verify `AI_FALLBACK_TO_MOCK=true`.
3. Click **Generate**.
4. The generation should start. It will attempt to call the AI provider, fail, fallback automatically, and output the paper marked as `mock_fallback` in the DB.
5. Check the `generatedBy` badge on the UI or query `GET /api/assignments/:id/result` to confirm.
