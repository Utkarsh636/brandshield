"use client"

import { useState } from "react"
import { MessageSquare, History, Send, Reply, Loader2 } from "lucide-react"

type Comment = { id: string; body: string; createdAt: string; author: { name: string | null; email: string }; replies?: Comment[] }
type Version = { id: string; body: string; version: number; changedBy: string; changeNote: string | null; createdAt: string }

function diffSummary(newer: string, older: string) {
  const before = new Set(older.split(/\s+/))
  const after = new Set(newer.split(/\s+/))
  const added = Array.from(after).filter((word) => !before.has(word)).slice(0, 12)
  const removed = Array.from(before).filter((word) => !after.has(word)).slice(0, 12)
  return { added, removed }
}

export default function CollaborationPanel({ contentId, comments, versions, onChange }: { contentId: string; comments: Comment[]; versions: Version[]; onChange: () => void }) {
  const [body, setBody] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [error, setError] = useState("")

  const send = async () => {
    if (!body.trim() || loading) return
    setLoading(true); setError("")
    try {
      const res = await fetch(`/api/content/${contentId}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body, parentId: replyTo }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to add comment")
      setBody(""); setReplyTo(null); onChange()
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  return <div className="space-y-4">
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2"><MessageSquare className="h-4 w-4 text-rose-400" /> Team comments</h3>
        <span className="text-xs text-slate-500">{comments.length} thread{comments.length === 1 ? "" : "s"}</span>
      </div>
      <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
        {comments.length === 0 ? <p className="text-sm text-slate-500 py-3 text-center">No comments yet. Start the review conversation.</p> : comments.map((comment) => <div key={comment.id} className="text-sm">
          <div className="bg-slate-900/70 rounded-lg p-3"><p className="text-xs text-rose-300 mb-1">{comment.author.name || comment.author.email} <span className="text-slate-600">· {new Date(comment.createdAt).toLocaleString()}</span></p><p className="text-slate-300 whitespace-pre-wrap">{comment.body}</p><button onClick={() => { setReplyTo(comment.id); setBody("") }} className="mt-2 text-xs text-slate-500 hover:text-rose-300 flex items-center gap-1"><Reply className="h-3 w-3" /> Reply</button></div>
          {comment.replies?.map((reply) => <div key={reply.id} className="ml-5 mt-2 border-l border-slate-700 pl-3"><p className="text-xs text-rose-300 mb-1">{reply.author.name || reply.author.email} <span className="text-slate-600">· {new Date(reply.createdAt).toLocaleString()}</span></p><p className="text-slate-400 whitespace-pre-wrap">{reply.body}</p></div>)}
        </div>)}</div>
      {replyTo && <div className="text-xs text-rose-300 mb-2 flex justify-between">Replying to a comment <button onClick={() => setReplyTo(null)} className="text-slate-400">Cancel</button></div>}
      <textarea value={body} maxLength={2000} onChange={(e) => setBody(e.target.value)} placeholder="Leave a review comment…" rows={3} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none" />
      <div className="mt-2 flex justify-between items-center"><span className="text-xs text-slate-500">{body.length}/2,000</span><button disabled={!body.trim() || loading} onClick={send} className="px-3 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white text-sm font-medium rounded-lg flex items-center gap-1.5">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send</button></div>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>

    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
      <button onClick={() => setHistoryOpen(!historyOpen)} className="w-full flex items-center justify-between text-left"><span className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2"><History className="h-4 w-4 text-violet-400" /> Revision history</span><span className="text-xs text-slate-500">{versions.length} version{versions.length === 1 ? "" : "s"}</span></button>
      {historyOpen && <div className="mt-4 space-y-3">{versions.length === 0 ? <p className="text-sm text-slate-500">No versions have been saved yet.</p> : versions.map((version, index) => {
        const prior = versions[index + 1]
        const diff = prior ? diffSummary(version.body, prior.body) : null
        return <div key={version.id} className="rounded-lg bg-slate-900/70 p-3"><div className="flex justify-between gap-3"><p className="text-sm text-white font-medium">Version {version.version}</p><time className="text-xs text-slate-500">{new Date(version.createdAt).toLocaleString()}</time></div><p className="text-xs text-slate-400 mt-1">{version.changeNote || "Content updated"}</p>{diff && <div className="grid grid-cols-2 gap-2 mt-3 text-xs"><div className="bg-green-500/5 p-2 rounded text-green-300">+ {diff.added.length ? diff.added.join(" ") : "No added terms"}</div><div className="bg-red-500/5 p-2 rounded text-red-300">− {diff.removed.length ? diff.removed.join(" ") : "No removed terms"}</div></div>}<details className="mt-2"><summary className="text-xs text-slate-500 cursor-pointer">View snapshot</summary><p className="mt-2 text-xs leading-relaxed text-slate-400 whitespace-pre-wrap max-h-36 overflow-y-auto">{version.body}</p></details></div>
      })}</div>}
    </div>
  </div>
}
