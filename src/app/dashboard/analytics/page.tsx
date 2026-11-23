"use client"

import { useEffect, useState } from "react"
import {
  BarChart3,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface AnalyticsData {
  scoreTrend: { date: string; avgScore: number; count: number }[]
  mostViolatedRules: { ruleCode: string; title: string; category: string; severity: string; count: number }[]
  categoryBreakdown: { category: string; count: number }[]
  severityBreakdown: { severity: string; count: number }[]
  severityTrend: { week: string; CRITICAL: number; WARNING: number; SUGGESTION: number }[]
  statusBreakdown: { status: string; count: number }[]
  typeBreakdown: { type: string; count: number }[]
}

const CATEGORY_COLORS: Record<string, string> = {
  TONE: "#3b82f6",
  TERMINOLOGY: "#a855f7",
  FACTS: "#ef4444",
  MESSAGING: "#eab308",
  ACCESSIBILITY: "#22c55e",
  VISUAL: "#ec4899",
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "#ef4444",
  WARNING: "#eab308",
  SUGGESTION: "#3b82f6",
}

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "#22c55e",
  REJECTED: "#ef4444",
  UNDER_REVIEW: "#3b82f6",
  REVISION_REQUESTED: "#eab308",
  PENDING: "#64748b",
}

const STATUS_LABELS: Record<string, string> = {
  APPROVED: "Approved",
  REJECTED: "Rejected",
  UNDER_REVIEW: "Under Review",
  REVISION_REQUESTED: "Revision Req.",
  PENDING: "Pending",
}

const TYPE_LABELS: Record<string, string> = {
  TEXT: "Text",
  EMAIL: "Email",
  SOCIAL_POST: "Social",
  ADVERTISEMENT: "Ad",
  BLOG_POST: "Blog",
  DOCUMENT: "Doc",
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
        {title}
      </h3>
      {children}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm" style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => {
        if (!r.ok) throw new Error("Failed")
        return r.json()
      })
      .then(setData)
      .catch(() => setError("Failed to load analytics."))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-1">Analytics</h1>
        <p className="text-slate-400 mb-8">Brand governance trends and insights</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-slate-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
        <p className="text-slate-400">{error}</p>
      </div>
    )
  }

  const latestScore = data.scoreTrend.length > 0 ? data.scoreTrend[data.scoreTrend.length - 1].avgScore : null
  const prevScore = data.scoreTrend.length > 1 ? data.scoreTrend[data.scoreTrend.length - 2].avgScore : null
  const scoreDelta = latestScore !== null && prevScore !== null ? latestScore - prevScore : null
  const totalFindings = data.categoryBreakdown.reduce((s, c) => s + c.count, 0)
  const totalContent = data.statusBreakdown.reduce((s, c) => s + c.count, 0)
  const approvedCount = data.statusBreakdown.find((s) => s.status === "APPROVED")?.count || 0

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-1">
        <BarChart3 className="h-6 w-6 text-rose-500" />
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
      </div>
      <p className="text-slate-400 mb-8">Brand governance trends and insights</p>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <p className="text-sm text-slate-400">Avg Score (Latest)</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white">{latestScore ?? "—"}</p>
            {scoreDelta !== null && (
              <span className={`text-xs flex items-center gap-0.5 ${scoreDelta >= 0 ? "text-green-400" : "text-red-400"}`}>
                {scoreDelta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {scoreDelta >= 0 ? "+" : ""}{scoreDelta}
              </span>
            )}
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <p className="text-sm text-slate-400">Total Content</p>
          <p className="text-2xl font-bold text-white">{totalContent}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <p className="text-sm text-slate-400">Approval Rate</p>
          <p className="text-2xl font-bold text-green-400">
            {totalContent > 0 ? Math.round((approvedCount / totalContent) * 100) : 0}%
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <p className="text-sm text-slate-400">Total Findings</p>
          <p className="text-2xl font-bold text-rose-400">{totalFindings}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Score trend */}
        <ChartCard title="Compliance Score Trend">
          {data.scoreTrend.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="avgScore" name="Avg Score" stroke="#f43f5e" strokeWidth={2} dot={{ fill: "#f43f5e", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Severity trend */}
        <ChartCard title="Severity Trend (Weekly)">
          {data.severityTrend.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data.severityTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                <Area type="monotone" dataKey="CRITICAL" name="Critical" stackId="1" fill="#ef444450" stroke="#ef4444" />
                <Area type="monotone" dataKey="WARNING" name="Warning" stackId="1" fill="#eab30850" stroke="#eab308" />
                <Area type="monotone" dataKey="SUGGESTION" name="Suggestion" stackId="1" fill="#3b82f650" stroke="#3b82f6" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Most violated rules */}
        <ChartCard title="Most Violated Rules">
          {data.mostViolatedRules.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No violations yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.mostViolatedRules} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis type="category" dataKey="ruleCode" tick={{ fill: "#94a3b8", fontSize: 11 }} width={55} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Violations" radius={[0, 4, 4, 0]}>
                  {data.mostViolatedRules.map((entry, i) => (
                    <Cell key={i} fill={SEVERITY_COLORS[entry.severity] || "#64748b"} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Category breakdown */}
        <ChartCard title="Findings by Category">
          {data.categoryBreakdown.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No findings yet</p>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={data.categoryBreakdown}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {data.categoryBreakdown.map((entry, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[entry.category] || "#64748b"} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {data.categoryBreakdown.map((c) => (
                  <div key={c.category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[c.category] || "#64748b" }} />
                      <span className="text-slate-300">{c.category}</span>
                    </div>
                    <span className="text-slate-400 font-medium">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>

        {/* Content status distribution */}
        <ChartCard title="Content by Status">
          {data.statusBreakdown.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No content yet</p>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={data.statusBreakdown}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {data.statusBreakdown.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.status] || "#64748b"} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {data.statusBreakdown.map((s) => (
                  <div key={s.status} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.status] || "#64748b" }} />
                      <span className="text-slate-300">{STATUS_LABELS[s.status] || s.status}</span>
                    </div>
                    <span className="text-slate-400 font-medium">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>

        {/* Content type distribution */}
        <ChartCard title="Content by Type">
          {data.typeBreakdown.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No content yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.typeBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="type" tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => TYPE_LABELS[v] || v} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Items" fill="#f43f5e" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Most violated rules table */}
      {data.mostViolatedRules.length > 0 && (
        <ChartCard title="Rule Violation Details">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-2">Rule</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-2">Title</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-2">Category</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-2">Severity</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider pb-2">Violations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {data.mostViolatedRules.map((rule) => (
                  <tr key={rule.ruleCode}>
                    <td className="py-2 font-mono text-rose-400">{rule.ruleCode}</td>
                    <td className="py-2 text-slate-300">{rule.title}</td>
                    <td className="py-2">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[rule.category] + "30", color: CATEGORY_COLORS[rule.category] }}>
                        {rule.category}
                      </span>
                    </td>
                    <td className="py-2">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[rule.severity] + "30", color: SEVERITY_COLORS[rule.severity] }}>
                        {rule.severity}
                      </span>
                    </td>
                    <td className="py-2 text-right font-semibold text-white">{rule.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}
    </div>
  )
}
