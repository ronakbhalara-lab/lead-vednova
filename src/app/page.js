'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [showLoginOptions, setShowLoginOptions] = useState(false)
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Welcome to Lead System
            </h1>
            <p className="text-xl text-gray-600">
              Choose your login type to continue
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Admin Login Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-6">
                <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h2>
                <p className="text-gray-600">
                  Access administrative controls and system management
                </p>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg p-4">
                </div>
                <button
                  onClick={() => router.push('/admin')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                >
                  Go to Admin Login
                </button>
              </div>
            </div>

            {/* User Login Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-6">
                <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">User Login</h2>
                <p className="text-gray-600">
                  Access your personal dashboard and features
                </p>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg p-7">
                </div>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                >
                  Go to User Login
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Secure authentication system • Role-based access control
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}