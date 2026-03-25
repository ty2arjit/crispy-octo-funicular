import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RSS_FEEDS = [
  { name: "ET Top Stories", url: "https://economictimes.indiatimes.com/rssfeedstopstories.cms" },
  { name: "ET Markets", url: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms" },
  { name: "ET Tech", url: "https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms" },
  { name: "TOI Top Stories", url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms" },
  { name: "TOI Business", url: "https://timesofindia.indiatimes.com/rssfeeds/1898055.cms" },
];

interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  category: string;
}

function parseXML(xml: string, sourceName: string): FeedItem[] {
  const items: FeedItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/)?.[1] || itemXml.match(/<title>(.*?)<\/title>/)?.[1] || "";
    const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || "";
    const desc = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]>|<description>(.*?)<\/description>/)?.[1] || itemXml.match(/<description>(.*?)<\/description>/)?.[1] || "";
    const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";

    if (title) {
      items.push({
        title: title.trim(),
        link: link.trim(),
        description: desc.replace(/<[^>]*>/g, "").trim(),
        pubDate,
        source: sourceName,
        category: sourceName.includes("Market") ? "Economy" : sourceName.includes("Tech") ? "Technology" : "General",
      });
    }
  }

  return items;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const allItems: FeedItem[] = [];

    const fetchPromises = RSS_FEEDS.map(async (feed) => {
      try {
        const response = await fetch(feed.url, {
          headers: { "User-Agent": "NewsNavigator/1.0" },
        });
        if (!response.ok) {
          console.error(`Failed to fetch ${feed.name}: ${response.status}`);
          return [];
        }
        const xml = await response.text();
        return parseXML(xml, feed.name);
      } catch (e) {
        console.error(`Error fetching ${feed.name}:`, e);
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    results.forEach((items) => allItems.push(...items));

    // Sort by date, most recent first
    allItems.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime() || 0;
      const dateB = new Date(b.pubDate).getTime() || 0;
      return dateB - dateA;
    });

    // Return top 30 items
    return new Response(
      JSON.stringify({ success: true, articles: allItems.slice(0, 30) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("RSS feed error:", e);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to fetch RSS feeds" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
