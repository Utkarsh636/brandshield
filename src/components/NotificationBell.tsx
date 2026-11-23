"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell, CheckCheck, Loader2 } from "lucide-react"

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const load = async () => { setLoading(true); try { const r = await fetch("/api/notifications"); if (r.ok) { const data = await r.json(); setItems(data.notifications); setUnread(data.unread) } } finally { setLoading(false) } }
  useEffect(() => { load() }, [])
  const markAll = async () => { await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) }); setUnread(0); setItems((prev) => prev.map((item) => ({ ...item, isRead: true }))) }
  return <div className="relative">
    <button aria-label="Notifications" onClick={() => { setOpen(!open); if (!open) load() }} className="relative text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800"><Bell className="h-5 w-5" />{unread > 0 && <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[10px] leading-4 text-white">{unread > 9 ? "9+" : unread}</span>}</button>
    {open && <div className="absolute bottom-11 left-0 w-80 max-w-[calc(100vw-2rem)] z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"><div className="flex justify-between items-center p-3 border-b border-slate-800"><p className="text-sm font-semibold text-white">Notifications</p><button onClick={markAll} className="text-xs text-rose-300 hover:text-rose-200 flex gap-1 items-center"><CheckCheck className="h-3.5 w-3.5" /> Mark all read</button></div><div className="max-h-80 overflow-y-auto">{loading ? <Loader2 className="h-5 w-5 animate-spin text-rose-400 m-6 mx-auto" /> : items.length === 0 ? <p className="p-5 text-center text-sm text-slate-500">You’re all caught up.</p> : items.map((item) => <Link onClick={() => setOpen(false)} href={item.contentId ? `/dashboard/content/${item.contentId}` : "/dashboard"} key={item.id} className={`block p-3 border-b border-slate-800/70 hover:bg-slate-800 ${item.isRead ? "" : "bg-rose-500/5"}`}><p className="text-sm text-slate-300">{item.message}</p><p className="text-xs text-slate-500 mt-1">{new Date(item.createdAt).toLocaleString()}</p></Link>)}</div></div>}
  </div>
}
