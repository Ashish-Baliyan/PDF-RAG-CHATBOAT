# PDF RAG Chatboat Frontend

React + Vite frontend for the PDF RAG backend.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The app reads these variables:

```bash
VITE_API_BASE_URL=/api
VITE_CHAT_ENDPOINT=/chat
```

During `npm run dev`, Vite proxies `/api` to the FastAPI backend at `http://localhost:8000`.
Start the backend before sending a chat message:

```bash
cd ../backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The chat client sends a `POST` request with this JSON payload:

```json
{
  "question": "Your question",
  "query": "Your question",
  "message": "Your question"
}
```

The response can be plain text or JSON. JSON response keys such as `answer`, `response`, `message`, or `result` are supported. Sources can be returned as `sources`, `context`, `documents`, or `references`.
