import { chromium } from 'playwright';
import { pool } from '@/lib/db';


// Platform configurations
const PLATFORMS = {
  freelancer: {
    url: 'https://www.freelancer.com/jobs',
    selector: '.JobSearchCard-item',
    titleSelector: '.JobSearchCard-primary-heading-link',
    platformName: 'Freelancer'
  },
  upwork: {
    url: 'https://www.upwork.com/nx/find-work/',
    selector: '.job-tile',
    titleSelector: '.job-title-link',
    platformName: 'UpWork'
  },
  indiamart: {
    url: 'https://directory.indiamart.com/',
    selector: '.listing-card',
    titleSelector: '.listing-title a',
    platformName: 'IndiaMart'
  },
  justdial: {
    url: 'https://www.justdial.com/',
    selector: '.resultbox',
    titleSelector: '.store-title a',
    platformName: 'JustDial'
  }
};

export async function scrapeAllPlatforms() {
  const allResults = [];
  
  for (const [platformKey, config] of Object.entries(PLATFORMS)) {
    console.log(`🌐 Starting ${config.platformName} scraper...`);
    const results = await scrapePlatform(config);
    allResults.push(...results);
  }
  
  return allResults;
}

async function scrapePlatform(config) {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    console.log(`🌐 Opening ${config.platformName}...`);

    await page.goto(config.url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await page.waitForTimeout(3000);

    try {
      await page.waitForSelector(config.selector, {
        timeout: 15000,
      });
    } catch (err) {
      console.log(`⚠️  ${config.platformName} selector not found, trying alternative...`);
      // Fallback selectors for different platforms
      const fallbackSelectors = {
        'UpWork': '[data-test="job-tile"]',
        'IndiaMart': '.card',
        'JustDial': '.jsx-321'
      };
      
      const fallback = fallbackSelectors[config.platformName];
      if (fallback) {
        await page.waitForSelector(fallback, { timeout: 10000 });
      }
    }

    const items = await page.$$eval(config.selector, elements =>
      elements.map(element => ({
        title: element.querySelector(config.titleSelector)?.innerText?.trim(),
        url: element.querySelector(config.titleSelector)?.href,
        platform: config.platformName,
      }))
    );

    console.log(`✅ Found ${items.length} items from ${config.platformName}`);

    let inserted = 0;

    for (const item of items) {
      if (!item.url || !item.title) continue;

      try {
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

    console.log(`💾 Inserted ${inserted} new leads from ${config.platformName}`);

    return items;

  } catch (err) {
    console.error(`❌ ${config.platformName} Scraper Error:`, err.message);
    return [];
  } finally {
    await browser.close();
    console.log(`🛑 ${config.platformName} browser closed`);
  }
}

// Keep original function for backward compatibility
export async function scrapeFreelancerJobs() {
  return await scrapePlatform(PLATFORMS.freelancer);
}