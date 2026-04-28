# PDF-RAG-CHATBOAT Backend

FastAPI backend for asking questions against the indexed PDF content stored in Qdrant.

## Run Qdrant

```bash
docker compose up -d
```

## Index the PDF

Run this once after Qdrant is available:

```bash
python3 main.py
```

## Start the API

From the `backend` folder:

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Or from the project root:

```bash
uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints

```text
GET  /health
POST /chat
```

Example chat request:

```json
{
  "question": "What is Node.js used for?"
}
```
