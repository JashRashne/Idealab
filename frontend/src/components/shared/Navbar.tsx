import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  return (
    <nav className="h-14 border-b border-gray-800 bg-gray-950 flex items-center justify-between px-6">
      <Link to="/" className="font-bold text-white tracking-tight">Augenblick</Link>
      <div className="flex items-center gap-4 text-sm">
        {isAuthenticated ? (
          <>
            <span className="text-gray-400">{user?.username}</span>
            <button onClick={logout} className="text-gray-400 hover:text-white transition-colors">Sign out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-400 hover:text-white">Sign in</Link>
            <Link to="/register" className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  )
}
