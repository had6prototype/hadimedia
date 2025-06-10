"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Video, Tags, Users, Settings, Menu, X, LogOut, Home } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: "داشبورد", href: "/admin", icon: LayoutDashboard },
    { name: "مدیریت برنامه‌ها", href: "/admin/programs", icon: Video },
    { name: "مدیریت تگ‌ها", href: "/admin/tags", icon: Tags },
    { name: "کاربران", href: "/admin/users", icon: Users },
    { name: "تنظیمات", href: "/admin/settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h2 className="text-lg font-semibold">پنل مدیریت</h2>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="p-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href ? "bg-primary text-primary-foreground" : "text-gray-700 hover:bg-gray-100",
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:z-50 lg:w-64 lg:bg-white lg:border-l">
        <div className="flex h-16 items-center justify-center px-4 border-b">
          <h2 className="text-lg font-semibold">پنل مدیریت الهادی</h2>
        </div>
        <nav className="p-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === item.href ? "bg-primary text-primary-foreground" : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <Home className="h-5 w-5" />
            بازگشت به سایت
          </Link>
          <Button variant="outline" className="w-full justify-start gap-3">
            <LogOut className="h-5 w-5" />
            خروج
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pr-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {navigation.find((item) => item.href === pathname)?.name || "پنل مدیریت"}
              </h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Button variant="outline" asChild>
                <Link href="/">مشاهده سایت</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
