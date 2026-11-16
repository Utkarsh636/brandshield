"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Shield,
  FileText,
  Info,
} from "lucide-react"
import Link from "next/link"

const statusColors: Record<string, string> = {
  PENDING: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  UNDER_REVIEW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  APPROVED: "bg-green-500/20 text-green-400 border-green-500/30",
  REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
  REVISION_REQUESTED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
}

const severityConfig: Record<string, { color: string; icon: any }> = {
  CRITICAL: { color: "bg-red-500/15 text-red-400 border-red-500/30", icon: XCircle },
  WARNING: { color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", icon: AlertTriangle },
  SUGGESTION: { color: "bg-blue-500/15 text-blue-400 border-blue-500/30", icon: Info },
}

const categoryColors: Record<string, string> = {
  TONE: "bg-blue-500/20 text-blue-300",
  TERMINOLOGY: "bg-purple-500/20 text-purple-300",
  FACTS: "bg-red-500/20 text-red-300",
  MESSAGING: "bg-yellow-500/20 text-yellow-300",
  ACCESSIBILITY: "bg-green-500/20 text-green-300",
  VISUAL: "bg-pink-500/20 text-pink-300",
}

export default function ContentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState("")
  const [reviewLoading, setReviewLoading] = useState(false)

  const fetchContent = () => {
    setLoading(true)
    fetch(`/api/content/${params.id}`)
      .then((r) => r.json())
      .then(setContent)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchContent()
  }, [params.id])

  const updateStatus = async (status: string) => {
    setActionLoading(status)
    try {
      await fetch(`/api/content/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      fetchContent()
    } catch (err) {
      console.error(err)
    }
    setActionLoading("")
  }

  const rerunReview = async () => {
    setReviewLoading(true)
    try {
      await fetch(`/api/content/${params.id}/review`, { method: "POST" })
      fetchContent()
    } catch (err) {
      console.error(err)
    }
    setReviewLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
      </div>
    )
  }

  if (!content) {
    return <p className="text-slate-400">Content not found.</p>
  }

  const latestReview = content.reviews?.[0]
  const findings = latestReview?.findings || []
  const score = latestReview?.overallScore

  const scoreColor =
    score == null
      ? "text-slate-400"
      : score >= 80
        ? "text-green-400"
        : score >= 50
          ? "text-yellow-400"
          : "text-red-400"

  const scoreBg =
    score == null
      ? "bg-slate-800"
      : score >= 80
        ? "bg-green-500/10 border-green-500/20"
        : score >= 50
          ? "bg-yellow-500/10 border-yellow-500/20"
          : "bg-red-500/10 border-red-500/20"

  return (
    <div>
      {/* Back link */}
      <Link
        href="/dashboard/content"
        className="text-sm text-slate-400 hover:text-white flex items-center gap-1 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to queue
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-white mb-2">
                  {content.title}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded">
                    {content.contentType.replace(/_/g, " ")}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border ${statusColors[content.status] || ""}`}
                  >
                    {content.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
              <span className="text-xs text-slate-500">
                {new Date(content.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4">
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {content.body}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => updateStatus("APPROVED")}
                disabled={!!actionLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {actionLoading === "APPROVED" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Approve
              </button>
              <button
                onClick={() => updateStatus("REVISION_REQUESTED")}
                disabled={!!actionLoading}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {actionLoading === "REVISION_REQUESTED" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                Request Revision
              </button>
              <button
                onClick={() => updateStatus("REJECTED")}
                disabled={!!actionLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {actionLoading === "REJECTED" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Reject
              </button>
              <button
                onClick={rerunReview}
                disabled={reviewLoading}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {reviewLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Re-run Review
              </button>
            </div>
          </div>
        </div>

        {/* Right: Review Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Score */}
          <div className={`border rounded-xl p-6 text-center ${scoreBg}`}>
            <Shield className={`h-8 w-8 mx-auto mb-2 ${scoreColor}`} />
            <p className={`text-5xl font-bold ${scoreColor}`}>
              {score != null ? score : "\u2014"}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Brand Compliance Score
            </p>
            {latestReview?.summary && (
              <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                {latestReview.summary}
              </p>
            )}
          </div>

          {/* Findings */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">
              Findings ({findings.length})
            </h3>

            {findings.length === 0 ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
                <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-semibold">All Clear!</p>
                <p className="text-sm text-green-400/70 mt-1">
                  No brand guideline violations detected
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {findings.map((finding: any, idx: number) => {
                  const sev = severityConfig[finding.severity] || severityConfig.WARNING
                  const SevIcon = sev.icon
                  return (
                    <div
                      key={finding.id || idx}
                      className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3"
                    >
                      {/* Header */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${sev.color}`}
                        >
                          <SevIcon className="h-3 w-3" />
                          {finding.severity}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[finding.category] || ""}`}
                        >
                          {finding.category}
                        </span>
                        {finding.rule && (
                          <span className="text-xs text-slate-500">
                            Rule: {finding.rule.ruleCode}
                          </span>
                        )}
                      </div>

                      {/* Issue */}
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Issue</p>
                        <div className="bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
                          <p className="text-sm text-red-300">
                            {finding.issueText}
                          </p>
                        </div>
                      </div>

                      {/* Rule */}
                      {finding.rule && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">
                            Rule: {finding.rule.ruleCode} —{" "}
                            {finding.rule.title}
                          </p>
                        </div>
                      )}

                      {/* Explanation */}
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Why</p>
                        <p className="text-sm text-slate-300">
                          {finding.explanation}
                        </p>
                      </div>

                      {/* Suggestion */}
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          Suggested Fix
                        </p>
                        <div className="bg-green-500/5 border border-green-500/10 rounded-lg px-3 py-2">
                          <p className="text-sm text-green-300">
                            {finding.suggestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
