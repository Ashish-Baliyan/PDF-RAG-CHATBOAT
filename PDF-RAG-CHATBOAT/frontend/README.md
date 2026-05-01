# PDF RAG Chatboat Frontend

React + Vite frontend for the PDF RAG backend. The UI sends chat questions to FastAPI and displays source snippets with clickable PDF page numbers.

## Requirements

- Node.js 18+
- npm
- Backend API running on `http://localhost:8000`

## Setup

From the `frontend` folder:

```bash
cd frontend
npm install
cp .env.example .env
```

Default environment values:

```bash
VITE_API_BASE_URL=/api
VITE_CHAT_ENDPOINT=/chat
```

During local development, Vite proxies `/api` to the FastAPI backend at `http://localhost:8000`.

## Start Backend First

In a separate terminal:

```bash
cd backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Verify the backend:

```bash
curl http://localhost:8000/health
```

## Start Frontend

From the `frontend` folder:

```bash
npm run dev
```

Open:

```text
http://localhost:5173/
```

## Verify Frontend Proxy

With `npm run dev` running:

```bash
curl http://localhost:5173/api/health
curl -o /tmp/learning-node.pdf http://localhost:5173/api/pdf
```

Both calls should be forwarded to the backend.

## Build

```bash
npm run build
```

The production build is created in `frontend/dist`.

Preview the production build:

```bash
npm run preview
```

## How Chat Works

The frontend sends this request to `/api/chat`:

```json
{
  "question": "Your question",
  "query": "Your question",
  "message": "Your question"
}
```

The backend can return plain text or JSON. JSON answer keys such as `answer`, `response`, `message`, or `result` are supported.

Sources can be returned as `sources`, `context`, `documents`, or `references`.

Expected source item shape:

```json
{
  "page": "3",
  "source": "Learning-Node.pdf",
  "content": "Relevant PDF snippet"
}
```

When a source has a page number, the UI renders it as a clickable link. Clicking `Page 3` opens:

```text
/api/pdf#page=3
```

## Troubleshooting

- `Backend API is not reachable`: start the backend on port `8000`.
- `500` response from chat: confirm Qdrant is running and the PDF has been indexed.
- Page number opens a blank or missing PDF: confirm `backend/Learning-Node.pdf` exists and `/api/pdf` returns `application/pdf`.
- Browser cannot reach API from another device: use the Vite network URL and make sure the backend CORS origin matches your local network address.
