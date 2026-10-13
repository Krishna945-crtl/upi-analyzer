import { describe, expect, it } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'

function Probe() {
  const { user, isLoggedIn, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="state">{isLoggedIn ? `in:${user.name}` : 'out'}</span>
      <button onClick={() => login({ name: 'Kittu' }, 'tok123')}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  it('keeps the session in localStorage across reloads and clears it on logout', () => {
    const { unmount } = render(<AuthProvider><Probe /></AuthProvider>)
    act(() => screen.getByText('login').click())
    expect(screen.getByTestId('state')).toHaveTextContent('in:Kittu')
    expect(localStorage.getItem('upi_token')).toBe('tok123')

    unmount()
    render(<AuthProvider><Probe /></AuthProvider>)   // "page reload"
    expect(screen.getByTestId('state')).toHaveTextContent('in:Kittu')

    act(() => screen.getByText('logout').click())
    expect(screen.getByTestId('state')).toHaveTextContent('out')
    expect(localStorage.getItem('upi_token')).toBeNull()
  })
})

describe('ProtectedRoute', () => {
  const app = () => render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<p>login page</p>} />
          <Route path="/dashboard" element={<ProtectedRoute><p>secret dashboard</p></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )

  it('sends visitors without a token to the login page', () => {
    app()
    expect(screen.getByText('login page')).toBeInTheDocument()
    expect(screen.queryByText('secret dashboard')).not.toBeInTheDocument()
  })

  it('shows the page once a token exists', () => {
    localStorage.setItem('upi_token', 'tok123')
    localStorage.setItem('upi_user', JSON.stringify({ name: 'Kittu' }))
    app()
    expect(screen.getByText('secret dashboard')).toBeInTheDocument()
  })
})
