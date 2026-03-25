const Parser = require("rss-parser");

const parser = new Parser();

const FEEDS = {
  economy: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
  startups: "https://economictimes.indiatimes.com/small-biz/startups/rssfeeds/55786264.cms",
  technology: "https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms",
  politics: "https://economictimes.indiatimes.com/news/politics-and-nation/rssfeeds/1715249553.cms",
  markets: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
  india: "https://economictimes.indiatimes.com/news/rssfeedsdefault.cms"
};

function normalizeTopic(topic) {
  const key = (topic || "").toLowerCase();
  return FEEDS[key] ? key : "india";
}

async function fetchArticlesByTopic(topic, limit = 8) {
  const topicKey = normalizeTopic(topic);
  const feedUrl = FEEDS[topicKey];
  const feed = await parser.parseURL(feedUrl);

  const items = (feed.items || []).slice(0, limit).map((item) => ({
    title: item.title,
    link: item.link,
    pubDate: item.pubDate,
    summary: item.contentSnippet || item.content || ""
  }));

  return { topic: topicKey, items };
}

module.exports = {
  fetchArticlesByTopic,
  normalizeTopic
};
