"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Shield,
  Info,
  AlertCircle,
  Clock,
  Wand2,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

const statusColors: Record<string, string> = {
  PENDING: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  UNDER_REVIEW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  APPROVED: "bg-green-500/20 text-green-400 border-green-500/30",
  REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
  REVISION_REQUESTED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
}

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REVISION_REQUESTED: "Revision Requested",
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
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState("")
  const [reviewLoading, setReviewLoading] = useState(false)
  const [toast, setToast] = useState("")
  const [fetchError, setFetchError] = useState("")

  // Auto-fix state
  const [fixLoading, setFixLoading] = useState(false)
  const [fixResult, setFixResult] = useState<any>(null)
  const [savingFix, setSavingFix] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchContent = useCallback(() => {
    setLoading(true)
    setFetchError("")
    fetch(`/api/content/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found")
        return r.json()
      })
      .then(setContent)
      .catch(() => setFetchError("Content not found or failed to load."))
      .finally(() => setLoading(false))
  }, [params.id])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 3000)
  }

  const updateStatus = async (status: string) => {
    setActionLoading(status)
    try {
      const res = await fetch(`/api/content/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        showToast(`Status updated to ${statusLabels[status] || status}`)
        fetchContent()
      }
    } catch {
      showToast("Failed to update status")
    }
    setActionLoading("")
  }

  const rerunReview = async () => {
    setReviewLoading(true)
    setFixResult(null)
    try {
      await fetch(`/api/content/${params.id}/review`, { method: "POST" })
      showToast("Review complete!")
      fetchContent()
    } catch {
      showToast("Review failed. Try again.")
    }
    setReviewLoading(false)
  }

  const autoFix = async () => {
    setFixLoading(true)
    try {
      const res = await fetch(`/api/content/${params.id}/fix`, { method: "POST" })
      if (!res.ok) throw new Error("Fix failed")
      const data = await res.json()
      setFixResult(data)
      showToast(`Applied ${data.appliedFixes} of ${data.totalFindings} fixes`)
    } catch {
      showToast("Auto-fix failed. Try again.")
    }
    setFixLoading(false)
  }

  const saveFixedContent = async () => {
    if (!fixResult?.fixedBody) return
    setSavingFix(true)
    try {
      await fetch(`/api/content/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: fixResult.fixedBody }),
      })
      setFixResult(null)
      showToast("Fixed content saved! Re-running review...")
      // Re-run review on the fixed content
      await fetch(`/api/content/${params.id}/review`, { method: "POST" })
      showToast("Review of fixed content complete!")
      fetchContent()
    } catch {
      showToast("Failed to save. Try again.")
    }
    setSavingFix(false)
  }

  const copyFixed = () => {
    if (!fixResult?.fixedBody) return
    navigator.clipboard.writeText(fixResult.fixedBody)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 animate-fade-in">
        <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
      </div>
    )
  }

  if (fetchError || !content) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <AlertCircle className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">{fetchError || "Content not found."}</p>
        <Link href="/dashboard/content" className="text-rose-400 hover:text-rose-300 text-sm mt-3 inline-block">
          Back to content queue
        </Link>
      </div>
    )
  }

  const latestReview = content.reviews?.[0]
  const findings = latestReview?.findings || []
  const score = latestReview?.overallScore
  const hasValidScore = score != null && score >= 0

  const scoreColor =
    !hasValidScore
      ? "text-slate-400"
      : score >= 80
        ? "text-green-400"
        : score >= 50
          ? "text-yellow-400"
          : "text-red-400"

  const scoreBg =
    !hasValidScore
      ? "bg-slate-800 border-slate-700"
      : score >= 80
        ? "bg-green-500/10 border-green-500/20"
        : score >= 50
          ? "bg-yellow-500/10 border-yellow-500/20"
          : "bg-red-500/10 border-red-500/20"

  const criticalCount = findings.filter((f: any) => f.severity === "CRITICAL").length
  const warningCount = findings.filter((f: any) => f.severity === "WARNING").length
  const suggestionCount = findings.filter((f: any) => f.severity === "SUGGESTION").length

  return (
    <div className="animate-fade-in">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white shadow-xl animate-slide-up">
          {toast}
        </div>
      )}

      {/* Back link */}
      <Link
        href="/dashboard/content"
        className="text-sm text-slate-400 hover:text-white flex items-center gap-1 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to queue
      </Link>

      {/* Auto-fix result panel */}
      {fixResult && fixResult.fixedBody !== content.body && (
        <div className="mb-6 bg-gradient-to-br from-green-500/5 to-slate-900 border border-green-500/20 rounded-xl p-6 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Auto-Fix Preview</h3>
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                {fixResult.appliedFixes}/{fixResult.totalFindings} fixes applied
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyFixed}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={() => setFixResult(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 rounded-lg transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Before / After */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-red-400 font-medium mb-2 uppercase tracking-wider">Original</p>
              <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                <p className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed">{fixResult.originalBody}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-green-400 font-medium mb-2 uppercase tracking-wider">Fixed</p>
              <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{fixResult.fixedBody}</p>
              </div>
            </div>
          </div>

          {/* Fix log */}
          {fixResult.fixLog && fixResult.fixLog.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wider">Changes Made</p>
              <div className="space-y-1.5">
                {fixResult.fixLog.map((log: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {log.applied ? (
                      <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                    )}
                    <span className={`${log.applied ? "text-red-400 line-through" : "text-slate-600"}`}>
                      {log.issueText}
                    </span>
                    {log.applied && (
                      <>
                        <ArrowRight className="h-3 w-3 text-slate-600 shrink-0" />
                        <span className="text-green-400">{log.suggestion}</span>
                      </>
                    )}
                    {!log.applied && (
                      <span className="text-slate-600 italic">(not found in text)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="flex items-center gap-3">
            <button
              onClick={saveFixedContent}
              disabled={savingFix}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded-lg transition-all flex items-center gap-2 text-sm"
            >
              {savingFix ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              {savingFix ? "Saving & re-reviewing..." : "Save Fixed Version & Re-review"}
            </button>
            <p className="text-xs text-slate-500">Replaces content body and runs a fresh AI review</p>
          </div>
        </div>
      )}

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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded">
                    {content.contentType.replace(/_/g, " ")}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border ${statusColors[content.status] || ""}`}
                  >
                    {statusLabels[content.status] || content.status}
                  </span>
                  {content.submitter?.name && (
                    <span className="text-xs text-slate-500">by {content.submitter.name}</span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(content.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4 max-h-[400px] overflow-y-auto">
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
              {/* Auto-fix button */}
              {findings.length > 0 && !fixResult && (
                <button
                  onClick={autoFix}
                  disabled={fixLoading}
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-violet-500/20"
                >
                  {fixLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  {fixLoading ? "Fixing..." : "Auto-Fix All"}
                </button>
              )}

              {[
                { status: "APPROVED", label: "Approve", icon: CheckCircle, cls: "bg-green-600 hover:bg-green-700" },
                { status: "REVISION_REQUESTED", label: "Request Revision", icon: AlertTriangle, cls: "bg-yellow-600 hover:bg-yellow-700" },
                { status: "REJECTED", label: "Reject", icon: XCircle, cls: "bg-red-600 hover:bg-red-700" },
              ].map((action) => (
                <button
                  key={action.status}
                  onClick={() => updateStatus(action.status)}
                  disabled={!!actionLoading || content.status === action.status}
                  className={`px-4 py-2 ${action.cls} disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2`}
                >
                  {actionLoading === action.status ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <action.icon className="h-4 w-4" />
                  )}
                  {action.label}
                </button>
              ))}
              <button
                onClick={rerunReview}
                disabled={reviewLoading}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
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
            {hasValidScore ? (
              <p className={`text-5xl font-bold ${scoreColor}`}>{score}</p>
            ) : (
              <p className="text-3xl font-bold text-slate-500">N/A</p>
            )}
            <p className="text-sm text-slate-400 mt-1">
              Brand Compliance Score
            </p>
            {latestReview?.summary && (
              <p className="text-sm text-slate-300 mt-3 leading-relaxed text-left">
                {latestReview.summary}
              </p>
            )}
          </div>

          {/* Findings summary mini-bar */}
          {findings.length > 0 && (
            <div className="flex gap-2">
              {criticalCount > 0 && (
                <div className="flex-1 text-center py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-lg font-bold text-red-400">{criticalCount}</p>
                  <p className="text-[10px] text-red-400/70 uppercase">Critical</p>
                </div>
              )}
              {warningCount > 0 && (
                <div className="flex-1 text-center py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-lg font-bold text-yellow-400">{warningCount}</p>
                  <p className="text-[10px] text-yellow-400/70 uppercase">Warning</p>
                </div>
              )}
              {suggestionCount > 0 && (
                <div className="flex-1 text-center py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-lg font-bold text-blue-400">{suggestionCount}</p>
                  <p className="text-[10px] text-blue-400/70 uppercase">Suggestion</p>
                </div>
              )}
            </div>
          )}

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
                      className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3 animate-slide-up"
                      style={{ animationDelay: `${idx * 50}ms`, animationFillMode: "both" }}
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
                          <span className="text-xs text-slate-500 font-mono">
                            {finding.rule.ruleCode}
                          </span>
                        )}
                      </div>

                      {/* Issue */}
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Flagged text</p>
                        <div className="bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
                          <p className="text-sm text-red-300 italic">
                            &ldquo;{finding.issueText}&rdquo;
                          </p>
                        </div>
                      </div>

                      {/* Explanation */}
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Why this is an issue</p>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {finding.explanation}
                        </p>
                      </div>

                      {/* Suggestion */}
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Suggested fix</p>
                        <div className="bg-green-500/5 border border-green-500/10 rounded-lg px-3 py-2">
                          <p className="text-sm text-green-300">
                            {finding.suggestion}
                          </p>
                        </div>
                      </div>

                      {/* Rule reference */}
                      {finding.rule && (
                        <p className="text-xs text-slate-600">
                          Rule {finding.rule.ruleCode}: {finding.rule.title}
                        </p>
                      )}
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
