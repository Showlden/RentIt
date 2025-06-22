"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import Layout from "./components/Layout"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Profile from "./pages/Profile"
import Items from "./pages/Items"
import Marketplace from "./pages/Marketplace"
import Bookings from "./pages/Bookings"
import LoadingSpinner from "./components/LoadingSpinner"

function App() {
  console.log("App: Rendering...")

  const { user, loading, error } = useAuth()

  console.log("App: Auth state:", { user: !!user, loading, error })

  if (loading) {
    console.log("App: Showing loading spinner")
    return <LoadingSpinner />
  }

  if (error) {
    console.log("App: Showing error:", error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  console.log("App: Rendering routes, user authenticated:", !!user)

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />
          <Route path="/" element={user ? <Layout /> : <Navigate to="/login" replace />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="items" element={<Items />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="bookings" element={<Bookings />} />
          </Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App
