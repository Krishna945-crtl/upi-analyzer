import { Routes, Route, Navigate } from 'react-router-dom'
import { useTheme } from './context/ThemeContext'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

function App() {
  const { theme } = useTheme()
  const { isLoggedIn } = useAuth()

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh' }}>
      {/* 🔝 Navbar — only login/register lo show avutundi, dashboard lo ledu */}
      {!isLoggedIn && <Navbar />}
      <Routes>
        {/* 🏠 Default route */}
        <Route
          path="/"
          element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />}
        />
        {/* 🔓 Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* 🔐 Protected route — login chesaka only */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* ❓ Unknown route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

export default App