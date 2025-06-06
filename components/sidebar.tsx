"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart2, Store, Pizza, ShoppingBag, Users, HeadphonesIcon, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Sidebar() {
  const pathname = usePathname()

  const routes = [
    {
      label: "Tableau de bord",
      icon: BarChart2,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Pizzerias",
      icon: Store,
      href: "/pizzerias",
      active: pathname === "/pizzerias",
    },
    {
      label: "PIZZAS",
      icon: Pizza,
      href: "/pizzas",
      active: pathname === "/pizzas",
    },
    {
      label: "Commandes",
      icon: ShoppingBag,
      href: "/commandes",
      active: pathname === "/commandes",
      badge: 12,
    },
    {
      label: "Utilisateurs",
      icon: Users,
      href: "/utilisateurs",
      active: pathname === "/utilisateurs",
    },
    {
      label: "Support Client",
      icon: HeadphonesIcon,
      href: "/support",
      active: pathname === "/support",
      badge: 5,
    },
    {
      label: "Paramètres",
      icon: Settings,
      href: "/parametres",
      active: pathname === "/parametres",
    },
  ]

  return (
    <div className="h-full w-64 border-r bg-white flex flex-col">
      <div className="p-6 flex items-center">
        <img src="/placeholder.svg?height=40&width=40" alt="Logo" className="h-8 w-8 mr-2 rounded-full" />
        <span className="text-xl font-bold text-amber-500">Admin</span>
      </div>
      <div className="flex-1 px-3 py-2">
        <nav className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center px-3 py-3 text-sm font-medium rounded-md",
                route.active ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <route.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="flex-1">{route.label}</span>
              {route.badge && (
                <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-red-600 text-white">
                  {route.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
