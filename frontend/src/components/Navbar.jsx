import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import ThemeSwitcher from './ThemeSwitcher'

// 🧭 navbar — top bar with logo, theme switcher, logout
function Navbar() {
  const { theme } = useTheme()
  const { user, logout, isLoggedIn } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav
      className="w-full px-6 py-4 flex items-center justify-between sticky top-0 z-50"
      style={{
        backgroundColor: theme.navBg,
        borderBottom: `1px solid ${theme.border}`,
        boxShadow: theme.shadow,
      }}
    >
      {/* logo */}
      <Link to={isLoggedIn ? '/dashboard' : '/login'}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">💸</span>
          <span
            className="text-lg font-bold"
            style={{ color: theme.text }}
          >
            UPI Analyzer
          </span>
        </div>
      </Link>

      {/* right side */}
      <div className="flex items-center gap-4">

        {/* theme switcher — always visible */}
        <ThemeSwitcher />

        {/* logged in ante user name + logout show chestam */}
        {isLoggedIn && (
          <>
            <span
              className="text-sm hidden md:block"
              style={{ color: theme.subtext }}
            >
              👋 {user?.name || 'User'}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm px-4 py-1.5 rounded-full font-medium transition-opacity hover:opacity-80"
              style={{
                backgroundColor: theme.inputBg,
                color: theme.text,
                border: `1px solid ${theme.border}`,
              }}
            >
              Logout
            </button>
          </>
        )}

      </div>
    </nav>
  )
}

export default Navbar