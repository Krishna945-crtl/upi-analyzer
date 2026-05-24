import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// 🔒 protected route — login chesindi ante dashboard chupistam
// lekapote login page ki redirect chestam
function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth()

  // token ledu ante login page ki kick out chestam 😄
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute