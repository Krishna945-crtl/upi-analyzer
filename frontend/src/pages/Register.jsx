import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import useWindowSize from '../hooks/useWindowSize'

// 📝 Register page — new user account create chestam
function Register() {
  const { theme, switchTheme, currentTheme } = useTheme() // 🎨 theme + switcher
  const { login } = useAuth()                             // 🔐 auto-login after register
  const navigate = useNavigate()                          // 🧭 navigation
  const { isMobile } = useWindowSize()                    // 📱 mobile check

  // 📋 Form state
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  })
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [showPass, setShowPass]     = useState(false)   // 👁️ password toggle
  const [showConfirm, setShowConfirm] = useState(false) // 👁️ confirm toggle

  // ✏️ Input change — state update + error clear
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  // 🚀 Form submit — validations + API call
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const res  = await fetch('http://localhost:8000/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:     formData.name,
          email:    formData.email,
          password: formData.password,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || 'Registration failed')
        setLoading(false)
        return
      }

      // ✅ Register chesaka auto login + dashboard ki jump!
      login(data.user, data.token)
      navigate('/dashboard')

    } catch (err) {
      setError('Could not connect to server. Please try again!')
    }
    setLoading(false)
  }

  // 🌗 dark theme check
  const isDark = theme.name === 'greenDark' || theme.name === 'blueDark'

  // 🎨 All inline styles — mobile responsive tho
  const S = {
    // 📄 Full page
    page: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '1rem' : '2rem',
      backgroundColor: theme.bg,
      backgroundImage: `radial-gradient(ellipse 600px 500px at 50% 30%, ${theme.accent}14 0%, transparent 70%)`,
      position: 'relative',
    },

    // 🎨 Theme switcher — top right fixed
    themeSwitcher: {
      position: 'fixed',
      top: '12px',
      right: '12px',
      display: 'flex',
      gap: '6px',
      zIndex: 100,
    },

    themeBtn: (active) => ({
      padding: isMobile ? '4px 10px' : '6px 14px',
      borderRadius: '8px',
      fontSize: isMobile ? '11px' : '12px',
      fontWeight: '500',
      border: `0.5px solid ${theme.accent}`,
      backgroundColor: active ? theme.accent : 'transparent',
      color: active ? '#fff' : theme.subtext,
      cursor: 'pointer',
    }),

    // 🃏 Register card
    card: {
      width: '100%',
      maxWidth: isMobile ? '100%' : '420px',
      backgroundColor: theme.cardBg,
      border: `0.5px solid ${theme.border}`,
      borderRadius: isMobile ? '16px' : '20px',
      padding: isMobile ? '1.75rem 1.25rem' : '2.5rem 2.25rem',
      boxShadow: theme.shadow,
      position: 'relative',
    },

    // 🟢 Secure badge
    badge: {
      position: 'absolute',
      top: '14px',
      right: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      background: `${theme.accent}18`,
      border: `0.5px solid ${theme.accent}40`,
      borderRadius: '20px',
      padding: '3px 8px',
      fontSize: '10px',
      color: theme.accent,
    },

    dot: {
      width: '5px',
      height: '5px',
      borderRadius: '50%',
      backgroundColor: theme.accent,
    },

    // 🏷️ Header
    header: {
      textAlign: 'center',
      marginBottom: isMobile ? '1.5rem' : '2rem',
    },

    iconWrap: {
      width: isMobile ? '44px' : '52px',
      height: isMobile ? '44px' : '52px',
      borderRadius: '14px',
      background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}88)`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isMobile ? '20px' : '24px',
      marginBottom: '0.75rem',
    },

    title: {
      fontSize: isMobile ? '1.2rem' : '1.4rem',
      fontWeight: '700',
      color: theme.text,
      margin: '0 0 6px',
    },

    subtitle: {
      fontSize: '0.8rem',
      color: theme.subtext,
      margin: 0,
    },

    // ❌ Error box
    errorBox: {
      marginBottom: '1rem',
      padding: '0.75rem 1rem',
      borderRadius: '10px',
      fontSize: '0.8rem',
      color: '#f87171',
      backgroundColor: isDark ? '#1a0505' : '#fff0f0',
      border: '0.5px solid #7f1d1d',
    },

    // 🏷️ Field group
    fieldGroup: { marginBottom: '1rem' },

    label: {
      display: 'block',
      fontSize: '11px',
      fontWeight: '500',
      color: theme.subtext,
      marginBottom: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.4px',
    },

    inputWrap: { position: 'relative' },

    input: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 2.5rem',
      borderRadius: '10px',
      fontSize: isMobile ? '16px' : '0.875rem', // 📱 16px — iOS zoom fix
      outline: 'none',
      backgroundColor: theme.inputBg,
      color: theme.text,
      border: `0.5px solid ${theme.border}`,
      boxSizing: 'border-box',
    },

    inputIcon: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '15px',
      color: theme.subtext,
      pointerEvents: 'none',
    },

    eyeBtn: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: theme.subtext,
      fontSize: '16px',
      padding: 0,
      lineHeight: 1,
    },

    // 🚀 Submit button
    btn: {
      width: '100%',
      padding: isMobile ? '0.9rem' : '0.85rem',
      borderRadius: '10px',
      fontSize: '0.9rem',
      fontWeight: '600',
      border: 'none',
      cursor: loading ? 'not-allowed' : 'pointer',
      background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}bb)`,
      color: '#ffffff',
      opacity: loading ? 0.7 : 1,
      marginTop: '0.5rem',
    },

    // 📝 Footer
    footer: {
      textAlign: 'center',
      fontSize: '0.8rem',
      color: theme.subtext,
      marginTop: '1.5rem',
    },

    link: {
      color: theme.accent,
      fontWeight: '500',
      textDecoration: 'none',
    },
  }

  return (
    <div style={S.page}>

      {/* 🎨 Theme switcher — top right fixed */}
      <div style={S.themeSwitcher}>
        <button onClick={() => switchTheme('light')} style={S.themeBtn(currentTheme === 'light')}>
          🍦 Light
        </button>
        <button onClick={() => switchTheme('greenDark')} style={S.themeBtn(currentTheme === 'greenDark')}>
          🖤 Dark
        </button>
      </div>

      <div style={S.card}>

        {/* 🟢 Secure badge */}
        <div style={S.badge}>
          <span style={S.dot} />
          Secure
        </div>

        {/* 🏷️ Header */}
        <div style={S.header}>
          <div style={S.iconWrap}>🚀</div>
          <h1 style={S.title}>Create Account</h1>
          <p style={S.subtitle}>Start tracking your spending today</p>
        </div>

        {/* ❌ Error */}
        {error && <div style={S.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* 👤 Full Name */}
          <div style={S.fieldGroup}>
            <label style={S.label}>Full Name</label>
            <div style={S.inputWrap}>
              <span style={S.inputIcon}>👤</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Bruce Wayne"
                required
                style={S.input}
              />
            </div>
          </div>

          {/* 📧 Email */}
          <div style={S.fieldGroup}>
            <label style={S.label}>Email</label>
            <div style={S.inputWrap}>
              <span style={S.inputIcon}>✉️</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                style={S.input}
              />
            </div>
          </div>

          {/* 🔒 Password + eye toggle */}
          <div style={S.fieldGroup}>
            <label style={S.label}>Password</label>
            <div style={S.inputWrap}>
              <span style={S.inputIcon}>🔒</span>
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                required
                style={S.input}
              />
              <button type="button" style={S.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* 🔒 Confirm Password + eye toggle */}
          <div style={S.fieldGroup}>
            <label style={S.label}>Confirm Password</label>
            <div style={S.inputWrap}>
              <span style={S.inputIcon}>🔒</span>
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                style={S.input}
              />
              <button type="button" style={S.eyeBtn} onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* 🚀 Register button */}
          <button type="submit" disabled={loading} style={S.btn}>
            {loading ? 'Creating account... ⏳' : 'Register →'}
          </button>

        </form>

        {/* 📝 Footer */}
        <p style={S.footer}>
          Already have an account?{' '}
          <Link to="/login" style={S.link}>Login</Link>
        </p>

      </div>
    </div>
  )
}

export default Register