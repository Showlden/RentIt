"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { api } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import { Plus, Edit, Trash2, Search, MapPin, DollarSign, Calendar } from "lucide-react"

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
  created_at: string
  user: number // ID владельца предмета
  images?: Array<{
    id: number
    image: string
  }>
}

const Items = () => {
  const { user } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price_per_day: "",
    deposit: "",
    address: "",
  })

  useEffect(() => {
    fetchItems()
    fetchCategories()
  }, [])

  const fetchItems = async () => {
    try {
      console.log("Fetching items...")
      console.log("Current user ID:", user?.id)

      const response = await api.get("/rent/items/")
      console.log("Items API response:", response.data)

      // Filter to show only current user's items (where user field equals current user ID)
      const allItems = response.data
      const myItems = allItems.filter((item: Item) => {
        console.log(`Item ${item.id}: user=${item.user}, current_user=${user?.id}`)
        return item.user === user?.id
      })

      console.log("All items:", allItems.length)
      console.log("My items:", myItems.length)

      setItems(myItems)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("Submitting item data:", formData)

      if (editingItem) {
        await api.put(`/rent/items/${editingItem.id}/`, formData)
      } else {
        await api.post("/rent/items/", formData)
      }

      fetchItems() // Refresh the list
      setShowModal(false)
      setEditingItem(null)
      setFormData({
        title: "",
        description: "",
        category: "",
        price_per_day: "",
        deposit: "",
        address: "",
      })
    } catch (error) {
      console.error("Error saving item:", error)
    }
  }

  const handleEdit = (item: Item) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category.toString(),
      price_per_day: item.price_per_day,
      deposit: item.deposit,
      address: item.address,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await api.delete(`/rent/items/${id}/`)
        fetchItems()
      } catch (error) {
        console.error("Error deleting item:", error)
      }
    }
  }

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Rental Items</h1>
          <p className="text-gray-600 mt-1">Manage your items available for rent</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Showing {filteredItems.length} of {items.length} items
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-lg hover:from-orange-700 hover:to-yellow-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search your items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="text-gray-600 mb-4">{item.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span>${item.price_per_day}/day</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{item.address}</span>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              <Calendar className="h-3 w-3 inline mr-1" />
              Created: {new Date(item.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && items.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">No items found</div>
          <div className="text-sm text-gray-400">
            You haven't added any items for rent yet. Click "Add Item" to get started!
          </div>
        </div>
      )}

      {filteredItems.length === 0 && items.length > 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No items match your search</div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{editingItem ? "Edit Item" : "Add New Item"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price_per_day" className="block text-sm font-medium text-gray-700">
                    Price per day ($)
                  </label>
                  <input
                    id="price_per_day"
                    type="number"
                    step="0.01"
                    required
                    value={formData.price_per_day}
                    onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="deposit" className="block text-sm font-medium text-gray-700">
                    Deposit ($)
                  </label>
                  <input
                    id="deposit"
                    type="number"
                    step="0.01"
                    required
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  id="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-lg hover:from-orange-700 hover:to-yellow-700 transition-colors"
                >
                  {editingItem ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingItem(null)
                    setFormData({
                      title: "",
                      description: "",
                      category: "",
                      price_per_day: "",
                      deposit: "",
                      address: "",
                    })
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

export default Items
