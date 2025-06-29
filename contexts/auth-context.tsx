"use client"

import { createContext, useContext, useState, useEffect } from 'react'

type UserRole = 'viewer' | 'admin'

interface User {
  username: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Credenciales hardcodeadas
const USERS = {
  'viewer': { username: 'viewer', password: 'viewer123', role: 'viewer' as UserRole },
  'admin': { username: 'admin', password: 'admindrcv', role: 'admin' as UserRole }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('auth-user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = (username: string, password: string): boolean => {
    const foundUser = Object.values(USERS).find(
      u => u.username === username && u.password === password
    )

    if (foundUser) {
      const userData = { username: foundUser.username, role: foundUser.role }
      setUser(userData)
      localStorage.setItem('auth-user', JSON.stringify(userData))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth-user')
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}