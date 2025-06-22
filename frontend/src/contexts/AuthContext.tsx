"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { api } from "../services/api"

interface User {
  id: number
  username: string
  email: string
  phone: string
  avatar?: string
  is_active: boolean
  date_joined: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  loading: boolean
  error: string | null
}

interface RegisterData {
  email: string
  username: string
  password: string
  password_confirmation: string
  phone: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("AuthProvider: Initializing...")
    const token = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")

    console.log("AuthProvider: Token found:", !!token)
    console.log("AuthProvider: Saved user found:", !!savedUser)

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        console.log("AuthProvider: Restored user from localStorage:", parsedUser)
        api.defaults.headers.common["Authorization"] = `JWT ${token}`
        setUser(parsedUser)
        setLoading(false)
      } catch (error) {
        console.error("AuthProvider: Error parsing saved user:", error)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        setLoading(false)
      }
    } else if (token) {
      api.defaults.headers.common["Authorization"] = `JWT ${token}`
      fetchCurrentUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchCurrentUser = async () => {
    try {
      console.log("AuthProvider: Fetching current user...")

      // Try different endpoints to get current user
      let response
      try {
        // First try to get current user profile
        response = await api.get("/auth/user/")
        console.log("AuthProvider: Current user response from /auth/user/:", response.data)
      } catch (error) {
        console.log("AuthProvider: /auth/user/ failed, trying /auth/users/me/")
        try {
          response = await api.get("/auth/users/me/")
          console.log("AuthProvider: Current user response from /auth/users/me/:", response.data)
        } catch (error) {
          console.log("AuthProvider: /auth/users/me/ failed, trying to decode token")
          // If no specific endpoint exists, we might need to decode the JWT token
          // or use a different approach
          throw new Error("No endpoint available to get current user")
        }
      }

      if (response?.data) {
        console.log("AuthProvider: Setting current user:", response.data)
        setUser(response.data)
        // Save user to localStorage to prevent re-login on refresh
        localStorage.setItem("user", JSON.stringify(response.data))
      } else {
        throw new Error("No user data received")
      }
    } catch (error: any) {
      console.error("AuthProvider: Fetch current user error:", error)
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      delete api.defaults.headers.common["Authorization"]
      setError("Failed to fetch user data")
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log("AuthProvider: Attempting login...")
      setError(null)

      const response = await api.post("/auth/login/", { email, password })
      console.log("AuthProvider: Full login response:", response)
      console.log("AuthProvider: Login response data:", response.data)

      // Check different possible token field names
      const token =
        response.data.token ||
        response.data.access_token ||
        response.data.access ||
        response.data.key ||
        response.data.auth_token

      console.log("AuthProvider: Extracted token:", token)

      if (!token) {
        console.error("AuthProvider: No token found in response. Available fields:", Object.keys(response.data))
        throw new Error(`No token received from server. Response: ${JSON.stringify(response.data)}`)
      }

      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `JWT ${token}`

      // If user data is included in login response, use it
      if (response.data.user) {
        console.log("AuthProvider: User data from login:", response.data.user)
        setUser(response.data.user)
        localStorage.setItem("user", JSON.stringify(response.data.user))
        setLoading(false)
      } else {
        // Otherwise fetch current user data
        await fetchCurrentUser()
      }

      console.log("AuthProvider: Login successful")
    } catch (error: any) {
      console.error("AuthProvider: Login error:", error)
      setError(error.response?.data?.message || error.message || "Login failed")
      throw error
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      console.log("AuthProvider: Attempting registration with data:", userData)
      setError(null)

      const response = await api.post("/auth/register/", userData)
      console.log("AuthProvider: Register response:", response.data)

      // Check different possible token field names
      const token =
        response.data.token ||
        response.data.access_token ||
        response.data.access ||
        response.data.key ||
        response.data.auth_token

      console.log("AuthProvider: Extracted token:", token)

      if (!token) {
        console.error(
          "AuthProvider: No token found in registration response. Available fields:",
          Object.keys(response.data),
        )
        // If no token but registration was successful, try to login
        if (response.status === 201 || response.status === 200) {
          console.log("AuthProvider: Registration successful, attempting login...")
          await login(userData.email, userData.password)
          return
        }
        throw new Error(`No token received from server. Response: ${JSON.stringify(response.data)}`)
      }

      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `JWT ${token}`

      // If user data is included in registration response, use it
      if (response.data.user) {
        setUser(response.data.user)
        localStorage.setItem("user", JSON.stringify(response.data.user))
        setLoading(false)
      } else {
        await fetchCurrentUser()
      }

      console.log("AuthProvider: Registration successful")
    } catch (error: any) {
      console.error("AuthProvider: Registration error:", error)
      console.error("AuthProvider: Registration error response:", error.response?.data)

      // Show more detailed error message
      let errorMessage = "Registration failed"
      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error
        } else {
          // Handle field-specific errors
          const errors = []
          for (const [field, messages] of Object.entries(error.response.data)) {
            if (Array.isArray(messages)) {
              errors.push(`${field}: ${messages.join(", ")}`)
            } else if (typeof messages === "string") {
              errors.push(`${field}: ${messages}`)
            }
          }
          if (errors.length > 0) {
            errorMessage = errors.join("; ")
          }
        }
      }

      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const logout = () => {
    console.log("AuthProvider: Logging out...")
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    delete api.defaults.headers.common["Authorization"]
    setUser(null)
    setError(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    error,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
