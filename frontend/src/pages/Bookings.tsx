"use client"
import { useState, useEffect } from "react"
import { api } from "../services/api"
import { Calendar, DollarSign, MapPin, User, CheckCircle, XCircle, Clock } from "lucide-react"

interface Booking {
  id: number
  item: {
    id: number
    title: string
    price_per_day: string
    deposit: string
    address: string
    owner: {
      username: string
      email: string
    }
  }
  renter: {
    username: string
    email: string
  }
  start_date: string
  end_date: string
  status: "pending" | "confirmed" | "rejected" | "completed"
  created_at: string
  total_cost?: string
}

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"my_bookings" | "incoming_requests">("my_bookings")

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await api.get("/rent/bookings/")
      setBookings(response.data)
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const confirmBooking = async (bookingId: number) => {
    try {
      await api.post(`/rent/bookings/${bookingId}/confirm/`)
      fetchBookings() // Refresh the list
      alert("Booking confirmed successfully!")
    } catch (error) {
      console.error("Error confirming booking:", error)
      alert("Failed to confirm booking")
    }
  }

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = (booking: Booking) => {
    const days = calculateDays(booking.start_date, booking.end_date)
    const pricePerDay = Number.parseFloat(booking.item.price_per_day)
    const deposit = Number.parseFloat(booking.item.deposit)
    return (days * pricePerDay + deposit).toFixed(2)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100"
      case "confirmed":
        return "text-green-600 bg-green-100"
      case "rejected":
        return "text-red-600 bg-red-100"
      case "completed":
        return "text-blue-600 bg-blue-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Filter bookings based on active tab
  const myBookings = bookings.filter((booking) => booking.renter)
  const incomingRequests = bookings.filter((booking) => !booking.renter)

  const displayBookings = activeTab === "my_bookings" ? myBookings : incomingRequests

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("my_bookings")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "my_bookings"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            My Bookings ({myBookings.length})
          </button>
          <button
            onClick={() => setActiveTab("incoming_requests")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "incoming_requests"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            Incoming Requests ({incomingRequests.length})
          </button>
        </nav>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {displayBookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{booking.item.title}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(booking.status)}`}
                  >
                    {getStatusIcon(booking.status)}
                    <span className="capitalize">{booking.status}</span>
                  </span>
                </div>
              </div>
              {activeTab === "incoming_requests" && booking.status === "pending" && (
                <button
                  onClick={() => confirmBooking(booking.id)}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  Confirm Booking
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(booking.start_date).toLocaleDateString()} -{" "}
                    {new Date(booking.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{booking.item.address}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>
                    {activeTab === "my_bookings"
                      ? `Owner: ${booking.item.owner.username}`
                      : `Renter: ${booking.renter?.username || "Unknown"}`}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>${booking.item.price_per_day}/day</span>
                </div>
                <div className="text-sm text-gray-600">
                  Duration: {calculateDays(booking.start_date, booking.end_date)} days
                </div>
                <div className="text-sm font-medium text-gray-900">Total: ${calculateTotal(booking)}</div>
              </div>
            </div>

            <div className="text-xs text-gray-500 border-t border-gray-100 pt-2">
              Requested: {new Date(booking.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {displayBookings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">{activeTab === "my_bookings" ? "No bookings found" : "No incoming requests"}</p>
        </div>
      )}
    </div>
  )
}

export default Bookings
