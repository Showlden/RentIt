"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { api } from "../services/api"
import { Search, MapPin, DollarSign, Calendar, User } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

interface Category {
    id: number
    name: string
}

interface Item {
    id: number
    title: string
    description: string
    category: number
    price_per_day: string
    deposit: string
    address: string
    user: number // ID владельца предмета
    created_at: string
    images?: Array<{
        id: number
        image: string
    }>
}

interface BookingFormData {
    item: number
    start_date: string
    end_date: string
}

const Marketplace = () => {
    const { user } = useAuth()
    const [items, setItems] = useState<Item[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [selectedItem, setSelectedItem] = useState<Item | null>(null)
    const [bookingData, setBookingData] = useState<BookingFormData>({
        item: 0,
        start_date: "",
        end_date: "",
    })

    useEffect(() => {
        fetchItems()
        fetchCategories()
    }, [])

    const fetchItems = async () => {
        try {
            console.log("Fetching marketplace items...")
            console.log("Current user ID:", user?.id)

            const response = await api.get("/rent/items/")
            console.log("Marketplace API response:", response.data)

            // Filter out items owned by current user (where user field equals current user ID)
            const allItems = response.data
            const availableItems = allItems.filter((item: Item) => {
                console.log(`Item ${item.id}: owner=${item.user}, current_user=${user?.id}`)
                return item.user !== user?.id
            })

            console.log("All items:", allItems.length)
            console.log("Available items for rent:", availableItems.length)

            setItems(availableItems)
        } catch (error) {
            console.error("Error fetching items:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const response = await api.get("/rent/categories/")
            setCategories(response.data)
        } catch (error) {
            console.error("Error fetching categories:", error)
        }
    }

    const handleBooking = (item: Item) => {
        console.log("Opening booking modal for item:", item)
        setSelectedItem(item)
        setBookingData({
            item: item.id,
            start_date: "",
            end_date: "",
        })
        setShowBookingModal(true)
    }

    const submitBooking = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            console.log("Submitting booking:", bookingData)
            const response = await api.post("/rent/bookings/", bookingData)
            console.log("Booking response:", response.data)
            alert("Booking request sent successfully!")
            setShowBookingModal(false)
            setSelectedItem(null)
            setBookingData({
                item: 0,
                start_date: "",
                end_date: "",
            })
        } catch (error: any) {
            console.error("Error creating booking:", error)
            const errorMessage =
                error.response?.data?.message || error.response?.data?.detail || error.message || "Unknown error"
            alert("Failed to create booking: " + errorMessage)
        }
    }

    const calculateDays = () => {
        if (bookingData.start_date && bookingData.end_date) {
            const start = new Date(bookingData.start_date)
            const end = new Date(bookingData.end_date)
            const diffTime = Math.abs(end.getTime() - start.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return diffDays
        }
        return 0
    }

    const calculateTotal = () => {
        const days = calculateDays()
        const pricePerDay = Number.parseFloat(selectedItem?.price_per_day || "0")
        const deposit = Number.parseFloat(selectedItem?.deposit || "0")
        return (days * pricePerDay + deposit).toFixed(2)
    }

    const filteredItems = items.filter((item) => {
        const matchesSearch =
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesCategory = selectedCategory === "" || item.category?.toString() === selectedCategory

        return matchesSearch && matchesCategory
    })

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
                <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
                <p className="text-gray-600">Find items to rent from other users</p>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search items and descriptions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>

                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
                    >
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="font-medium">${item.price_per_day}/day</span>
                                <span className="text-gray-400">+ ${item.deposit} deposit</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4 text-red-500" />
                                <span>{item.address}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <User className="h-4 w-4 text-blue-500" />
                                <span>Owner ID: {item.user}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="text-xs text-gray-500">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                Listed: {new Date(item.created_at).toLocaleDateString()}
                            </div>
                            <button
                                onClick={() => handleBooking(item)}
                                className="px-4 py-2 bg-gradient-to-r from-orange-600 to-yellow-600 text-white text-sm rounded-lg hover:from-orange-700 hover:to-yellow-700 transition-colors"
                            >
                                Rent Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-12">
                    <div className="bg-gray-50 rounded-lg p-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No items available</h3>
                        {items.length === 0 ? (
                            <p className="text-gray-500">No items have been listed for rent yet.</p>
                        ) : (
                            <p className="text-gray-500">No items match your search criteria. Try adjusting your filters.</p>
                        )}
                        <button
                            onClick={() => {
                                setSearchTerm("")
                                setSelectedCategory("")
                            }}
                            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Booking Modal */}
            {showBookingModal && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Book: {selectedItem.title}</h2>

                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                                <DollarSign className="h-4 w-4" />
                                <span>
                                    ${selectedItem.price_per_day}/day + ${selectedItem.deposit} deposit
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <User className="h-4 w-4" />
                                <span>Owner ID: {selectedItem.user}</span>
                            </div>
                        </div>

                        <form onSubmit={submitBooking} className="space-y-4">
                            <div>
                                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                                    Start Date
                                </label>
                                <input
                                    id="start_date"
                                    type="date"
                                    required
                                    min={new Date().toISOString().split("T")[0]}
                                    value={bookingData.start_date}
                                    onChange={(e) => setBookingData({ ...bookingData, start_date: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                                    End Date
                                </label>
                                <input
                                    id="end_date"
                                    type="date"
                                    required
                                    min={bookingData.start_date || new Date().toISOString().split("T")[0]}
                                    value={bookingData.end_date}
                                    onChange={(e) => setBookingData({ ...bookingData, end_date: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>

                            {bookingData.start_date && bookingData.end_date && (
                                <div className="p-4 bg-orange-50 rounded-lg">
                                    <div className="text-sm text-gray-700">
                                        <div>Duration: {calculateDays()} days</div>
                                        <div>
                                            Rental cost: ${(calculateDays() * Number.parseFloat(selectedItem.price_per_day)).toFixed(2)}
                                        </div>
                                        <div>Deposit: ${selectedItem.deposit}</div>
                                        <div className="font-bold text-orange-600 mt-2">Total: ${calculateTotal()}</div>
                                    </div>
                                </div>
                            )}

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 py-2 px-4 bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-lg hover:from-orange-700 hover:to-yellow-700 transition-colors"
                                >
                                    Send Booking Request
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowBookingModal(false)
                                        setSelectedItem(null)
                                    }}
                                    className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Marketplace
