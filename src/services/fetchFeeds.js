// src/services/fetchFeeds.js

import Parser from 'rss-parser';
import { fetchFeedsFromDB } from './fetchFeedsFromDB.js';
const parser = new Parser();

export async function fetchFeeds() {
  // Get feeds from database instead of hardcoded array
  const feeds = await fetchFeedsFromDB();
  
  let allItems = [];

  for (let url of feeds) {
    try {
      const feed = await parser.parseURL(url);

      for (let item of feed.items) {
        allItems.push({
          title: item.title,
          link: item.link,
          content: item.contentSnippet || ''
        });
      }
    } catch (err) {
      console.log("RSS Error:", err.message);
    }
  }

  return allItems;
}