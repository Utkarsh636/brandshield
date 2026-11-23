"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  FileText,
  CheckCircle,
  TrendingUp,
  BookOpen,
  Loader2,
  ChevronRight,
  PenSquare,
  ScrollText,
  AlertCircle,
  PlayCircle,
} from "lucide-react"
import Tooltip from "@/components/Tooltip"

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-48 bg-slate-800/50 rounded-xl" />
        <div className="h-48 bg-slate-800/50 rounded-xl" />
      </div>
      <div className="h-48 bg-slate-800/50 rounded-xl" />
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const startDemo = () => {
    localStorage.setItem("brandshield_demo_mode", "true")
    router.push("/dashboard/content?demo=1")
  }

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load")
        return r.json()
      })
      .then(setData)
      .catch(() => setError("Failed to load dashboard data. Check your database connection."))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-slate-400 mb-8">Brand governance overview</p>
        <Skeleton />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
        <p className="text-slate-300 font-medium">{error || "Failed to load dashboard data."}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-sm text-rose-400 hover:text-rose-300">
          Try again
        </button>
      </div>
    )
  }

  const maxCatCount = Math.max(...(data.findingsByCategory.map((f) => f.count) || [1]), 1)
  const isEmpty = data.totalContent === 0 && data.totalRules === 0

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-8"><div><h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1><p className="text-slate-400">Brand governance overview</p></div><button onClick={startDemo} title="Open the guided demo content" className="px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"><PlayCircle className="h-4 w-4" /> Demo mode</button></div>

      {/* Empty-state quick actions */}
      {isEmpty && (
        <div className="mb-8 p-6 bg-gradient-to-br from-rose-500/10 to-slate-900/50 border border-rose-500/20 rounded-xl animate-slide-up">
          <h3 className="text-lg font-semibold text-white mb-2">Welcome to BrandShield</h3>
          <p className="text-sm text-slate-400 mb-5">Get started by adding your brand guidelines, then submit content for AI review.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/guidelines" className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
              <ScrollText className="h-4 w-4" /> Upload Guidelines
            </Link>
            <Link href="/dashboard/submit" className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 border border-slate-700">
              <PenSquare className="h-4 w-4" /> Submit Content
            </Link>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Content", value: data.totalContent, icon: FileText, color: "text-blue-400", link: "/dashboard/content", tip: "Total pieces of content submitted for review" },
          { label: "Approved", value: data.approvedContent, icon: CheckCircle, color: "text-green-400", link: "/dashboard/content", tip: "Content that passed brand review and was approved" },
          { label: "Compliance Rate", value: `${data.approvalRate}%`, icon: TrendingUp, color: "text-rose-400", link: null, tip: "Percentage of submitted content that was approved" },
          { label: "Active Rules", value: data.totalRules, icon: BookOpen, color: "text-purple-400", link: "/dashboard/rules", tip: "Brand rules currently being checked against" },
        ].map((stat) => {
          const inner = (
            <>
              <div className="flex items-center justify-between mb-3">
                <Tooltip text={stat.tip} position="bottom">
                  <span className="text-sm text-slate-400 border-b border-dotted border-slate-600 cursor-help">{stat.label}</span>
                </Tooltip>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </>
          )
          return stat.link ? (
            <Link
              key={stat.label}
              href={stat.link}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 hover:bg-slate-800/70 transition-all group"
            >
              {inner}
            </Link>
          ) : (
            <div key={stat.label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              {inner}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Findings by Category */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
            Findings by Category
          </h3>
          {data.findingsByCategory.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No findings yet. Submit content to generate findings.</p>
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
                      className={`h-full rounded-full transition-all duration-500 ${categoryColors[f.category] || "bg-slate-500"}`}
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
            <p className="text-sm text-slate-500 py-4">No findings yet.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {data.findingsBySeverity.map((f) => (
                <div
                  key={f.severity}
                  className={`px-5 py-4 rounded-xl border flex-1 min-w-[100px] ${severityColors[f.severity] || ""}`}
                >
                  <p className="text-3xl font-bold">{f.count}</p>
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
          {data.recentContent.length > 0 && (
            <Link
              href="/dashboard/content"
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
        {data.recentContent.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-10 w-10 text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-500">
              No content submitted yet.{" "}
              <Link href="/dashboard/submit" className="text-rose-400 hover:underline">
                Submit your first piece
              </Link>
            </p>
          </div>
        ) : (
          <div className="space-y-1">
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
                    {item.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {item.reviews?.[0]?.overallScore != null && item.reviews[0].overallScore >= 0 && (
                    <span className={`text-sm font-medium ${
                      item.reviews[0].overallScore >= 80 ? "text-green-400" :
                      item.reviews[0].overallScore >= 50 ? "text-yellow-400" : "text-red-400"
                    }`}>
                      {item.reviews[0].overallScore}/100
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
