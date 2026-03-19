// src/app/api/leads/route.js

import { pool } from '@/lib/db';

export async function GET() {
  const res = await pool.query(
    'SELECT * FROM leads WHERE platform != $1 ORDER BY created_at DESC LIMIT 100',
    ['Other']
  );

  return Response.json(res.rows);
}