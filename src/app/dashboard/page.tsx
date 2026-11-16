"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  FileText,
  CheckCircle,
  TrendingUp,
  BookOpen,
  Loader2,
  ChevronRight,
} from "lucide-react"

interface DashboardData {
  totalContent: number
  approvedContent: number
  approvalRate: number
  totalRules: number
  totalFindings: number
  findingsByCategory: { category: string; count: number }[]
  findingsBySeverity: { severity: string; count: number }[]
  recentContent: any[]
}

const categoryColors: Record<string, string> = {
  TONE: "bg-blue-500",
  TERMINOLOGY: "bg-purple-500",
  FACTS: "bg-red-500",
  MESSAGING: "bg-yellow-500",
  ACCESSIBILITY: "bg-green-500",
  VISUAL: "bg-pink-500",
}

const severityColors: Record<string, string> = {
  CRITICAL: "bg-red-500/20 text-red-400 border-red-500/30",
  WARNING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  SUGGESTION: "bg-blue-500/20 text-blue-400 border-blue-500/30",
}

const statusColors: Record<string, string> = {
  PENDING: "bg-slate-500/20 text-slate-400",
  UNDER_REVIEW: "bg-blue-500/20 text-blue-400",
  APPROVED: "bg-green-500/20 text-green-400",
  REJECTED: "bg-red-500/20 text-red-400",
  REVISION_REQUESTED: "bg-yellow-500/20 text-yellow-400",
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-800/50 rounded-xl" />
        ))}
      </div>
      <div className="h-48 bg-slate-800/50 rounded-xl" />
      <div className="h-64 bg-slate-800/50 rounded-xl" />
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-slate-400 mb-8">Brand governance overview</p>
        <Skeleton />
      </div>
    )
  }

  if (!data) {
    return <p className="text-slate-400">Failed to load dashboard data.</p>
  }

  const maxCatCount = Math.max(...(data.findingsByCategory.map((f) => f.count) || [1]), 1)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
      <p className="text-slate-400 mb-8">Brand governance overview</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Content", value: data.totalContent, icon: FileText, color: "text-blue-400" },
          { label: "Approved", value: data.approvedContent, icon: CheckCircle, color: "text-green-400" },
          { label: "Compliance Rate", value: `${data.approvalRate}%`, icon: TrendingUp, color: "text-rose-400" },
          { label: "Active Rules", value: data.totalRules, icon: BookOpen, color: "text-purple-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">{stat.label}</span>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Findings by Category */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
            Findings by Category
          </h3>
          {data.findingsByCategory.length === 0 ? (
            <p className="text-sm text-slate-500">No findings yet</p>
          ) : (
            <div className="space-y-3">
              {data.findingsByCategory.map((f) => (
                <div key={f.category}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-300">{f.category}</span>
                    <span className="text-slate-500">{f.count}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${categoryColors[f.category] || "bg-slate-500"}`}
                      style={{ width: `${(f.count / maxCatCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Findings by Severity */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
            Findings by Severity
          </h3>
          {data.findingsBySeverity.length === 0 ? (
            <p className="text-sm text-slate-500">No findings yet</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {data.findingsBySeverity.map((f) => (
                <div
                  key={f.severity}
                  className={`px-4 py-3 rounded-xl border ${severityColors[f.severity] || ""}`}
                >
                  <p className="text-2xl font-bold">{f.count}</p>
                  <p className="text-xs mt-1 opacity-80">{f.severity}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Content */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Recent Content
          </h3>
          <Link
            href="/dashboard/content"
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        {data.recentContent.length === 0 ? (
          <p className="text-sm text-slate-500">
            No content submitted yet.{" "}
            <Link href="/dashboard/submit" className="text-rose-400 hover:underline">
              Submit your first piece
            </Link>
          </p>
        ) : (
          <div className="space-y-2">
            {data.recentContent.map((item: any) => (
              <Link
                key={item.id}
                href={`/dashboard/content/${item.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/30 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4 w-4 text-slate-500 shrink-0" />
                  <span className="text-sm text-white truncate">
                    {item.title}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusColors[item.status] || ""}`}
                  >
                    {item.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {item.reviews?.[0]?.overallScore != null && (
                    <span className="text-sm text-slate-400">
                      {item.reviews[0].overallScore}/100
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
