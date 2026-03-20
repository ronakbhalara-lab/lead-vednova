export const runtime = 'nodejs';

import { pool } from '@/lib/db';

// 🔥 Working RSS Sources
const RSS_FEEDS = {
  // Working RSS feeds
  remoteok_dev: 'https://remoteok.com/remote-dev-jobs.rss',
  weworkremotely: 'https://weworkremotely.com/categories/remote-programming-jobs.rss',
  reddit_forhire: 'https://www.reddit.com/r/forhire/.rss',
  reddit_jobs: 'https://www.reddit.com/r/jobs/.rss',
  reddit_freelance: 'https://www.reddit.com/r/freelance/.rss',
  
  // Alternative working feeds
  stackoverflow: 'https://stackoverflow.com/jobs/feed',
  github: 'https://github.com/jobs.rss',
  
  // General job boards
  jooble: 'https://rss.jooble.org/api/rss/UK?keywords=web+developer',
  ziprecruiter: 'https://www.ziprecruiter.com/feed/jobs.rss?search=web+developer'
};

// 🔍 Keywords filter
const KEYWORDS = [
  'web',
  'developer',
  'app',
  'mobile',
  'react',
  'node',
  'website',
  'software',
  'frontend',
  'backend',
  'fullstack',
  'javascript',
  'python',
  'php'
];

// Helper function to fetch with timeout
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Simple XML parser for RSS feeds
function parseRSS(xmlText) {
  const items = [];
  
  try {
    // Simple regex-based parsing to avoid external libraries
    const itemMatches = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
    
    for (const itemXml of itemMatches) {
      const titleMatch = itemXml.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>/i) ||
                         itemXml.match(/<title[^>]*>(.*?)<\/title>/i);
      const linkMatch = itemXml.match(/<link[^>]*>(.*?)<\/link>/i);
      
      if (titleMatch && linkMatch) {
        items.push({
          title: titleMatch[1] ? titleMatch[1].trim() : 'No Title',
          url: linkMatch[1] ? linkMatch[1].trim() : ''
        });
      }
    }
  } catch (error) {
    console.log('XML parsing error:', error.message);
  }
  
  return items;
}

export async function POST() {
  try {
    console.log('🚀 Starting FULL RSS scraping...');

    let allItems = [];

    // 🔄 Loop through feeds
    for (const [platform, url] of Object.entries(RSS_FEEDS)) {
      try {
        console.log(`📡 Fetching from ${platform}`);

        const response = await fetchWithTimeout(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const xmlText = await response.text();
        const items = parseRSS(xmlText);

        const processedItems = items.map(item => ({
          ...item,
          platform: platform
        }));

        allItems.push(...processedItems);
        console.log(`✅ ${platform}: ${processedItems.length} items`);

      } catch (err) {
        console.log(`❌ Error in ${platform}:`, err.message);
      }
    }

    console.log(`📊 Total fetched: ${allItems.length}`);

    // 🔍 Filter by keywords
    const filteredItems = allItems.filter(item =>
      KEYWORDS.some(keyword =>
        item.title.toLowerCase().includes(keyword)
      )
    );

    console.log(`🎯 After filter: ${filteredItems.length}`);

    // 💾 Insert into DB
    let inserted = 0;

    for (const item of filteredItems) {
      try {
        // Validate URL using WHATWG URL API
        if (!item.url) continue;
        
        try {
          new URL(item.url);
        } catch {
          console.log(`⚠️ Invalid URL: ${item.url}`);
          continue;
        }

        await pool.query(
          `INSERT INTO leads (title, url, platform)
           VALUES ($1, $2, $3)
           ON CONFLICT (url) DO NOTHING`,
          [item.title, item.url, item.platform]
        );

        inserted++;

      } catch (err) {
        console.log("DB Error:", err.message);
      }
    }

    console.log(`💾 Inserted: ${inserted}`);

    return Response.json({
      success: true,
      totalFetched: allItems.length,
      afterFilter: filteredItems.length,
      inserted: inserted,
      data: filteredItems.slice(0, 50),
    });

  } catch (error) {
    console.error('❌ Scraping failed:', error);

    return Response.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}