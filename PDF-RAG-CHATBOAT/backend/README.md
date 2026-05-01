# PDF RAG Chatboat Backend

FastAPI backend for asking questions against `Learning-Node.pdf` using OpenAI, LangChain, and Qdrant.

## Requirements

- Python 3.10+
- Docker and Docker Compose
- OpenAI API key
- The PDF file at `backend/Learning-Node.pdf`

## Setup

From the `backend` folder:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create the project environment file from the repository root:

```bash
cd ..
cp .env-example .env
```

Edit `.env` and add your OpenAI key:

```bash
OPENAI_API_KEY=your_openai_api_key
```

Optional backend variables:

```bash
QDRANT_URL=http://localhost:6333/
QDRANT_COLLECTION=learning_vectors
EMBEDDING_MODEL=text-embedding-3-large
CHAT_MODEL=gpt-4o
```

## Start Qdrant

From the `backend` folder:

```bash
docker compose up -d
```

Check that Qdrant is reachable:

```bash
curl http://localhost:6333/
```

## Index the PDF

Run this once after Qdrant is running:

```bash
python3 main.py
```

Expected output:

```text
Indexing of Documents Done.....
```

Run indexing again whenever you replace `backend/Learning-Node.pdf` or change the collection.

## Start the API

From the `backend` folder:

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Or from the repository root:

```bash
uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```

## Verify

Health check:

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{"status":"ok"}
```

PDF endpoint:

```bash
curl -o /tmp/learning-node.pdf http://localhost:8000/pdf
```

Chat request:

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"What is Node.js used for?"}'
```

## Endpoints

```text
GET  /health
GET  /pdf
POST /chat
```

`POST /chat` accepts any of these prompt keys:

```json
{
  "question": "What is Node.js used for?",
  "query": "What is Node.js used for?",
  "message": "What is Node.js used for?"
}
```

The response shape is:

```json
{
  "answer": "Answer text",
  "sources": [
    {
      "page": "1",
      "source": "/path/to/Learning-Node.pdf",
      "content": "Relevant PDF text"
    }
  ]
}
```

The frontend uses each `sources[].page` value to open `/pdf#page=<page-number>`.

## Troubleshooting

- `Backend API is not reachable`: make sure Uvicorn is running on port `8000`.
- Qdrant connection errors: run `docker compose up -d` from `backend`.
- Empty or irrelevant answers: run `python3 main.py` again to rebuild the vector collection.
- PDF page links return `404`: confirm `backend/Learning-Node.pdf` exists.
- OpenAI errors: confirm `.env` contains a valid `OPENAI_API_KEY`.
