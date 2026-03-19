import { pool } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET all feeds
export async function GET() {
  try {
    const query = 'SELECT * FROM rss_feeds ORDER BY id ASC'
    const result = await pool.query(query)
    
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching feeds:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST new feed
export async function POST(request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { message: 'URL is required' },
        { status: 400 }
      )
    }

    const query = 'INSERT INTO rss_feeds (url) VALUES ($1) RETURNING *'
    const result = await pool.query(query, [url])

    return NextResponse.json({
      message: 'Feed added successfully',
      feed: result.rows[0]
    })
  } catch (error) {
    console.error('Error adding feed:', error)
    if (error.code === '23505') {
      return NextResponse.json(
        { message: 'Feed URL already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE feed
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { message: 'Feed ID is required' },
        { status: 400 }
      )
    }

    const query = 'DELETE FROM rss_feeds WHERE id = $1 RETURNING *'
    const result = await pool.query(query, [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Feed not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Feed deleted successfully',
      feed: result.rows[0]
    })
  } catch (error) {
    console.error('Error deleting feed:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
