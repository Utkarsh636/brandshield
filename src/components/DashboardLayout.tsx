"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Sidebar from "./Sidebar"
import { Loader2, Menu, Shield } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <Shield className="h-10 w-10 text-rose-500 animate-pulse" />
        <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-slate-400 hover:text-white p-1"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Shield className="h-5 w-5 text-rose-500" />
        <span className="font-bold text-white">BrandShield</span>
      </div>

      {/* Sidebar - desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Sidebar - mobile overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="lg:hidden z-40 fixed top-0 left-0 bottom-0">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      <main className="lg:ml-64 p-6 lg:p-8 pt-16 lg:pt-8 min-h-screen">
        {children}
      </main>
    </div>
  )
}
