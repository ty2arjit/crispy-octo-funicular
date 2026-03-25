import os
import chromadb
from chromadb.utils import embedding_functions
from langchain_openai import OpenAIEmbeddings
from loguru import logger
from config import Config

def init_chroma_client():
    """Initialize ChromaDB client with persistent storage"""
    os.makedirs(Config.VECTOR_STORE_PATH, exist_ok=True)
    return chromadb.PersistentClient(path=Config.VECTOR_STORE_PATH)

def get_openai_ef():
    """Get OpenAI embedding function for ChromaDB"""
    return embedding_functions.OpenAIEmbeddingFunction(
        api_key=Config.OPENAI_API_KEY,
        model_name="text-embedding-ada-002"
    )

def get_langchain_embeddings():
    """Get LangChain OpenAI embeddings for compatibility with other modules"""
    return OpenAIEmbeddings(api_key=Config.OPENAI_API_KEY)

def init_categories_collection():
    """Initialize (or get) the categories collection using the direct ChromaDB approach"""
    # Initialize Chroma with persistent storage
    chroma_client = init_chroma_client()
    
    # Get OpenAI embedding function
    openai_ef = get_openai_ef()
    
    # Create or get the collection for categories
    cat_coll = chroma_client.get_or_create_collection(
        name="news_categories",
        embedding_function=openai_ef,
        metadata={"description": "Prototype embeddings for news categories"}
    )
    
    # Upsert one document per category
    for cat_name, cat_prompt in Config.NEWS_CATEGORIES.items():
        cat_coll.upsert(
            ids=[cat_name],
            documents=[cat_prompt],
            metadatas=[{"category": cat_name}]
        )
    
    logger.info(f"Categories collection initialized with {len(Config.NEWS_CATEGORIES)} categories")
    return cat_coll

def init_articles_collection():
    """Initialize (or get) the articles collection"""
    chroma_client = init_chroma_client()
    openai_ef = get_openai_ef()
    
    collection = chroma_client.get_or_create_collection(
        name="news_articles",
        embedding_function=openai_ef,
        metadata={"description": "All articles indexed for retrieval"}
    )
    
    return collection

def upsert_articles(articles_df, embeddings):
    """Upsert articles to the vector store
    
    Args:
        articles_df: DataFrame with articles (must contain id, text, Title, predicted_category, cluster)
        embeddings: List of embeddings for each article
    """
    collection = init_articles_collection()
    
    # Ensure IDs are strings
    articles_df = articles_df.copy()
    articles_df['id'] = articles_df['id'].astype(str)
    
    # Prepare payload
    docs = articles_df['text'].tolist()
    ids = articles_df['id'].tolist()
    metas = articles_df[['Title', 'predicted_category', 'cluster']].to_dict(orient='records')
    
    # Upsert articles
    collection.upsert(
        documents=docs,
        embeddings=embeddings,
        ids=ids,
        metadatas=metas
    )
    
    logger.info(f"Upserted {len(ids)} articles to the vector store")
    return collection 