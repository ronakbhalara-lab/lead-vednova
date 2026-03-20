// src/jobs/cron.js

import cron from 'node-cron';
import { scrapeAllPlatforms } from '../services/scraper.js';
import { fetchFeeds } from '../services/fetchFeeds.js';
import { isValidLead } from '../services/filter.js';
import { detectPlatform } from '../services/detectPlatform.js';
import { extractRealUrl } from '../services/extractUrl.js';
import { pool } from '../lib/db.js';

let isRunning = false;

cron.schedule('*/5 * * * *', async () => {

  if (isRunning) return;
  isRunning = true;

  console.log("⏳ Fetching REAL client leads...");

  try {
    // Process ALL platforms (Freelancer, UpWork, IndiaMart, JustDial)
    console.log("🌐 Scraping all platforms...");
    await scrapeAllPlatforms();
    
    // Process RSS feeds
    const feedItems = await fetchFeeds();

    for (let item of feedItems) {
      const text = item.title + " " + item.content;

      if (!isValidLead(text)) continue;

      const realUrl = extractRealUrl(item.link);
      const platform = detectPlatform(realUrl);

      // Only save if platform is recognized (not "Other")
      if (platform === 'Other') continue;

      await pool.query(
        `INSERT INTO leads (title, url, platform)
         VALUES ($1, $2, $3)
         ON CONFLICT (url) DO NOTHING`,
        [item.title, realUrl, platform]
      );

      console.log("✅ REAL Lead:", item.title, `(${platform})`);
    }

  } catch (err) {
    console.log(err.message);
  }

  console.log("✅ Done");

  isRunning = false;
});