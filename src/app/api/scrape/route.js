export const runtime = 'nodejs';

import { pool } from '@/lib/db';
import Parser from 'rss-parser';

const parser = new Parser();

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
  'software'
];

export async function POST() {
  try {
    console.log('🚀 Starting FULL RSS scraping...');

    let allItems = [];

    // 🔄 Loop through feeds
    for (const [platform, url] of Object.entries(RSS_FEEDS)) {
      try {
        console.log(`📡 Fetching from ${platform}`);

        const feed = await parser.parseURL(url);

        const items = (feed.items || []).map((item) => ({
          title: item.title || 'No Title',
          url: item.link || '',
          platform: platform,
        }));

        allItems.push(...items);

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
        if (!item.url) continue;

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