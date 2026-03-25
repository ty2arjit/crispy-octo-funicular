import os
import pandas as pd
from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
from pydantic import BaseModel, Field
from loguru import logger
import time
from dotenv import load_dotenv
from rag.utils import init_vector_store, answer_question, process_news_pipeline
from config import Config
from datetime import datetime

# Configure logger
logger.add("app.log", rotation="500 MB", level="INFO")

# Request validation
class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1)

class ProcessNewsRequest(BaseModel):
    news_csv_path: str = None
    highlights_csv_path: str = None

# Create Blueprint for API routes
api_bp = Blueprint("api", __name__, url_prefix="/api")

@api_bp.route("/chat", methods=["POST"])
def chat():
    try:
        # Validate request
        data = request.json
        chat_request = ChatRequest(**data)
        
        # Get answer using RAG
        start_time = time.time()
        result = answer_question(chat_request.question)
        logger.info(f"Question answered in {time.time() - start_time:.2f}s: {chat_request.question}")
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({"error": "Failed to process request"}), 500

@api_bp.route("/process", methods=["POST"])
def process_news():
    try:
        # Validate request
        data = request.json or {}
        news_csv_path = data.get("news_csv_path", Config.NEWS_CSV_PATH)
        highlights_csv_path = data.get("highlights_csv_path", Config.HIGHLIGHTS_CSV_PATH)
        
        # Process news
        start_time = time.time()
        df, highlights_df = process_news_pipeline(
            news_csv_path=news_csv_path,
            highlights_csv_path=highlights_csv_path
        )
        
        logger.info(f"News processed in {time.time() - start_time:.2f}s")
        
        return jsonify({
            "message": "News processed successfully",
            "articles_count": len(df),
            "highlights_count": len(highlights_df),
            "categories": df["predicted_category"].value_counts().to_dict()
        })
    
    except Exception as e:
        logger.error(f"Error in process endpoint: {str(e)}")
        return jsonify({"error": f"Failed to process news: {str(e)}"}), 500

@api_bp.route("/highlights", methods=["GET"])
def get_highlights():
    try:
        category = request.args.get("category", None)
        
        # Load highlights
        highlights_df = pd.read_csv(Config.HIGHLIGHTS_CSV_PATH)
        
        # Filter by category if requested
        if category:
            highlights_df = highlights_df[highlights_df["predicted_category"] == category]
        
        # Convert to list of dicts
        highlights = highlights_df.to_dict(orient="records")
        
        return jsonify({"highlights": highlights})
    
    except Exception as e:
        logger.error(f"Error in highlights endpoint: {str(e)}")
        return jsonify({"error": f"Failed to get highlights: {str(e)}"}), 500

@api_bp.route("/articles", methods=["GET"])
def get_articles():
    try:
        category = request.args.get("category", None)
        page = int(request.args.get("page", 1))
        page_size = int(request.args.get("pageSize", 10))
        q = request.args.get("q", None)
        
        logger.info(f"Articles request - category: {category}, page: {page}, page_size: {page_size}, q: {q}")
        
        # Load articles from classified_articles.csv
        logger.info(f"Loading articles from {Config.CLASSIFIED_ARTICLES_CSV_PATH}")
        try:
            articles_df = pd.read_csv(Config.CLASSIFIED_ARTICLES_CSV_PATH)
            logger.info(f"Loaded {len(articles_df)} articles from classified articles file")
        except FileNotFoundError:
            # Try with classified_articles.csv instead
            logger.info("File not found, trying with classified_articles.csv instead")
            articles_df = pd.read_csv("datasets/classified_articles.csv")
            logger.info(f"Loaded {len(articles_df)} articles from fallback file")
        
        # Examine a sample to debug
        logger.info(f"Sample article: {articles_df.iloc[0].to_dict()}")
        
        # Load original news dataset for additional fields
        logger.info(f"Loading original news from {Config.NEWS_CSV_PATH}")
        news_df = pd.read_csv(Config.NEWS_CSV_PATH)
        logger.info(f"Loaded {len(news_df)} news items from original file")
        
        # Ensure ID columns are proper strings for matching
        articles_df['id'] = articles_df['id'].astype(str)
        news_df['id'] = news_df.index.astype(str)
        
        # For debugging, check the IDs
        logger.info(f"Article IDs format: {type(articles_df['id'].iloc[0])}, News IDs format: {type(news_df['id'].iloc[0])}")
        logger.info(f"Article ID sample: {articles_df['id'].iloc[0]}, News ID sample: {news_df['id'].iloc[0]}")
        
        # Merge the dataframes
        merged_df = pd.merge(
            articles_df,
            news_df,
            left_on='id',
            right_on='id',
            how='left',
            suffixes=('', '_orig')
        )
        
        logger.info(f"Merged dataset has {len(merged_df)} rows")
        
        if len(merged_df) == 0:
            logger.error("Merged dataset is empty - merge failed!")
            # Return empty articles but don't fail
            return jsonify({
                "articles": [],
                "totalResults": 0,
                "error": "No articles found after merging datasets"
            })
        
        # Handle possible missing columns gracefully
        required_cols = ['Author', 'news_card_image', 'Link', 'Publication', 
                         'news_summary', 'Date Published', 'text', 'predicted_category', 
                         'Title']
        
        for col in required_cols:
            if col not in merged_df.columns:
                logger.warning(f"Column {col} not found in merged dataframe, creating empty column")
                merged_df[col] = ""
        
        # Prepare field mappings with safe access
        author = merged_df.get('Author', '').fillna('')
        merged_df['author'] = author.replace('nil', '')
        
        merged_df['urlToImage'] = merged_df.get('news_card_image', '').fillna('')
        merged_df['url'] = merged_df.get('Link', '').fillna('')
        merged_df['publication'] = merged_df.get('Publication', '').fillna('')
        
        # Handle description field - replace 'nil' with empty string
        news_summary = merged_df.get('news_summary', '').fillna('')
        merged_df['description'] = news_summary.replace('nil', '')
        
        # Convert date format to ISO format for proper frontend display
        try:
            # Set a fixed date for all articles (May 10, 2025)
            fixed_date = pd.Timestamp('2025-05-10T12:00:00Z')
            merged_df['publishedAt'] = fixed_date.strftime('%Y-%m-%dT%H:%M:%SZ')
            
        except Exception as e:
            logger.error(f"Error setting fixed date: {str(e)}")
            # Fallback to the original value
            merged_df['publishedAt'] = merged_df.get('Date Published', '').fillna('')
        
        merged_df['content'] = merged_df.get('text', '').fillna('')
        merged_df['category'] = merged_df.get('predicted_category', '').fillna('general')
        
        # Filter by category if requested
        if category and category != 'general':
            merged_df = merged_df[merged_df["predicted_category"] == category]
            logger.info(f"Filtered to {len(merged_df)} articles for category {category}")
        
        # Filter by search query if provided
        if q:
            q = q.lower()
            merged_df = merged_df[
                merged_df["Title"].str.lower().str.contains(q, na=False) | 
                merged_df["news_summary"].str.lower().str.contains(q, na=False)
            ]
            logger.info(f"Filtered to {len(merged_df)} articles for search query '{q}'")
        
        # Count total results before pagination
        total_results = len(merged_df)
        
        # Paginate results
        start_idx = (page - 1) * page_size
        end_idx = min(start_idx + page_size, len(merged_df))
        
        # Validate pagination indices
        if start_idx >= len(merged_df):
            logger.warning(f"Pagination start index {start_idx} exceeds dataset size {len(merged_df)}")
            paginated_df = pd.DataFrame(columns=merged_df.columns)
        else:
            paginated_df = merged_df.iloc[start_idx:end_idx]
        
        logger.info(f"Returning page {page} with {len(paginated_df)} articles (indices {start_idx}:{end_idx})")
        
        # Convert to list of dicts with proper article structure
        articles = []
        for _, row in paginated_df.iterrows():
            # Debug output to understand the data structure 
            logger.info(f"Processing article row: {row['id']} - {row['Title']}")
            try:
                article = {
                    'id': str(row['id']),
                    'title': str(row['Title']),
                    'description': str(row['description']),
                    'content': str(row['content']),
                    'source': {
                        'id': str(row['publication']),
                        'name': str(row['publication'])
                    },
                    'author': str(row['author']),
                    'url': str(row['url']),
                    'urlToImage': str(row['urlToImage']),
                    'publishedAt': str(row['publishedAt']),
                    'category': str(row['category'])
                }
                articles.append(article)
                
                # Log successful conversion for debugging
                if len(articles) == 1:
                    logger.info(f"First article converted successfully: {article}")
            except Exception as e:
                logger.error(f"Error converting article {row['id']}: {str(e)}")
                # Continue processing other articles
        
        result = {
            "articles": articles,
            "totalResults": total_results
        }
        
        # Log the first article for debugging
        if articles:
            logger.info(f"First article example: {articles[0]}")
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error in articles endpoint: {str(e)}", exc_info=True)
        return jsonify({"error": f"Failed to get articles: {str(e)}"}), 500

# Error handlers
@api_bp.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Bad request"}), 400

@api_bp.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404

def create_app(config=Config):
    app = Flask(__name__)
    
    # Configure CORS - update to allow all origins for development
    CORS(app, origins=["*"])  # Allow all origins for debugging
    # CORS(app, origins=config.CORS_ORIGINS)
    
    # Register blueprints
    app.register_blueprint(api_bp)
    
    # Initialize data on startup - this replaces the deprecated before_first_request
    with app.app_context():
        try:
            # Check if we need to run initial processing
            if not os.path.exists(Config.HIGHLIGHTS_CSV_PATH):
                logger.info("Running initial news processing...")
                process_news_pipeline()
            
            # Initialize vector store 
            logger.info("Initializing vector store...")
            init_vector_store()
            logger.info("Vector store initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize: {str(e)}")
    
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG) 