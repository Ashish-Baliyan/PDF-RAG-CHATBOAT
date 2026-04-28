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
VITE_API_BASE_URL=http://localhost:8000
VITE_CHAT_ENDPOINT=/chat
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
