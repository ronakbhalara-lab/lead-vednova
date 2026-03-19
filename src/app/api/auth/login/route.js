import { pool } from '@/lib/db'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Query the database for the user
    const query = 'SELECT * FROM users WHERE username = $1'
    const result = await pool.query(query, [username])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const user = result.rows[0]

    // Compare passwords (in production, use hashed passwords)
    if (user.password !== password) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate a simple token (in production, use JWT)
    const token = crypto.randomBytes(32).toString('hex')

    // Update user with new token
    const updateQuery = 'UPDATE users SET token = $1 WHERE id = $2'
    await pool.query(updateQuery, [token, user.id])

    return NextResponse.json({
      message: 'Login successful',
      token: token,
      user: { id: user.id, username: user.username, role: user.role },
      expiresIn: '24 hours'
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
