"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return <div className="text-center py-24"><AlertTriangle className="h-12 w-12 text-rose-400 mx-auto mb-4" /><h1 className="text-xl font-bold text-white">This page could not load</h1><p className="text-slate-400 mt-2">Try again, or return to the dashboard.</p><button onClick={reset} className="mt-5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg">Try again</button></div>
}
