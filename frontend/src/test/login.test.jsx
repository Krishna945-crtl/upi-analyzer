import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '../context/ThemeContext'
import { AuthProvider } from '../context/AuthContext'
import Login from '../pages/Login'

function renderLogin() {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<p>dashboard</p>} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

async function submit(email, password) {
  const user = userEvent.setup()
  await user.type(screen.getByPlaceholderText('you@example.com'), email)
  await user.type(screen.getByPlaceholderText('••••••••'), password)
  await user.click(screen.getByRole('button', { name: /log ?in|sign ?in/i }))
}

afterEach(() => vi.unstubAllGlobals())

describe('Login page', () => {
  it('shows the message from the API when credentials are wrong', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ detail: 'Invalid email or password.' }) }))
    renderLogin()
    await submit('kittu@test.com', 'wrong')
    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument()
    expect(localStorage.getItem('upi_token')).toBeNull()
  })

  it('stores the token and opens the dashboard on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ token: 'jwt-abc', user: { id: '1', name: 'Kittu', email: 'k@t.com' } }) })
    vi.stubGlobal('fetch', fetchMock)
    renderLogin()
    await submit('k@t.com', 'secret123')
    expect(await screen.findByText('dashboard')).toBeInTheDocument()
    expect(localStorage.getItem('upi_token')).toBe('jwt-abc')
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ email: 'k@t.com', password: 'secret123' })
  })

  it('tells the user when the server cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    renderLogin()
    await submit('k@t.com', 'secret123')
    expect(await screen.findByText(/Could not connect to server/)).toBeInTheDocument()
  })
})
