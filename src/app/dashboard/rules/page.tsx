"use client"

import { useEffect, useState } from "react"
import { BookOpen, Loader2, Shield } from "lucide-react"

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
  const [filter, setFilter] = useState("ALL")
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/rules")
      .then((r) => r.json())
      .then(setRules)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const toggleRule = async (id: string, isActive: boolean) => {
    setToggling(id)
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
      }
    } catch (err) {
      console.error(err)
    }
    setToggling(null)
  }

  const filteredRules =
    filter === "ALL" ? rules : rules.filter((r) => r.category === filter)

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <BookOpen className="h-6 w-6 text-rose-500" />
        <h1 className="text-2xl font-bold text-white">Brand Rules</h1>
      </div>
      <p className="text-slate-400 mb-6">
        Manage the rules that content is reviewed against
      </p>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
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
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="text-center py-20">
          <Shield className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">
            No rules found. Add brand guidelines to generate rules.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRules.map((rule) => (
            <div
              key={rule.id}
              className={`bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 transition-opacity ${
                !rule.isActive ? "opacity-50" : ""
              }`}
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
                  className={`relative w-10 h-5 rounded-full transition-colors ${
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
              <p className="text-sm text-slate-400 leading-relaxed">
                {rule.description}
              </p>
              {rule.guideline && (
                <p className="text-xs text-slate-500 mt-2">
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
