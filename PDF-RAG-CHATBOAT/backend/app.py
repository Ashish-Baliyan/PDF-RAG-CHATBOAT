from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, model_validator

try:
    from .chat import ask_pdf
except ImportError:
    from chat import ask_pdf


app = FastAPI(title="PDF RAG Chatboat API")
PDF_PATH = Path(__file__).parent / "Learning-Node.pdf"

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    question: str | None = Field(default=None, min_length=1)
    query: str | None = Field(default=None, min_length=1)
    message: str | None = Field(default=None, min_length=1)

    @model_validator(mode="after")
    def require_prompt(self):
        if not (self.question or self.query or self.message):
            raise ValueError("question, query, or message is required")
        return self

    @property
    def prompt(self):
        return self.question or self.query or self.message


class Source(BaseModel):
    page: str | None = None
    source: str | None = None
    content: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[Source] = Field(default_factory=list)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/pdf")
def get_pdf():
    if not PDF_PATH.exists():
        raise HTTPException(status_code=404, detail="PDF file was not found.")

    return FileResponse(
        PDF_PATH,
        media_type="application/pdf",
        headers={"Content-Disposition": 'inline; filename="Learning-Node.pdf"'},
    )


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        return ask_pdf(request.prompt.strip())
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
