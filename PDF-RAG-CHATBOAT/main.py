from dotenv import load_dotenv
from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore


load_dotenv()

pdf_path = Path(__file__).parent/"Learning-Node.pdf"

# Load the PDF document using PyPDFLoader

loader = PyPDFLoader(file_path=pdf_path)

docs = loader.load()

# Text Splitters

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=400)
split_docs = text_splitter.split_documents(documents=docs)

# Vector Embedding

embeddings = OpenAIEmbeddings(
    model="text-embedding-3-large"
)

# Using embedding_model create embeddings of split_docs and store to DB

vector_store = QdrantVectorStore.from_documents(
    documents=split_docs,
    url="http://localhost:6333/",
    collection_name = "learning_vectors",
    embedding=embeddings
)

print("Indexing of Documents Done.....")

