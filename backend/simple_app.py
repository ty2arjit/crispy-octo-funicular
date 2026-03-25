import os
import re
import logging
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import chromadb
from chromadb.utils import embedding_functions
from langchain_openai import OpenAIEmbeddings
from langchain_openai import ChatOpenAI
import umap
import hdbscan
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# Set OpenAI API Key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("Please set OPENAI_API_KEY in .env file")
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

# Category definitions
CATEGORIES = {
    "sports": "Sports news about matches, athletes, teams and sporting events",
    "finance": "Financial markets, stocks, economy and business news",
    "politics": "Political news, elections, government policies",
    "lifestyle": "Lifestyle, health, travel, food and culture",
    "music": "Music artists, albums, concerts and industry news"
}

# Priority keywords
PRIORITY_KEYWORDS = {
    "sports": ["breaking", "championship", "cup final", "olympics", "transfer",
               "injury update", "record broken", "doping scandal", "last minute",
               "trophy", "victory", "defeat", "comeback"],
    "finance": ["alert", "breaking", "market crash", "rate hike", "earnings report",
                "recession", "inflation", "fed decision", "stock plunge", "merger",
                "bankruptcy", "crypto crash", "dividend", "short squeeze", "ipo"],
    "politics": ["election", "scandal", "resignation", "law passed", "protest",
                 "breaking", "impeachment", "summit", "sanctions", "diplomatic crisis",
                 "war", "treaty", "vote result", "corruption", "speech"],
    "lifestyle": ["viral", "trending", "recipe", "hack", "celebrity",
                  "wedding", "divorce", "pregnancy", "royal family", "makeover",
                  "controversial", "banned", "recall", "study finds"],
    "music": ["tour announced", "new album", "grammy", "controversy", "feud",
              "concert disaster", "chart-topping", "streaming record", "comeback",
              "breakup", "collaboration", "lyrics decoded", "canceled", "viral hit"]
}

# Initialize ChromaDB
chroma_client = chromadb.PersistentClient(path="./chroma_db")
embeddings = OpenAIEmbeddings()

# Initialize keyword patterns
keyword_patterns = {
    cat: re.compile(r'\b(' + '|'.join(map(re.escape, kws)) + r')\b')
    for cat, kws in PRIORITY_KEYWORDS.items()
}

def init_category_collection():
    """Initialize the categories collection in ChromaDB"""
    openai_ef = embedding_functions.OpenAIEmbeddingFunction(
        api_key=OPENAI_API_KEY,
        model_name="text-embedding-ada-002"
    )
    
    cat_coll = chroma_client.get_or_create_collection(
        name="news_categories",
        embedding_function=openai_ef,
        metadata={"description": "Prototype embeddings for news categories"}
    )
    
    # Upsert categories
    for cat_name, cat_prompt in CATEGORIES.items():
        cat_coll.upsert(
            ids=[cat_name],
            documents=[cat_prompt],
            metadatas=[{"category": cat_name}]
        )
    
    return cat_coll

def classify_text(text, cat_coll):
    """Classify a single text using the categories collection"""
    emb = embeddings.embed_query(text)
    results = cat_coll.query(query_embeddings=[emb], n_results=1)
    return results['ids'][0][0], results['distances'][0][0]

def is_priority(row):
    """Check if article is a priority based on keywords"""
    pat = keyword_patterns.get(row['predicted_category'])
    return bool(pat.search(row['title_lc'])) if pat else False

@retry(
    reraise=True,
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(Exception)
)
def upsert_articles(collection, docs, embs, ids, metas):
    """Upsert articles with retry logic"""
    collection.upsert(
        documents=docs,
        embeddings=embs,
        ids=ids,
        metadatas=metas
    )

def process_news(csv_path='datasets/Aggregated News Dataset - Sheet1.csv'):
    """Process news data: classify, cluster, and extract highlights"""
    logger.info(f"Loading news data from {csv_path}")
    
    # 1. Load and prepare data
    df = pd.read_csv(csv_path)
    df['text'] = (df['Title'].fillna('') + ' \n\n ' + df['news_summary'].fillna(''))
    if 'id' not in df.columns:
        df['id'] = df.index
    df = df[['id', 'Title', 'text']]
    
    # 2. Initialize category collection
    cat_coll = init_category_collection()
    
    # 3. Classify articles
    logger.info("Classifying articles")
    results = []
    for text in df['text'].tolist():
        category, similarity = classify_text(text, cat_coll)
        results.append((category, similarity))
    df['predicted_category'], df['similarity'] = zip(*results)
    
    # 4. Create embeddings and run clustering
    logger.info("Creating embeddings and clustering articles")
    embs = embeddings.embed_documents(df['text'].tolist())
    
    # 5. UMAP reduction
    umap_model = umap.UMAP(n_components=5, random_state=42)
    reduced = umap_model.fit_transform(embs)
    
    # 6. HDBSCAN clustering
    clusterer = hdbscan.HDBSCAN(min_cluster_size=15, prediction_data=True)
    clusters = clusterer.fit_predict(reduced)
    df['cluster'] = clusters
    
    # 7. Extract highlights
    logger.info("Extracting highlights")
    df['cluster_size'] = df.groupby('cluster')['id'].transform('count')
    df['title_lc'] = df['Title'].str.lower()
    df['is_priority'] = df.apply(is_priority, axis=1)
    df['highlight_score'] = df['is_priority'].astype(int) * 1000 + df['cluster_size']
    
    highlights = (
        df.sort_values(['predicted_category', 'highlight_score'], ascending=[True, False])
        .groupby('predicted_category')
        .head(5)
        .reset_index(drop=True)
    )
    
    # 8. Index articles for retrieval
    logger.info("Indexing articles for retrieval")
    art_coll = chroma_client.get_or_create_collection(
        name="news_articles",
        embedding_function=embedding_functions.OpenAIEmbeddingFunction(
            api_key=OPENAI_API_KEY,
            model_name="text-embedding-ada-002"
        ),
        metadata={"description": "All articles indexed for retrieval"}
    )
    
    # Prepare payload
    df['id'] = df['id'].astype(str)
    docs = df['text'].tolist()
    ids = df['id'].tolist()
    metas = df[['Title', 'predicted_category', 'cluster']].to_dict(orient='records')
    
    # Upsert articles
    try:
        upsert_articles(art_coll, docs, embs, ids, metas)
        logger.info(f"Successfully upserted {len(ids)} articles to 'news_articles'")
    except Exception as err:
        logger.error(f"Failed to upsert articles after retries: {err}")
    
    # 9. Save results to CSV
    df.to_csv('datasets/classified_news.csv', index=False)
    highlights.to_csv('datasets/daily_highlights.csv', index=False)
    
    return df, highlights

def init_highlights_collection():
    """Initialize the highlights collection for RAG"""
    highlights_path = 'datasets/daily_highlights.csv'
    
    # Get embedding function
    openai_ef = embedding_functions.OpenAIEmbeddingFunction(
        api_key=OPENAI_API_KEY,
        model_name="text-embedding-ada-002"
    )
    
    # Create or get collection
    highlights_coll = chroma_client.get_or_create_collection(
        name="highlights",
        embedding_function=openai_ef,
        metadata={"description": "News highlights for RAG"}
    )
    
    # Check if collection is empty
    if highlights_coll.count() > 0:
        logger.info(f"Found existing highlights collection with {highlights_coll.count()} documents")
        return highlights_coll
    
    # Load highlights data
    logger.info(f"Loading highlights data from {highlights_path}")
    try:
        highlights_df = pd.read_csv(highlights_path)
    except FileNotFoundError:
        logger.warning(f"Highlights file {highlights_path} not found. Vector store will be empty.")
        return highlights_coll
    
    # Prepare data
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
    
    # Upsert documents
    highlights_coll.upsert(
        ids=ids,
        documents=docs,
        metadatas=metadatas
    )
    
    logger.info(f"Added {len(ids)} highlights to the highlights collection")
    return highlights_coll

def answer_question(question, k=5):
    """Answer a question using RAG over news highlights"""
    # Initialize highlights collection
    highlights_coll = init_highlights_collection()
    
    # Query for similar documents
    results = highlights_coll.query(
        query_texts=[question],
        n_results=k,
        include=["documents", "metadatas"]
    )
    
    # Format context for prompt
    context = ""
    sources = []
    
    # Extract documents and metadata
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    
    for i, (doc, metadata) in enumerate(zip(documents, metadatas)):
        context += f"Document {i+1}: {doc}\n"
        if metadata:
            source = {
                "id": metadata.get("source_id", f"source-{i}"),
                "title": metadata.get("title", "Unknown"),
                "category": metadata.get("category", "Unknown")
            }
            if source not in sources:
                sources.append(source)
    
    # Generate answer
    llm = ChatOpenAI(temperature=0.1)
    
    prompt = f"""
    You are a helpful assistant that answers questions about today's news headlines.
    Use the following context to answer the question. If you don't know the answer, just say you don't know.
    Include relevant citations by referencing the source ID when appropriate.
    
    Context:
    {context}
    
    Question: {question}
    
    Answer:
    """
    
    answer = llm.invoke(prompt).content
    
    return {
        "answer": answer,
        "sources": sources
    }

# Initialize data on startup
def initialize_app():
    try:
        # Check if we have processed data
        if not os.path.exists('datasets/daily_highlights.csv'):
            logger.info("No processed data found. Running initial processing...")
            process_news()
        
        # Initialize highlights collection
        init_highlights_collection()
        logger.info("Highlights collection initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize: {str(e)}")

# API Endpoints
@app.route('/api/process', methods=['POST'])
def api_process_news():
    """Process news data from CSV"""
    try:
        csv_path = request.json.get('news_csv_path', 'datasets/Aggregated News Dataset - Sheet1.csv')
        df, highlights = process_news(csv_path)
        
        return jsonify({
            "message": "News processed successfully",
            "articles_count": len(df),
            "highlights_count": len(highlights),
            "categories": df["predicted_category"].value_counts().to_dict()
        })
    except Exception as e:
        logger.error(f"Error processing news: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/highlights', methods=['GET'])
def api_get_highlights():
    """Get news highlights, optionally filtered by category"""
    try:
        category = request.args.get('category')
        
        # Load highlights
        highlights_df = pd.read_csv('datasets/daily_highlights.csv')
        
        # Filter by category if requested
        if category:
            highlights_df = highlights_df[highlights_df["predicted_category"] == category]
        
        # Convert to list of dicts
        highlights = highlights_df.to_dict(orient="records")
        
        return jsonify({"highlights": highlights})
    except Exception as e:
        logger.error(f"Error getting highlights: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def api_chat():
    """Answer a question about news using RAG"""
    try:
        question = request.json.get('question')
        if not question:
            return jsonify({"error": "Question is required"}), 400
        
        result = answer_question(question)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Make sure data directories exist
    os.makedirs('datasets', exist_ok=True)
    os.makedirs('chroma_db', exist_ok=True)
    
    # Initialize the app
    initialize_app()
    
    # Run the app
    app.run(host='0.0.0.0', port=5001, debug=True) 