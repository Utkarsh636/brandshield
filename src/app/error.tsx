"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return <html><body className="bg-slate-950 text-white min-h-screen flex items-center justify-center p-6"><div className="max-w-md text-center"><AlertTriangle className="h-12 w-12 text-rose-400 mx-auto mb-4" /><h1 className="text-xl font-bold">Something went wrong</h1><p className="text-slate-400 mt-2">BrandShield could not load this screen. Your data has not been changed.</p><button onClick={reset} className="mt-5 px-4 py-2 bg-rose-500 hover:bg-rose-600 rounded-lg">Try again</button></div></body></html>
}
