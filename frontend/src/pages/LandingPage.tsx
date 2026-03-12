import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

interface HelloResponse {
  message: string
}

export default function LandingPage() {
  const [apiMsg, setApiMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<HelloResponse>('/hello')
      .then((res) => setApiMsg(res.data.message))
      .catch(() => setError('Backend unreachable — start it with: uvicorn app.main:app --reload'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">Augenblick</h1>
        <p className="mt-2 text-gray-400 text-lg">Real-time collaborative brainstorming</p>
      </div>

      {/* API ping status */}
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-6">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Backend status</p>
        {loading && (
          <p className="text-gray-400 animate-pulse">Pinging API…</p>
        )}
        {apiMsg && (
          <p className="text-green-400 font-mono">
            <span className="mr-2">✓</span>{apiMsg}
          </p>
        )}
        {error && (
          <p className="text-red-400 font-mono text-sm">
            <span className="mr-2">✗</span>{error}
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <Link
          to="/register"
          className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium transition-colors"
        >
          Get started
        </Link>
        <Link
          to="/login"
          className="px-6 py-2.5 rounded-lg border border-gray-700 hover:border-gray-500 font-medium transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}
