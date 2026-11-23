"use client"

import { useEffect, useState } from "react"
import { BookOpen, Loader2, Shield, Search, AlertCircle } from "lucide-react"

const severityColors: Record<string, string> = {
  CRITICAL: "bg-red-500/20 text-red-400",
  WARNING: "bg-yellow-500/20 text-yellow-400",
  SUGGESTION: "bg-blue-500/20 text-blue-400",
}

const categoryColors: Record<string, string> = {
  TONE: "bg-blue-500/20 text-blue-300",
  TERMINOLOGY: "bg-purple-500/20 text-purple-300",
  FACTS: "bg-red-500/20 text-red-300",
  MESSAGING: "bg-yellow-500/20 text-yellow-300",
  ACCESSIBILITY: "bg-green-500/20 text-green-300",
  VISUAL: "bg-pink-500/20 text-pink-300",
}

const categories = ["ALL", "TONE", "TERMINOLOGY", "FACTS", "MESSAGING", "ACCESSIBILITY", "VISUAL"]

export default function RulesPage() {
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionError, setActionError] = useState("")
  const [filter, setFilter] = useState("ALL")
  const [search, setSearch] = useState("")
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/rules")
      .then((r) => {
        if (!r.ok) throw new Error("Failed")
        return r.json()
      })
      .then(setRules)
      .catch(() => setError("Failed to load rules."))
      .finally(() => setLoading(false))
  }, [])

  const toggleRule = async (id: string, isActive: boolean) => {
    setToggling(id)
    setActionError("")
    try {
      const res = await fetch(`/api/rules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (res.ok) {
        setRules((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, isActive: !isActive } : r
          )
        )
      } else {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to update rule")
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to update rule")
    }
    setToggling(null)
  }

  const filteredRules = rules.filter((r) => {
    const matchesCategory = filter === "ALL" || r.category === filter
    const matchesSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.ruleCode.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const activeCount = rules.filter((r) => r.isActive).length

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-rose-500" />
          <h1 className="text-2xl font-bold text-white">Brand Rules</h1>
        </div>
        {rules.length > 0 && (
          <span className="text-sm text-slate-400">
            {activeCount} active / {rules.length} total
          </span>
        )}
      </div>
      <p className="text-slate-400 mb-6">
        Manage the rules that content is reviewed against
      </p>
      {actionError && <div className="mb-5 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3"><AlertCircle className="h-4 w-4 shrink-0" /><span>{actionError}</span></div>}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rules..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition-shadow"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const count = cat === "ALL" ? rules.length : rules.filter((r) => r.category === cat).length
            if (cat !== "ALL" && count === 0) return null
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filter === cat
                    ? "bg-rose-500 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="text-slate-400">{error}</p>
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="text-center py-20">
          <Shield className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">
            {search || filter !== "ALL"
              ? "No rules match your search."
              : "No rules found. Add brand guidelines to generate rules."}
          </p>
          {(search || filter !== "ALL") && (
            <button
              onClick={() => { setSearch(""); setFilter("ALL") }}
              className="text-rose-400 hover:text-rose-300 text-sm mt-2"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRules.map((rule, i) => (
            <div
              key={rule.id}
              className={`bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 transition-all duration-200 hover:border-slate-600 animate-slide-up ${
                !rule.isActive ? "opacity-50" : ""
              }`}
              style={{ animationDelay: `${i * 30}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono bg-slate-700 text-rose-400 px-2 py-0.5 rounded">
                    {rule.ruleCode}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[rule.category] || ""}`}
                  >
                    {rule.category}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${severityColors[rule.severity] || ""}`}
                  >
                    {rule.severity}
                  </span>
                </div>
                {/* Toggle */}
                <button
                  onClick={() => toggleRule(rule.id, rule.isActive)}
                  disabled={toggling === rule.id}
                  aria-label={rule.isActive ? "Disable rule" : "Enable rule"}
                  className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
                    rule.isActive ? "bg-rose-500" : "bg-slate-600"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                      rule.isActive ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                {rule.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                {rule.description}
              </p>
              {rule.guideline && (
                <p className="text-xs text-slate-500 mt-3">
                  From: {rule.guideline.name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
