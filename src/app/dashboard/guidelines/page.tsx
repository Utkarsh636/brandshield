"use client"

import { useEffect, useState } from "react"
import { ScrollText, Loader2, Trash2, BookOpen, Shield, Plus } from "lucide-react"
import Link from "next/link"

export default function GuidelinesPage() {
  const [guidelines, setGuidelines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [rawContent, setRawContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const fetchGuidelines = () => {
    fetch("/api/guidelines")
      .then((r) => r.json())
      .then(setGuidelines)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchGuidelines()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSubmitting(true)

    try {
      const res = await fetch("/api/guidelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, rawContent }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create guideline")
      }

      const data = await res.json()
      setSuccess(
        `Guidelines parsed successfully! ${data.rules?.length || 0} rules extracted.`
      )
      setName("")
      setDescription("")
      setRawContent("")
      fetchGuidelines()
    } catch (err: any) {
      setError(err.message)
    }
    setSubmitting(false)
  }

  const deleteGuideline = async (id: string) => {
    if (!confirm("Delete this guideline and all its rules?")) return
    try {
      await fetch(`/api/guidelines/${id}`, { method: "DELETE" })
      fetchGuidelines()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <ScrollText className="h-6 w-6 text-rose-500" />
        <h1 className="text-2xl font-bold text-white">Brand Guidelines</h1>
      </div>
      <p className="text-slate-400 mb-8">
        Upload guidelines and let AI parse them into structured rules
      </p>

      {/* Upload form */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-8">
        <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
          <Plus className="h-4 w-4" /> Upload New Guidelines
        </h3>

        {submitting ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="relative">
              <Shield className="h-12 w-12 text-rose-500 animate-pulse" />
              <Loader2 className="h-6 w-6 text-rose-400 animate-spin absolute -bottom-1 -right-1" />
            </div>
            <p className="text-sm text-slate-300">
              AI is parsing your guidelines into structured rules...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Guideline Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Acme Corp Brand Voice Guidelines"
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Description{" "}
                <span className="text-slate-500">(optional)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of these guidelines"
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Guidelines Content
              </label>
              <textarea
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                required
                rows={10}
                placeholder={"Paste your brand guidelines here...\n\nExample:\n- Always use active voice in customer-facing content\n- Use 'customers' instead of 'users' in external communications\n- Never make unverified product claims\n- Maintain a professional but friendly tone"}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm resize-y"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
                {success}
              </p>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Parse & Save Guidelines
            </button>
          </form>
        )}
      </div>

      {/* Existing guidelines */}
      <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
        Existing Guidelines
      </h3>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 text-rose-500 animate-spin" />
        </div>
      ) : guidelines.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 border border-slate-700/30 rounded-xl">
          <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">
            No guidelines uploaded yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guidelines.map((g) => (
            <div
              key={g.id}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {g.name}
                  </h4>
                  {g.description && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {g.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteGuideline(g.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
                  {g._count?.rules || 0} rules
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(g.createdAt).toLocaleDateString()}
                </span>
              </div>
              <Link
                href="/dashboard/rules"
                className="text-xs text-rose-400 hover:text-rose-300 mt-3 inline-block"
              >
                View Rules →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
