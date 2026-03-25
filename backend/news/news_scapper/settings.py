BOT_NAME = "news_scraper"

SPIDER_MODULES = ["news_scraper.spiders"]
NEWSPIDER_MODULE = "news_scraper.spiders"

# robots.txt
ROBOTSTXT_OBEY = False

# Enable the SQLite storage pipeline
ITEM_PIPELINES = {
    'news_scraper.pipelines.NewsScraperPipeline': 300,
}

# Add these settings
FEED_FORMAT = "json"
FEED_URI = "../news.json"  # Output file path
FEED_EXPORT_ENCODING = "utf-8"

# Set user agent to prevent blocks
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
ROBOTSTXT_OBEY = False #changing rules to run scrapy

#CONCURRENT_REQUESTS = 32
TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"
FEED_EXPORT_ENCODING = "utf-8"