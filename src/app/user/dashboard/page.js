'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UserDashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [leads, setLeads] = useState([])
  const [leadsLoading, setLeadsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('userToken')
    
    if (!token) {
      router.push('/login')
      return
    }

    // Check if token is expired (24 hours)
    const tokenTimestamp = localStorage.getItem('userTokenTimestamp')
    const now = new Date().getTime()
    const twentyFourHours = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    
    if (tokenTimestamp && (now - tokenTimestamp > twentyFourHours)) {
      localStorage.removeItem('userToken')
      localStorage.removeItem('userTokenTimestamp')
      localStorage.removeItem('userRole')
      router.push('/login')
      return
    }

    // Verify token with server
    fetch('/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (response.ok) {
        return response.json()
      } else {
        throw new Error('Invalid token')
      }
    })
    .then(data => {
      setUser(data.user)
      setLoading(false)
    })
    .catch(error => {
      localStorage.removeItem('userToken')
      localStorage.removeItem('userTokenTimestamp')
      localStorage.removeItem('userRole')
      router.push('/login')
    })
  }, [router])

  useEffect(() => {
    // Fetch leads data
    fetch('/api/leads', {
      cache: 'no-store',
    })
    .then(response => response.json())
    .then(data => {
      setLeads(data)
      setLeadsLoading(false)
    })
    .catch(error => {
      console.error('Error fetching leads:', error)
      setLeadsLoading(false)
    })
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userTokenTimestamp')
    localStorage.removeItem('userRole')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">User Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.username}</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                {user?.role}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              🚀 Leads Dashboard
            </h2>
            <p className="text-gray-600">
              Browse and manage available leads from various platforms
            </p>
          </div>

          {/* Leads Grid */}
          {leadsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-xl">Loading leads...</div>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No leads available at the moment.</div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2">
                    {lead.title.replace(/<[^>]*>?/gm, '')}
                  </h3>

                  {/* Platform Badge */}
                  <div className="mb-3">
                    <span
                      className={`inline-block px-3 py-1 text-xs rounded-full text-white
                      ${
                        lead.platform === 'Upwork'
                          ? 'bg-green-500'
                          : lead.platform === 'Freelancer'
                          ? 'bg-blue-500'
                          : 'bg-gray-500'
                      }`}
                    >
                      {lead.platform}
                    </span>
                  </div>

                  {/* Date */}
                  <p className="text-xs text-gray-500 mb-4">
                    Posted: {new Date(lead.created_at).toLocaleString()}
                  </p>

                  {/* View Button */}
                  <a
                    href={lead.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition duration-200 text-center"
                  >
                    🔗 View Requirement
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
