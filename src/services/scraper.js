import { chromium } from 'playwright';
import { pool } from '@/lib/db';

export async function scrapeFreelancerJobs() {

  const browser = await chromium.launch({
    headless: true, // production ma true
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    console.log("🌐 Opening Freelancer...");

    await page.goto('https://www.freelancer.com/jobs', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    // 👇 thodu wait (anti-block)
    await page.waitForTimeout(3000);

    await page.waitForSelector('.JobSearchCard-item', {
      timeout: 15000,
    });

    const jobs = await page.$$eval('.JobSearchCard-item', cards =>
      cards.map(card => ({
        title: card.querySelector('.JobSearchCard-primary-heading-link')?.innerText?.trim(),
        url: card.querySelector('.JobSearchCard-primary-heading-link')?.href,
        platform: 'Freelancer',
      }))
    );

    console.log(`✅ Found ${jobs.length} jobs`);

    let inserted = 0;

    for (const job of jobs) {
      if (!job.url || !job.title) continue;

      try {
        await pool.query(
          `INSERT INTO leads (title, url, platform)
           VALUES ($1, $2, $3)
           ON CONFLICT (url) DO NOTHING`,
          [job.title, job.url, job.platform]
        );

        inserted++;
      } catch (err) {
        console.log("DB Error:", err.message);
      }
    }

    console.log(`💾 Inserted ${inserted} new leads`);

    return jobs;

  } catch (err) {
    console.error("❌ Scraper Error:", err.message);
    return [];
  } finally {
    await browser.close();
    console.log("🛑 Browser closed");
  }
}