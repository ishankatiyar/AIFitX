'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth as authApi, ApiError } from '@/lib/api'
import type { UserResponse } from '@/lib/types'

interface AuthContextValue {
  user: UserResponse | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => void
  setUser: (user: UserResponse) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const stored = localStorage.getItem('user')
    if (token && stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    localStorage.setItem('token', res.accessToken)
    localStorage.setItem('user', JSON.stringify(res.user))
    setUser(res.user)
    router.push('/dashboard')
  }, [router])

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    const res = await authApi.register(email, password, displayName)
    localStorage.setItem('token', res.accessToken)
    localStorage.setItem('user', JSON.stringify(res.user))
    setUser(res.user)
    router.push('/dashboard')
  }, [router])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/login')
  }, [router])

  const updateUser = useCallback((updated: UserResponse) => {
    setUser(updated)
    localStorage.setItem('user', JSON.stringify(updated))
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser: updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { ApiError }
