"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText, Loader2, Eye, ChevronRight } from "lucide-react"

const statusColors: Record<string, string> = {
  PENDING: "bg-slate-500/20 text-slate-400",
  UNDER_REVIEW: "bg-blue-500/20 text-blue-400",
  APPROVED: "bg-green-500/20 text-green-400",
  REJECTED: "bg-red-500/20 text-red-400",
  REVISION_REQUESTED: "bg-yellow-500/20 text-yellow-400",
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
  const [contents, setContents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then(setContents)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Content Queue</h1>
          <p className="text-slate-400">All submitted content and review status</p>
        </div>
        <Link
          href="/dashboard/submit"
          className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Submit New
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
        </div>
      ) : contents.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No content submitted yet.</p>
          <Link
            href="/dashboard/submit"
            className="text-rose-400 hover:underline text-sm mt-1 inline-block"
          >
            Submit your first piece
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
              {contents.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-700/20 transition-colors"
                >
                  <td className="px-5 py-3">
                    <span className="text-sm text-white font-medium">
                      {item.title}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                      {typeLabels[item.contentType] || item.contentType}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full ${statusColors[item.status] || ""}`}
                    >
                      {item.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-slate-300">
                      {item.reviews?.[0]?.overallScore != null
                        ? `${item.reviews[0].overallScore}/100`
                        : "\u2014"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/dashboard/content/${item.id}`}
                      className="text-rose-400 hover:text-rose-300 text-sm flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
