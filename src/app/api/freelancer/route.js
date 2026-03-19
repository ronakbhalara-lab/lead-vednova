export const runtime = 'nodejs';

import { pool } from '@/lib/db';

export async function GET() {
  const result = await pool.query(
    `SELECT * FROM leads ORDER BY created_at DESC LIMIT 50`
  );

  return Response.json({
    success: true,
    count: result.rows.length,
    data: result.rows,
  });
}