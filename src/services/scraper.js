// src/services/scraper.js

import { chromium } from 'playwright';

export async function scrapeFreelancerJobs() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://www.freelancer.com/jobs');

  await page.waitForSelector('.JobSearchCard-item');

  const jobs = await page.$$eval('.JobSearchCard-item', cards =>
    cards.map(card => ({
      title: card.querySelector('.JobSearchCard-primary-heading-link')?.innerText,
      link: card.querySelector('.JobSearchCard-primary-heading-link')?.href,
      description: card.querySelector('.JobSearchCard-primary-description')?.innerText
    }))
  );

  await browser.close();

  return jobs;
}