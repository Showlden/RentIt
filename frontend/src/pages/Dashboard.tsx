"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { api } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import { Package, Calendar, ShoppingBag, DollarSign, Plus, Eye } from "lucide-react"

interface Stats {
  myItems: number
  myBookings: number
  incomingRequests: number
  totalEarnings: number
}

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({
    myItems: 0,
    myBookings: 0,
    incomingRequests: 0,
    totalEarnings: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch user's items
      const itemsResponse = await api.get("/rent/items/")
      const myItems = itemsResponse.data.filter((item: any) => item.owner.id === user?.id)

      // Fetch bookings
      const bookingsResponse = await api.get("/rent/bookings/")
      const myBookings = bookingsResponse.data.filter((booking: any) => booking.renter?.id === user?.id)
      const incomingRequests = bookingsResponse.data.filter(
        (booking: any) => booking.item.owner.id === user?.id && booking.status === "pending",
      )

      setStats({
        myItems: myItems.length,
        myBookings: myBookings.length,
        incomingRequests: incomingRequests.length,
        totalEarnings: 0, // Calculate based on completed bookings
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: "Browse Marketplace",
      description: "Find items to rent from other users",
      icon: ShoppingBag,
      link: "/marketplace",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Add New Item",
      description: "List an item for rent",
      icon: Plus,
      link: "/items",
      color: "from-green-500 to-green-600",
    },
    {
      title: "View My Bookings",
      description: "Check your rental requests",
      icon: Calendar,
      link: "/bookings",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Manage My Items",
      description: "Edit your listed items",
      icon: Package,
      link: "/items",
      color: "from-orange-500 to-orange-600",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.username}!</h1>
        <p className="text-orange-100">Ready to rent or list items today?</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.myItems}</p>
            </div>
            <Package className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.myBookings}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.incomingRequests}</p>
            </div>
            <Eye className="h-8 w-8 text-purple-500" />
          </div>
          {stats.incomingRequests > 0 && (
            <Link
              to="/bookings"
              className="text-xs text-purple-600 hover:text-purple-700 font-medium mt-2 inline-block"
            >
              View requests →
            </Link>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="group bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color} text-white`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <p className="text-gray-500 text-center py-8">No recent activity to show</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
