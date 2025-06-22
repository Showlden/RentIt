import { NavLink } from "react-router-dom"
import { Home, Package, User, ShoppingBag, Calendar } from "lucide-react"

const Sidebar = () => {
  const navItems = [
    { to: "/dashboard", icon: Home, label: "Dashboard" },
    { to: "/marketplace", icon: ShoppingBag, label: "Marketplace" },
    { to: "/items", icon: Package, label: "My Items" },
    { to: "/bookings", icon: Calendar, label: "Bookings" },
    { to: "/profile", icon: User, label: "Profile" },
  ]

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen">
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                  ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar
