import { pool } from '@/lib/db'

export async function fetchFeedsFromDB() {
  try {
    const query = 'SELECT url FROM rss_feeds ORDER BY id ASC'
    const result = await pool.query(query)
    
    // Extract URLs from database result
    const feeds = result.rows.map(row => row.url)
    
    return feeds
  } catch (error) {
    console.error('Error fetching feeds from database:', error)
    return []
  }
}
