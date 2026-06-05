import { Mic, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

function Navbar() {
  const navigate = useNavigate()
  const logout   = useAuthStore(s => s.logout)
  const user     = useAuthStore(s => s.user)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
      <div className="flex items-center gap-3">
        <img src="/Taskora.png" alt="Taskora" className="w-10 h-10 rounded-xl" />
        <span className="text-lg font-bold text-white tracking-tight">Taskora</span>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-white/30 hidden sm:block">
            {user.name}
          </span>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-white/60 text-sm hover:text-white hover:border-white/25 transition-all"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar
