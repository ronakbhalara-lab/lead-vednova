export const runtime = 'nodejs';

import { scrapeFreelancerJobs } from '@/services/scraper';

export async function GET() {
  const data = await scrapeFreelancerJobs();

  console.log("SCRAPED DATA:", data);

  return Response.json({
    success: true,
    count: data.length,
    data,
  });
}