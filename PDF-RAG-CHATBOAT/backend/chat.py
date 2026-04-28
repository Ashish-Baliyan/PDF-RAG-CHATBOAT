import os
from functools import lru_cache

from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from openai import OpenAI


load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333/")
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "learning_vectors")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-large")
CHAT_MODEL = os.getenv("CHAT_MODEL", "gpt-4o")


@lru_cache(maxsize=1)
def get_openai_client():
    return OpenAI()


@lru_cache(maxsize=1)
def get_vector_db():
    embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL)

    return QdrantVectorStore.from_existing_collection(
        url=QDRANT_URL,
        collection_name=QDRANT_COLLECTION,
        embedding=embeddings,
    )


def format_context(search_results):
    return "\n\n".join(
        [
            (
                f"Page Number: {result.metadata.get('page_label', 'Unknown')}\n"
                f"Content: {result.page_content}\n"
                f"File Location: {result.metadata.get('source', 'Unknown')}"
            )
            for result in search_results
        ]
    )


def serialize_sources(search_results):
    sources = []

    for result in search_results:
        sources.append(
            {
                "page": result.metadata.get("page_label"),
                "source": result.metadata.get("source"),
                "content": result.page_content,
            }
        )

    return sources


def ask_pdf(query: str):
    vector_db = get_vector_db()
    client = get_openai_client()

    search_results = vector_db.similarity_search(query=query)
    context = format_context(search_results)

    system_prompt = f"""You are a helpful AI assistant for answering user queries based on the available context retrieved from a PDF file.

Only answer the question based on the retrieved context. When useful, tell the user which page to open to know more.

{context}
"""

    response = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query},
        ],
    )

    return {
        "answer": response.choices[0].message.content,
        "sources": serialize_sources(search_results),
    }


if __name__ == "__main__":
    question = input("> ")
    result = ask_pdf(question)
    print(f"Assistant: {result['answer']}")
