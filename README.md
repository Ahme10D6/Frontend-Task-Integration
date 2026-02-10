# Frontend Developer Skills Test

## Overview

This project contains a **Create Agent** page from the Olimi AI dashboard. The UI is fully built but entirely static — all form dropdowns are hardcoded, file uploads don't persist, and the save/test-call buttons are non-functional.

**Your task:** Integrate the static UI with the provided mock API to make the form fully functional.

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **shadcn/ui** component library
- **Tailwind CSS 4**
- **json-server** (mock API)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
```

### 3. Start the mock API server

```bash
npm run mock-api
```

This starts `json-server` at **http://localhost:3001** with routes prefixed under `/api`.

### 4. Start the Next.js development server

```bash
npm run dev
```

Open **http://localhost:3000** — you'll be redirected to the Create Agent page.

> **Note:** Both servers must be running simultaneously. Use two terminal windows/tabs.

## Project Structure

```
├── db.json                          # Mock database (json-server)
├── server/
│   ├── middleware.js                 # Custom endpoints (upload, test-call)
│   └── routes.json                  # API route mapping (/api/* → /*)
├── src/
│   ├── app/
│   │   └── (dashboard)/
│   │       ├── layout.tsx           # Dashboard layout with sidebar
│   │       └── agents/
│   │           └── createAgent/
│   │               └── page.tsx     # Create Agent page
│   └── components/
│       ├── agents/
│       │   └── agent-form.tsx       # ⭐ MAIN FILE — this is where you'll work
│       ├── ui/                      # shadcn/ui components (do not modify)
│       ├── app-sidebar.tsx          # Sidebar navigation
│       ├── nav-main.tsx             # Navigation menu
│       └── nav-user.tsx             # User menu
└── .env.example                     # Environment template
```

The primary file you'll be modifying is **`src/components/agents/agent-form.tsx`**. You may create helper files (hooks, utilities, API clients) as needed.

## API Documentation

Base URL: `http://localhost:3001/api` (configured via `NEXT_PUBLIC_API_BASE_URL`)

### Reference Data Endpoints

These endpoints return static lists for populating form dropdowns.

#### GET /api/languages

Returns available languages.

```json
[
  { "id": "en", "name": "English", "code": "en" },
  { "id": "ar", "name": "Arabic", "code": "ar" },
  { "id": "fr", "name": "French", "code": "fr" }
]
```

#### GET /api/voices

Returns available voices. **Note the `tag` field** — display it as a badge next to the voice name.

```json
[
  { "id": "alloy", "name": "Alloy", "tag": "Premium", "language": "en" },
  { "id": "echo", "name": "Echo", "tag": "Standard", "language": "en" }
]
```

#### GET /api/prompts

Returns available prompt templates.

```json
[
  { "id": "default", "name": "Default Prompt", "description": "General-purpose prompt" },
  { "id": "sales", "name": "Sales Prompt", "description": "Optimized for sales" }
]
```

#### GET /api/models

Returns available AI models.

```json
[
  { "id": "pro", "name": "Pro", "description": "Highest quality, lowest latency" },
  { "id": "standard", "name": "Standard", "description": "Balanced quality and cost" }
]
```

### Agent CRUD

#### POST /api/agents

Create a new agent. Send the full form data as JSON.

**Request:**

```json
{
  "name": "Sales Assistant",
  "description": "Handles inbound sales calls",
  "callType": "inbound",
  "language": "en",
  "voice": "alloy",
  "prompt": "sales",
  "model": "pro",
  "latency": 0.5,
  "speed": 110,
  "callScript": "...",
  "serviceDescription": "...",
  "attachments": ["attachment-id-1"],
  "tools": {
    "allowHangUp": true,
    "allowCallback": false,
    "liveTransfer": false
  }
}
```

**Response** (201 Created):

```json
{
  "id": "generated-id",
  "name": "Sales Assistant",
  "...": "..."
}
```

#### PUT /api/agents/:id

Update an existing agent. Same body structure as POST.

### File Upload (3-Step Process)

Uploading a file to the agent's reference data requires three API calls:

#### Step 1: Get a signed upload URL

**POST /api/attachments/upload-url**

```json
// No body required
```

**Response:**

```json
{
  "key": "unique-file-key",
  "signedUrl": "http://localhost:3001/upload/unique-file-key",
  "expiresIn": 3600
}
```

#### Step 2: Upload the file to the signed URL

**PUT {signedUrl}**

Send the file as the request body (binary).

```
PUT http://localhost:3001/upload/unique-file-key
Content-Type: application/octet-stream

<file binary data>
```

**Response:**

```json
{
  "success": true,
  "key": "unique-file-key",
  "message": "File uploaded successfully"
}
```

#### Step 3: Register the attachment

**POST /api/attachments**

```json
{
  "key": "unique-file-key",
  "fileName": "product-catalog.pdf",
  "fileSize": 1048576,
  "mimeType": "application/pdf"
}
```

**Response** (201 Created):

```json
{
  "id": "generated-id",
  "key": "unique-file-key",
  "fileName": "product-catalog.pdf",
  "fileSize": 1048576,
  "mimeType": "application/pdf"
}
```

> Include the returned attachment `id` in the agent's `attachments` array when saving.

### Test Call

#### POST /api/agents/:id/test-call

Initiate a test call for an agent. The agent must be saved first.

**Request:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "gender": "male",
  "phoneNumber": "+1234567890"
}
```

**Response:**

```json
{
  "success": true,
  "callId": "generated-call-id",
  "agentId": "agent-id",
  "status": "initiated"
}
```

## Required Tasks

### Task 1: Fetch dropdown data from the API

Replace all hardcoded `<SelectItem>` lists in the Basic Settings section with data fetched from the API:

- **Language** dropdown → `GET /api/languages`
- **Voice** dropdown → `GET /api/voices` (display the `tag` as a badge)
- **Prompt** dropdown → `GET /api/prompts`
- **Model** dropdown → `GET /api/models`

#### Solution

- Implemented a reusable hook `useReferenceData` to fetch `languages`, `voices`, `prompts`, and `models` from the mock API.
- Wired the Basic Settings dropdowns in `AgentForm` to use this hook and render dynamic `<SelectItem>` options.
- Displayed the `voice.tag` value as a badge next to each voice option.

### Task 2: Implement file upload

Replace the current client-side-only file handling with the 3-step upload flow:

1. Request a signed URL (`POST /api/attachments/upload-url`)
2. Upload the file to the signed URL (`PUT {signedUrl}`)
3. Register the attachment (`POST /api/attachments`)

Show upload progress or status indicators for each file.

#### Solution

- Created a dedicated upload hook and handler helpers in `agent-form/handlers.ts` to orchestrate the 3‑step upload flow.
- Integrated the upload logic into `ReferenceFilesSection`, showing the current list of uploaded attachments.
- Surface upload state via an `uploading` flag so the UI can indicate progress/disabled states during upload.

### Task 3: Implement save agent

Wire up the **Save Agent** button to `POST /api/agents`:

- Collect all form fields and send them as JSON
- Show a success toast/notification on save
- Store the returned agent `id` so subsequent saves use `PUT /api/agents/:id`

#### Solution

- Added a `saveAgent` helper in `agent-form/handlers.ts` that calls `POST /api/agents` on first save and `PUT /api/agents/:id` on subsequent saves.
- Constructed a strongly typed `AgentPayload` from the `AgentForm` state and passed it to `saveAgent`.
- On success, store the returned `agentId` in component state and reset the “dirty” snapshot so unsaved-changes logic stays accurate.

### Task 4: Implement test call

Wire up the **Start Test Call** button:

- If the agent has unsaved changes, auto-save first (POST or PUT)
- Then call `POST /api/agents/:id/test-call` with the test call form data
- Show the call status to the user

#### Solution

- Implemented `startTestCall` in `agent-form/handlers.ts` to call `POST /api/agents/:id/test-call` with the test-call form data.
- The `onTestCall` handler in `AgentForm` auto-saves the agent (using `saveAgent`) if no `agentId` exists before starting the test call.
- Exposed `calling` state to the UI so the test-call button reflects in‑progress status.

## Bonus Tasks

These are optional but will positively impact your evaluation:

- **Unsaved changes alert** — Warn the user when navigating away with unsaved form changes
- **Loading states** — Show skeleton/spinner states while fetching dropdown data
- **Error handling** — Display user-friendly error messages for failed API calls
- **Form validation** — Validate required fields before save, show inline errors
- **UI/UX improvements** — Any improvements you think enhance the user experience

### Bonus Tasks – Implemented

- **Unsaved changes alert**: Added snapshot-based dirty checking plus a navigation guard that prompts the user with a SweetAlert dialog when leaving with unsaved changes.
- **Loading states**: Added skeleton loading states for all reference-data dropdowns while API requests are in flight.
- **Error handling**: Centralized API error handling via the `api` helper and user-friendly SweetAlert messages on failures (e.g. save or test call failures).
- **Form validation**: Implemented `useAgentFormValidation` to validate required fields, track touched state, and render inline error messages beneath invalid inputs.
- **UI/UX improvements**: Refactored the large `AgentForm` component into smaller, focused UI components (e.g. `BasicSettingsSection`, `CallScriptSection`, `ServiceDescriptionSection`, `ToolsSection`, `TestCallCard`) to improve readability, reusability, and scalability of the form UI.

## Evaluation Criteria

| Area | What we look for |
|------|-----------------|
| **Code quality** | Clean, readable, well-organized code |
| **React patterns** | Proper use of hooks, state management, component composition |
| **API integration** | Correct HTTP methods, error handling, loading states |
| **TypeScript** | Proper typing, interfaces, type safety |
| **Error handling** | Graceful failures, user feedback, edge cases |
| **Attention to detail** | Following instructions, matching existing code style |

## Time Expectation

This task is designed to take approximately **2–3 hours**. Focus on completing the required tasks well rather than rushing through the bonus tasks.

Good luck!
