import os
import pandas as pd
from pathlib import Path
from loguru import logger
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from config import Config
from .categorizer import NewsClassifier, prepare_article_text
from .clustering import NewsClustering
from .highlights import HighlightExtractor
from .vector_store import get_langchain_embeddings, init_chroma_client, get_openai_ef, upsert_articles

def process_news_pipeline(news_csv_path=None, highlights_csv_path=None, save_results=True):
    """Run the complete news processing pipeline
    
    Args:
        news_csv_path: Path to input news CSV (if None, use Config.NEWS_CSV_PATH)
        highlights_csv_path: Path to save highlights (if None, use Config.HIGHLIGHTS_CSV_PATH)
        save_results: Whether to save results to CSV
        
    Returns:
        tuple: (processed_df, highlights_df)
    """
    if news_csv_path is None:
        news_csv_path = Config.NEWS_CSV_PATH
    
    if highlights_csv_path is None:
        highlights_csv_path = Config.HIGHLIGHTS_CSV_PATH
    
    # 1. Load and prepare data
    logger.info(f"Loading news data from {news_csv_path}")
    df = pd.read_csv(news_csv_path)
    df = prepare_article_text(df)
    
    # 2. Initialize components
    classifier = NewsClassifier()
    clustering = NewsClustering()
    highlighter = HighlightExtractor()
    
    # 3. Classify articles
    logger.info("Classifying articles")
    df = classifier.classify_dataframe(df)
    
    # 4. Create embeddings for clustering
    logger.info("Creating embeddings for clustering")
    embeddings = classifier.batch_embed_texts(df['text'].tolist())
    
    # 5. Cluster articles
    logger.info("Clustering articles to detect duplicates")
    df = clustering.add_clusters_to_df(df, embeddings)
    
    # 6. Extract highlights
    logger.info("Extracting important highlights")
    highlights_df = highlighter.extract_highlights(df)
    
    # 7. Index articles in vector store
    logger.info("Indexing articles in vector store")
    upsert_articles(df, embeddings)
    
    # 8. Save results if requested
    if save_results:
        logger.info(f"Saving classified news to {Config.CLASSIFIED_ARTICLES_CSV_PATH}")
        df.to_csv(Config.CLASSIFIED_ARTICLES_CSV_PATH, index=False)
        
        logger.info(f"Saving highlights to {Config.HIGHLIGHTS_CSV_PATH}")
        highlights_df.to_csv(Config.HIGHLIGHTS_CSV_PATH, index=False)
    
    return df, highlights_df

def init_vector_store(highlights_path=None):
    """Initialize vector store with highlights for RAG using ChromaDB directly
    
    Args:
        highlights_path: Path to highlights CSV (if None, use Config.HIGHLIGHTS_CSV_PATH)
        
    Returns:
        collection: ChromaDB collection with highlights
    """
    if highlights_path is None:
        highlights_path = Config.HIGHLIGHTS_CSV_PATH
    
    # Initialize ChromaDB client
    chroma_client = init_chroma_client()
    
    # Get embedding function
    openai_ef = get_openai_ef()
    
    # Check if collection exists and delete it to ensure fresh data
    try:
        chroma_client.delete_collection(name="highlights")
        logger.info("Deleted existing highlights collection to refresh data")
    except Exception as e:
        logger.info(f"No existing collection found or error deleting: {str(e)}")
    
    # Create a fresh collection
    highlights_collection = chroma_client.create_collection(
        name="highlights",
        embedding_function=openai_ef,
        metadata={"description": "News highlights for RAG"}
    )
    
    # Load highlights data
    logger.info(f"Loading highlights data from {highlights_path}")
    try:
        highlights_df = pd.read_csv(highlights_path)
    except FileNotFoundError:
        logger.warning(f"Highlights file {highlights_path} not found. Vector store will be empty.")
        return highlights_collection
    
    # Prepare data for ChromaDB
    ids = highlights_df['id'].astype(str).tolist()
    docs = []
    metadatas = []
    
    for _, row in highlights_df.iterrows():
        # Combine title and text for document content
        doc_text = f"{row.get('Title', '')}. {row.get('text', '')}"
        docs.append(doc_text)
        
        # Add metadata
        metadata = {
            "source_id": str(row.get("id", "")),
            "title": row.get("Title", ""),
            "category": row.get("predicted_category", ""),
            "is_priority": bool(row.get("is_priority", False))
        }
        metadatas.append(metadata)
    
    # Upsert documents to collection
    if ids and docs and metadatas:
        highlights_collection.upsert(
            ids=ids,
            documents=docs,
            metadatas=metadatas
        )
        logger.info(f"Added {len(ids)} highlights to vector store")
    else:
        logger.warning("No documents to add to vector store")
    
    # No need to call persist - PersistentClient writes automatically
    
    return highlights_collection

def answer_question(question, vector_store=None, k=5):
    """Answer a question using RAG
    
    Args:
        question: User question
        vector_store: ChromaDB collection (if None, will be initialized)
        k: Number of documents to retrieve
        
    Returns:
        dict: {"answer": str, "sources": list}
    """
    from langchain_openai import ChatOpenAI
    from langchain.chains import LLMChain
    from langchain.prompts import PromptTemplate
    
    # Get or initialize vector store
    if vector_store is None:
        vector_store = init_vector_store()
    
    # Query for similar documents
    results = vector_store.query(
        query_texts=[question],
        n_results=k,
        include=["documents", "metadatas"]
    )
    
    # Format context for prompt
    context = ""
    sources = []
    
    # Extract documents and their metadata
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    
    for i, (doc, metadata) in enumerate(zip(documents, metadatas)):
        # Add document to context without the "Document X:" prefix
        context += f"{doc}\n\n"
        if metadata:
            source = {
                "id": metadata.get("source_id", f"source-{i}"),
                "title": metadata.get("title", "Unknown"),
                "category": metadata.get("category", "Unknown")
            }
            if source not in sources:
                sources.append(source)
    
    # Try to determine the question category to filter relevant sources
    categories = ["sports", "finance", "politics", "lifestyle", "music"]
    question_lower = question.lower()
    
    # Check if the question is clearly about a specific category
    question_category = None
    for category in categories:
        if category in question_lower:
            question_category = category
            break
    
    # Filter sources by category if we detected one
    if question_category:
        filtered_sources = [s for s in sources if s["category"] == question_category]
        # Only use filtered sources if we found enough, otherwise fall back to all sources
        if len(filtered_sources) >= 2:
            sources = filtered_sources
    
    # Create prompt template
    prompt_template = """
    You are a helpful assistant that answers questions about today's news headlines.
    Use the following context to answer the question. If you don't know the answer, just say you don't know.
    Don't refer to "Document 1" or other document numbers in your answer.
    Provide a natural, conversational response based on the information provided.
    
    Context:
    {context}
    
    Question: {question}
    
    Answer:
    """
    
    prompt = PromptTemplate(
        template=prompt_template,
        input_variables=["context", "question"]
    )
    
    # Create LLM chain
    llm = ChatOpenAI(temperature=0.1)
    chain = LLMChain(llm=llm, prompt=prompt)
    
    # Generate answer - replace deprecated run method with invoke
    chain_input = {"context": context, "question": question}
    result = chain.invoke(chain_input)
    
    # Extract the text from the result
    answer = result.get("text", "") if isinstance(result, dict) else str(result)
    
    return {
        "answer": answer,
        "sources": sources
    } 