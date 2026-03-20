export const runtime = 'nodejs';

import { pool } from '@/lib/db';

export async function POST() {
  try {
    console.log('🚀 Testing simple scraping...');
    
    // Simple test data without Playwright
    const testData = [
      { title: 'Test Freelancer Job', url: 'https://freelancer.com/test1', platform: 'Freelancer' },
      { title: 'Test UpWork Job', url: 'https://upwork.com/test1', platform: 'UpWork' },
    ];
    
    // Insert test data
    let inserted = 0;
    for (const item of testData) {
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
    
    console.log(`💾 Inserted ${inserted} test leads`);
    
    return Response.json({
      success: true,
      message: 'Test scraping completed',
      totalResults: testData.length,
      inserted: inserted,
      data: testData,
    });
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    return Response.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}