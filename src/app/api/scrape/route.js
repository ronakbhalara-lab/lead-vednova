export const runtime = 'nodejs';

import { scrapeAllPlatforms } from '@/services/scraper';

export async function POST() {
  try {
    console.log('🚀 Starting multi-platform scraping...');
    
    const results = await scrapeAllPlatforms();
    
    return Response.json({
      success: true,
      message: 'Multi-platform scraping completed',
      totalResults: results.length,
      data: results,
    });
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    return Response.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}