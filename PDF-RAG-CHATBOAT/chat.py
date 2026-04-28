from dotenv import load_dotenv
from langchain_qdrant import QdrantVectorStore
from langchain_openai import OpenAIEmbeddings
from openai import OpenAI


load_dotenv()

client = OpenAI()

# Vector Embedding
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-large"
)

vector_db = QdrantVectorStore.from_existing_collection(
    url="http://localhost:6333/",
    collection_name="learning_vectors",
    embedding=embeddings
)
# Text Input
query = input("> ")

# Vector Similarity Search in [query] in DB

search_results = vector_db.similarity_search(
    query=query
    
)

context = "\n\n".join([f"Page Number: {result.metadata['page_label']}\nContent: {result.page_content} \nFile Location: {result.metadata['source']}" for result in search_results])

System_Prompt = f"""You are a helpful AI assistant for answer user queries baseed on the available context retrieved from a
PDF file along with page content and page number. 

You should only answer the question based on the retrieved context and navigate the user to open the right page to know more about the answer.

{context}

"""

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system",
            "content": System_Prompt},
        {"role": "user",
            "content": query}
    ]
)

print(f"Assistant: {response.choices[0].message.content}")