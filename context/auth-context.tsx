"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type UserRole = "client" | "pizzeria" | "livreur" | "admin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  address?: string
  phone?: string
  points?: number
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>
  register: (userData: Partial<User>, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Mock users for different roles
const mockUsers: User[] = [
  {
    id: "1",
    name: "Client Test",
    email: "client@test.com",
    role: "client",
    address: "123 Rue des Palmiers, Libreville",
    phone: "+241 77 12 34 56",
    points: 120,
  },
  {
    id: "2",
    name: "Pizzeria Napoli",
    email: "pizzeria@test.com",
    role: "pizzeria",
    address: "45 Avenue de l'Indépendance, Libreville",
    phone: "+241 66 98 76 54",
  },
  {
    id: "3",
    name: "Livreur Express",
    email: "livreur@test.com",
    role: "livreur",
    phone: "+241 74 56 78 90",
  },
  {
    id: "4",
    name: "Admin Système",
    email: "admin@test.com",
    role: "admin",
  },
]

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for saved user in localStorage
        const savedUser = localStorage.getItem("pizza-casa-user")
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser)
          // Validate user data structure
          if (isValidUser(parsedUser)) {
            setUser(parsedUser)
          } else {
            // If invalid data, clear it
            localStorage.removeItem("pizza-casa-user")
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        // Clear potentially corrupted data
        localStorage.removeItem("pizza-casa-user")
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Helper function to validate user data structure
  const isValidUser = (user: any): user is User => {
    return (
      user &&
      typeof user === "object" &&
      typeof user.id === "string" &&
      typeof user.name === "string" &&
      typeof user.email === "string" &&
      ["client", "pizzeria", "livreur", "admin"].includes(user.role)
    )
  }

  const login = async (email: string, password: string, role?: UserRole): Promise<boolean> => {
    try {
      setIsLoading(true)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Find user by email and optionally by role
      const foundUser = mockUsers.find((u) => u.email === email && (!role || u.role === role))

      if (foundUser && password === "password") {
        // Simple password check
        setUser(foundUser)
        localStorage.setItem("pizza-casa-user", JSON.stringify(foundUser))
        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if email already exists
      if (mockUsers.some((u) => u.email === userData.email)) {
        return false
      }

      // Create new user
      const newUser: User = {
        id: `${mockUsers.length + 1}`,
        name: userData.name || "Nouvel Utilisateur",
        email: userData.email || `user${mockUsers.length + 1}@example.com`,
        role: userData.role || "client",
        address: userData.address,
        phone: userData.phone,
        points: 0,
      }

      // In a real app, we would save to database
      // For this mock, we'll just set as current user
      setUser(newUser)
      localStorage.setItem("pizza-casa-user", JSON.stringify(newUser))
      return true
    } catch (error) {
      console.error("Registration error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    try {
      setUser(null)
      localStorage.removeItem("pizza-casa-user")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
}
