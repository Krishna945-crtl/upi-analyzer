import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

// 📝 Register page — new user account create chestam
function Register() {
  const { theme } = useTheme()   // 🎨 theme teesukuntunnamu
  const { login } = useAuth()    // 🔐 auto-login after register
  const navigate = useNavigate() // 🧭 navigation

  // 📋 Form state — anni fields ikkade
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)        // 👁️ password toggle
  const [showConfirm, setShowConfirm] = useState(false)  // 👁️ confirm password toggle

  // ✏️ Input change — state update + error clear
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  // 🚀 Form submit — validations + API call
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // 🔍 Passwords match avutunnaya check
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!')
      return
    }

    // 🔍 Minimum length check
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || 'Registration failed') // ❌ backend error
        setLoading(false)
        return
      }

      // ✅ Register chesaka auto login + dashboard ki jump!
      login(data.user, data.token)
      navigate('/dashboard')

    } catch (err) {
      setError('Could not connect to server. Please try again! ') // 🔥 network error
    }

    setLoading(false)
  }

  // 🌗 dark theme check — error box color kosam
  const isDark = theme.name === 'greenDark' || theme.name === 'blueDark'

  // 🎨 All inline styles — Login page tho consistent ga untundi
  const S = {
    // 📄 Full page — center lo card
    page: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      backgroundColor: theme.bg,
      // ✨ Subtle accent glow background lo
      backgroundImage: `radial-gradient(ellipse 600px 500px at 50% 30%, ${theme.accent}14 0%, transparent 70%)`,
    },

    // 🃏 Register card
    card: {
      width: '100%',
      maxWidth: '420px',
      backgroundColor: theme.cardBg,
      border: `0.5px solid ${theme.border}`,
      borderRadius: '20px',
      padding: '2.5rem 2.25rem',
      boxShadow: theme.shadow,
      position: 'relative', // badge kosam
    },

    // 🟢 Secure badge — top right corner
    badge: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      background: `${theme.accent}18`,
      border: `0.5px solid ${theme.accent}40`,
      borderRadius: '20px',
      padding: '4px 10px',
      fontSize: '10px',
      color: theme.accent,
    },

    // 💚 Pulsing dot inside badge
    dot: {
      width: '5px',
      height: '5px',
      borderRadius: '50%',
      backgroundColor: theme.accent,
    },

    // 🏷️ Header section
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
    },

    // 🚀 Icon box
    iconWrap: {
      width: '52px',
      height: '52px',
      borderRadius: '14px',
      background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}88)`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      marginBottom: '1rem',
    },

    title: {
      fontSize: '1.4rem',
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

    // 🏷️ Each field wrapper
    fieldGroup: { marginBottom: '1rem' },

    // 🔤 Label — uppercase small text
    label: {
      display: 'block',
      fontSize: '11px',
      fontWeight: '500',
      color: theme.subtext,
      marginBottom: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.4px',
    },

    // 📦 Icon + input wrapper
    inputWrap: { position: 'relative' },

    // ⌨️ Input field — left padding for icon
    input: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 2.5rem',
      borderRadius: '10px',
      fontSize: '0.875rem',
      outline: 'none',
      backgroundColor: theme.inputBg,
      color: theme.text,
      border: `0.5px solid ${theme.border}`,
      boxSizing: 'border-box',
    },

    // 🔣 Left icon inside input
    inputIcon: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '15px',
      color: theme.subtext,
      pointerEvents: 'none', // click block avvakunda
    },

    // 👁️ Eye toggle button — password fields lo
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
      padding: '0.85rem',
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

    // 📝 Footer — login link
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
      <div style={S.card}>

        {/* 🟢 Secure badge — top right */}
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

        {/* ❌ Error message */}
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
              <button
                type="button"
                style={S.eyeBtn}
                onClick={() => setShowPass(!showPass)}
              >
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
              <button
                type="button"
                style={S.eyeBtn}
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* 🚀 Register button */}
          <button type="submit" disabled={loading} style={S.btn}>
            {loading ? 'Creating account... ⏳' : 'Register →'}
          </button>

        </form>

        {/* 📝 Footer — login link, clean English */}
        <p style={S.footer}>
          Already have an account?{' '}
          <Link to="/login" style={S.link}>Login</Link>
        </p>

      </div>
    </div>
  )
}

export default Register