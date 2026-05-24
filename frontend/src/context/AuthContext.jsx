import { createContext, useContext, useState } from 'react'

// 🔐 auth context — login/logout anni ikkade manage avutundi
const AuthContext = createContext()

export function AuthProvider({ children }) {

  // already login chesadu ante localStorage lo untundi — check chestunnam
  const [user, setUser] = useState(() => {
    let savedUser = localStorage.getItem('upi_user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem('upi_token') || null
  })

  // ✅ login success — user data + token save chestunnam
  function login(userData, authToken) {
    setUser(userData)
    setToken(authToken)

    // browser close chesina kuda login untundani localStorage lo pettestunnam
    localStorage.setItem('upi_user', JSON.stringify(userData))
    localStorage.setItem('upi_token', authToken)
  }

  // 🚪 logout — anni clear chestunnam
  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('upi_user')
    localStorage.removeItem('upi_token')
  }

  // token unte logged in — simple ga check
  let isLoggedIn = !!token

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  )
}

// 🎣 custom hook — any component lo useAuth() call chesthe user info vastuundi
export function useAuth() {
  return useContext(AuthContext)
}