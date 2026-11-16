"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  Shield,
  LayoutDashboard,
  PenSquare,
  FileText,
  BookOpen,
  ScrollText,
  LogOut,
  User,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/submit", label: "Submit Content", icon: PenSquare },
  { href: "/dashboard/content", label: "Content Queue", icon: FileText },
  { href: "/dashboard/rules", label: "Brand Rules", icon: BookOpen },
  { href: "/dashboard/guidelines", label: "Guidelines", icon: ScrollText },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Shield className="h-7 w-7 text-rose-500" />
          <span className="font-bold text-lg text-white">BrandShield</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-rose-500/15 text-rose-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" style={{width:18,height:18}} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
            <User className="h-4 w-4 text-slate-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {(session?.user as any)?.role || "CREATOR"}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 mt-1 w-full text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
