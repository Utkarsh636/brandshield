"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PenSquare, Loader2, Shield } from "lucide-react"

const contentTypes = [
  { value: "TEXT", label: "General Text" },
  { value: "EMAIL", label: "Email" },
  { value: "SOCIAL_POST", label: "Social Media Post" },
  { value: "ADVERTISEMENT", label: "Advertisement" },
  { value: "BLOG_POST", label: "Blog Post" },
  { value: "DOCUMENT", label: "Document" },
]

export default function SubmitPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [contentType, setContentType] = useState("TEXT")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, contentType }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to submit content")
      }

      const data = await res.json()
      router.push(`/dashboard/content/${data.id}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <Shield className="h-16 w-16 text-rose-500 animate-pulse" />
          <Loader2 className="h-8 w-8 text-rose-400 animate-spin absolute -bottom-1 -right-1" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-white">
            BrandShield AI is reviewing your content...
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Checking against all active brand rules
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-1">
        <PenSquare className="h-6 w-6 text-rose-500" />
        <h1 className="text-2xl font-bold text-white">Submit Content</h1>
      </div>
      <p className="text-slate-400 mb-8">
        Submit content for brand compliance review
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Q4 Product Launch Email"
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Content Type
          </label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
          >
            {contentTypes.map((ct) => (
              <option key={ct.value} value={ct.value}>
                {ct.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Content
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={10}
            placeholder="Paste or type your content here..."
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm resize-y"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-colors"
        >
          Submit for Review
        </button>
      </form>
    </div>
  )
}
