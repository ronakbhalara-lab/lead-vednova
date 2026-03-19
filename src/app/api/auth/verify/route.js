import { pool } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verify token in database
    const query = 'SELECT id, username, role FROM users WHERE token = $1'
    const result = await pool.query(query, [token])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      message: 'Token is valid',
      user: result.rows[0]
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
