'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [feeds, setFeeds] = useState([])
  const [feedsLoading, setFeedsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingFeed, setEditingFeed] = useState(null)
  const [formData, setFormData] = useState({
    url: ''
  })
  const [message, setMessage] = useState('')
  const [stats, setStats] = useState({
    totalFeeds: 0,
    activeFeeds: 0,
    totalLeads: 0
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    
    if (!token) {
      router.push('/admin')
      return
    }

    // Check if token is expired (24 hours)
    const tokenTimestamp = localStorage.getItem('adminTokenTimestamp')
    const now = new Date().getTime()
    const twentyFourHours = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    
    if (tokenTimestamp && (now - tokenTimestamp > twentyFourHours)) {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminTokenTimestamp')
      router.push('/admin')
      return
    }

    // Verify token with server
    fetch('/api/admin/verify', {
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
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminTokenTimestamp')
      router.push('/admin')
    })

    // Fetch feeds from database
    fetch('/api/admin/feeds')
    .then(response => response.json())
    .then(data => {
      setFeeds(data)
      setStats(prev => ({
        ...prev,
        totalFeeds: data.length
      }))
      setFeedsLoading(false)
    })
    .catch(error => {
      console.error('Error fetching feeds:', error)
      setFeedsLoading(false)
    })

    // Fetch leads count
    fetch('/api/leads')
    .then(response => response.json())
    .then(data => {
      setStats(prev => ({
        ...prev,
        totalLeads: data.length
      }))
    })
    .catch(error => {
      console.error('Error fetching leads:', error)
    })
  }, [])

  const handleAddFeed = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const response = await fetch('/api/admin/feeds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setFeeds([...feeds, data.feed])
        setStats(prev => ({
          ...prev,
          totalFeeds: prev.totalFeeds + 1
        }))
        setFormData({ url: '' })
        setShowAddForm(false)
        setMessage('Feed added successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(data.message || 'Error adding feed')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    }
  }

  const handleUpdateFeed = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const response = await fetch('/api/admin/feeds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setFeeds([...feeds, data.feed])
        setFormData({ url: '' })
        setEditingFeed(null)
        setMessage('Feed updated successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(data.message || 'Error updating feed')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    }
  }

  const handleDeleteFeed = async (id) => {
    if (!confirm('Are you sure you want to delete this feed?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/feeds?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setFeeds(feeds.filter(feed => feed.id !== id))
        setStats(prev => ({
          ...prev,
          totalFeeds: prev.totalFeeds - 1
        }))
        setMessage('Feed deleted successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(data.message || 'Error deleting feed')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    }
  }

  const startEdit = (feed) => {
    setEditingFeed(feed)
    setFormData({
      url: feed.url
    })
    setShowAddForm(false)
  }

  const cancelEdit = () => {
    setEditingFeed(null)
    setFormData({ url: '' })
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading Admin Panel...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c.94-1.543-.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 mr-4">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200 flex items-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v4" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Feeds</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFeeds}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.includes('successfully') 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              <svg className={`h-5 w-5 mr-2 ${
                message.includes('successfully') ? 'text-green-600' : 'text-red-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {message.includes('successfully') ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              {message}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                📡 RSS Feed Management
              </h2>
              <p className="text-gray-600">
                Manage your RSS feed sources for automated lead generation
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition duration-200 flex items-center space-x-2 shadow-lg"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add New Feed</span>
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingFeed) && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className={`p-2 rounded-lg mr-3 ${
                editingFeed ? 'bg-orange-100' : 'bg-green-100'
              }`}>
                <svg className={`h-6 w-6 ${
                  editingFeed ? 'text-orange-600' : 'text-green-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {editingFeed ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  )}
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {editingFeed ? 'Edit RSS Feed' : 'Add New RSS Feed'}
              </h3>
            </div>
            
            <form onSubmit={editingFeed ? handleUpdateFeed : handleAddFeed}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RSS Feed URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <input
                    type="url"
                    required
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder="https://example.com/feed.xml"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition duration-200 flex items-center space-x-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{editingFeed ? 'Update' : 'Add'} Feed</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    cancelEdit()
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Feeds List */}
        {feedsLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600">Loading RSS feeds...</div>
            </div>
          </div>
        ) : feeds.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No RSS feeds configured</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first RSS feed source.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition duration-200"
            >
              Add Your First Feed
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feed URL
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {feeds.map((feed, index) => (
                    <tr key={feed.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-xs font-medium text-indigo-600">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-md" title={feed.url}>
                              {feed.url}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                              <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(feed.created_at).toLocaleDateString()}
                            </div>
                          </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => startEdit(feed)}
                            className="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center space-x-1"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteFeed(feed.id)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-1"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
