"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Command, Search } from "lucide-react"

const commands = [
  ["Go to dashboard", "/dashboard"], ["Submit content", "/dashboard/submit"], ["Open content queue", "/dashboard/content"], ["View analytics", "/dashboard/analytics"], ["Manage brand rules", "/dashboard/rules"], ["Manage guidelines", "/dashboard/guidelines"],
]

export default function CommandPalette() {
  const [open, setOpen] = useState(false), [query, setQuery] = useState("")
  const router = useRouter()
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setOpen((value) => !value) }; if (event.key === "Escape") setOpen(false) }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey) }, [])
  if (!open) return null
  const matches = commands.filter(([label]) => label.toLowerCase().includes(query.toLowerCase()))
  return <div className="fixed inset-0 z-[80] bg-black/60 flex items-start justify-center pt-[15vh] px-4" onClick={() => setOpen(false)}><div onClick={(event) => event.stopPropagation()} className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"><div className="p-3 border-b border-slate-800 flex items-center gap-2"><Search className="h-5 w-5 text-slate-500" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search actions…" className="bg-transparent outline-none text-white placeholder-slate-500 flex-1" /><kbd className="text-xs text-slate-500 border border-slate-700 rounded px-1.5">Esc</kbd></div><div className="p-2">{matches.map(([label, href]) => <button key={href} onClick={() => { router.push(href); setOpen(false) }} className="w-full flex justify-between items-center px-3 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg text-left"><span>{label}</span><span className="text-xs text-slate-600">↵</span></button>)}{matches.length === 0 && <p className="p-4 text-sm text-slate-500 text-center">No matching action.</p>}</div></div></div>
}
