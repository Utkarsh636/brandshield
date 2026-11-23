"use client"

import { useEffect, useState } from "react"
import { ScrollText, Loader2, Trash2, BookOpen, Shield, Plus, CheckCircle, AlertCircle } from "lucide-react"
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
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

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
      setShowForm(false)
      fetchGuidelines()
    } catch (err: any) {
      setError(err.message)
    }
    setSubmitting(false)
  }

  const deleteGuideline = async (id: string) => {
    if (!confirm("Delete this guideline and all its rules?")) return
    setDeleting(id)
    try {
      await fetch(`/api/guidelines/${id}`, { method: "DELETE" })
      fetchGuidelines()
    } catch (err) {
      console.error(err)
    }
    setDeleting(null)
  }

  const totalRules = guidelines.reduce((sum, g) => sum + (g._count?.rules || 0), 0)

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <ScrollText className="h-6 w-6 text-rose-500" />
          <h1 className="text-2xl font-bold text-white">Brand Guidelines</h1>
        </div>
        {guidelines.length > 0 && (
          <span className="text-sm text-slate-400">
            {guidelines.length} guideline{guidelines.length !== 1 ? "s" : ""}, {totalRules} rules
          </span>
        )}
      </div>
      <p className="text-slate-400 mb-8">
        Upload guidelines and let AI parse them into structured rules
      </p>

      {/* Success/Error toasts */}
      {success && (
        <div className="mb-6 flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 animate-scale-in">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{success}</span>
          <button onClick={() => setSuccess("")} className="ml-auto text-green-400/50 hover:text-green-400">&times;</button>
        </div>
      )}

      {/* Upload form toggle */}
      {!showForm && !submitting && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-8 w-full p-5 border-2 border-dashed border-slate-700 hover:border-rose-500/30 rounded-xl text-center transition-colors group"
        >
          <Plus className="h-8 w-8 text-slate-600 group-hover:text-rose-400 mx-auto mb-2 transition-colors" />
          <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
            Upload new brand guidelines
          </p>
        </button>
      )}

      {/* Upload form */}
      {(showForm || submitting) && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-8 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Plus className="h-4 w-4" /> Upload New Guidelines
            </h3>
            {!submitting && (
              <button onClick={() => setShowForm(false)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                Cancel
              </button>
            )}
          </div>

          {submitting ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="relative">
                <Shield className="h-12 w-12 text-rose-500 animate-pulse" />
                <Loader2 className="h-6 w-6 text-rose-400 animate-spin absolute -bottom-1 -right-1" />
              </div>
              <p className="text-sm text-slate-300">
                AI is parsing your guidelines into structured rules...
              </p>
              <p className="text-xs text-slate-500">This may take 15-30 seconds</p>
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
                  maxLength={160}
                  placeholder="e.g. Acme Corp Brand Voice Guidelines"
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition-shadow"
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
                  maxLength={500}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition-shadow"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-300">
                    Guidelines Content
                  </label>
                  <span className="text-xs text-slate-500">{rawContent.length.toLocaleString()} chars</span>
                </div>
                <textarea
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  required
                  maxLength={20000}
                  rows={10}
                  placeholder={"Paste your brand guidelines here...\n\nExample:\n- Always use active voice in customer-facing content\n- Use 'customers' instead of 'users' in external communications\n- Never make unverified product claims\n- Maintain a professional but friendly tone"}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm resize-y transition-shadow"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 animate-scale-in">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!name.trim() || !rawContent.trim() || rawContent.length > 20000}
                  className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-medium rounded-lg transition-all text-sm"
                >
                  Parse & Save Guidelines
                </button>
                <p className="text-xs text-slate-500">AI will extract structured rules</p>
              </div>
            </form>
          )}
        </div>
      )}

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
          <p className="text-sm text-slate-400 mb-1">
            No guidelines uploaded yet
          </p>
          <p className="text-xs text-slate-500">
            Upload guidelines above to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guidelines.map((g) => (
            <div
              key={g.id}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {g.name}
                  </h4>
                  {g.description && (
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                      {g.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteGuideline(g.id)}
                  disabled={deleting === g.id}
                  className="text-slate-500 hover:text-red-400 transition-colors p-1 shrink-0 ml-2"
                >
                  {deleting === g.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {g._count?.rules || 0} rules
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(g.createdAt).toLocaleDateString()}
                </span>
              </div>
              <Link
                href="/dashboard/rules"
                className="text-xs text-rose-400 hover:text-rose-300 mt-3 inline-flex items-center gap-1 transition-colors"
              >
                View Rules &rarr;
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
