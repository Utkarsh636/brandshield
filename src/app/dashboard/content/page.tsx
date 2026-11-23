"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { FileText, Loader2, Eye, AlertCircle } from "lucide-react"

const statusColors: Record<string, string> = {
  PENDING: "bg-slate-500/20 text-slate-400",
  UNDER_REVIEW: "bg-blue-500/20 text-blue-400",
  APPROVED: "bg-green-500/20 text-green-400",
  REJECTED: "bg-red-500/20 text-red-400",
  REVISION_REQUESTED: "bg-yellow-500/20 text-yellow-400",
}

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REVISION_REQUESTED: "Revision Requested",
}

const typeLabels: Record<string, string> = {
  TEXT: "Text",
  EMAIL: "Email",
  SOCIAL_POST: "Social",
  ADVERTISEMENT: "Ad",
  BLOG_POST: "Blog",
  DOCUMENT: "Doc",
}

export default function ContentQueuePage() {
  const searchParams = useSearchParams()
  const [contents, setContents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const demoMode = searchParams.get("demo") === "1"

  useEffect(() => {
    fetch("/api/content")
      .then((r) => {
        if (!r.ok) throw new Error("Failed")
        return r.json()
      })
      .then(setContents)
      .catch(() => setError("Failed to load content."))
      .finally(() => setLoading(false))
  }, [])

  const statuses = ["ALL", "PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "REVISION_REQUESTED"]
  const filtered = statusFilter === "ALL" ? contents : contents.filter((c) => c.status === statusFilter)

  return (
    <div className="animate-fade-in">
      {demoMode && <div className="mb-5 p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl"><p className="text-sm font-semibold text-violet-200">Demo mode is on</p><p className="text-xs text-slate-400 mt-1">Open a low-score item, use Auto-Fix, add a comment, inspect revisions, and download the PDF report.</p></div>}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Content Queue</h1>
          <p className="text-slate-400">
            {contents.length > 0 ? `${contents.length} total items` : "All submitted content and review status"}
          </p>
        </div>
        <Link
          href="/dashboard/submit"
          className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-rose-500/20"
        >
          + Submit New
        </Link>
      </div>

      {/* Status filter */}
      {contents.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {statuses.map((s) => {
            const count = s === "ALL" ? contents.length : contents.filter((c) => c.status === s).length
            if (s !== "ALL" && count === 0) return null
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-rose-500 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {s === "ALL" ? "All" : statusLabels[s] || s} ({count})
              </button>
            )
          })}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="text-slate-400">{error}</p>
        </div>
      ) : contents.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-medium mb-1">No content submitted yet</p>
          <p className="text-slate-500 text-sm mb-4">Submit your first piece of content for AI review</p>
          <Link
            href="/dashboard/submit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm rounded-lg transition-colors"
          >
            Submit Content
          </Link>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                  Title
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                  Type
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                  Score
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                  Submitted
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filtered.map((item) => {
                const score = item.reviews?.[0]?.overallScore
                const hasScore = score != null && score >= 0
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <Link href={`/dashboard/content/${item.id}`} className="text-sm text-white font-medium hover:text-rose-400 transition-colors">
                        {item.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                        {typeLabels[item.contentType] || item.contentType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full ${statusColors[item.status] || ""}`}
                      >
                        {statusLabels[item.status] || item.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {hasScore ? (
                        <span className={`text-sm font-medium ${
                          score >= 80 ? "text-green-400" :
                          score >= 50 ? "text-yellow-400" : "text-red-400"
                        }`}>
                          {score}/100
                        </span>
                      ) : (
                        <span className="text-sm text-slate-600">&mdash;</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/dashboard/content/${item.id}`}
                        className="text-rose-400 hover:text-rose-300 text-sm flex items-center gap-1 transition-colors"
                      >
                        <Eye className="h-4 w-4" /> View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
