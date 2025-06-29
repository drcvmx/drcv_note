"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, User, Lock } from "lucide-react"
import Image from "next/image"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simular un pequeño delay para mejor UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (login(username, password)) {
      // Login exitoso - el contexto manejará el estado
    } else {
      setError("Credenciales incorrectas")
    }
    setIsLoading(false)
  }

  const handleQuickLogin = (role: "viewer" | "admin") => {
    if (role === "viewer") {
      setUsername("viewer")
      setPassword("viewer123")
    } else {
      setUsername("admin")
     
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
        alt="Mountain landscape"
        fill
        className="object-cover fixed -z-10 opacity-20 dark:opacity-10"
        priority
      />

      <Card className="w-full max-w-md backdrop-blur-lg bg-white/10 border-white/20 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <User className="h-6 w-6 text-blue-300" />
            drcv_note
          </CardTitle>
          <p className="text-white/70">Inicia sesión para continuar</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">
                Usuario
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="text-center">
              <p className="text-white/70 text-sm mb-3">Acceso rápido:</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleQuickLogin("viewer")}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
              >
                👁️ Viewer
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleQuickLogin("admin")}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
              >
                ⚙️ Admin
              </Button>
            </div>

            <div className="mt-4 p-3 bg-white/5 rounded-md border border-white/10">
              <p className="text-white/60 text-xs mb-2">
                <strong>Credenciales de prueba:</strong>
              </p>
              <div className="space-y-1 text-xs text-white/50">
                <p>
                  <strong>Viewer:</strong> usuario "viewer", contraseña "viewer123"
                </p>
                
                <p>
                  <strong>Admin:</strong> usuario "admin", contraseña "contacta con drcv.work.code@gmail.com"
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}