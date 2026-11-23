"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { PenSquare, Loader2, Shield, Sparkles, AlertCircle, ImagePlus, X } from "lucide-react"

const contentTypes = [
  { value: "TEXT", label: "General Text" },
  { value: "EMAIL", label: "Email" },
  { value: "SOCIAL_POST", label: "Social Media Post" },
  { value: "ADVERTISEMENT", label: "Advertisement" },
  { value: "BLOG_POST", label: "Blog Post" },
  { value: "DOCUMENT", label: "Document" },
]

const SAMPLE_CONTENT = {
  title: "Q4 Product Launch Email",
  contentType: "EMAIL",
  body: `Dear users,

We are excited to announce our latest product update! Your feedback has been received and changes were made based on your suggestions.

Our platform now delivers 100% uptime, making it faster than CompetitorX and more reliable than any alternative on the market.

The new AI-powered RAG pipeline leverages our proprietary LLM orchestration layer to deliver real-time NLP insights.

We look forward to serving you better.

Best regards,
The BrandShield Team`,
}

export default function SubmitPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [contentType, setContentType] = useState("TEXT")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const loadSample = () => {
    setTitle(SAMPLE_CONTENT.title)
    setBody(SAMPLE_CONTENT.body)
    setContentType(SAMPLE_CONTENT.contentType)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2MB")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setImageUrl(reader.result as string)
      setError("")
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    setProgress("Creating content record...")

    try {
      setProgress(imageUrl ? "Reviewing text + image against brand rules..." : "Reviewing against brand rules...")

      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, contentType, imageUrl }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to submit content")
      }

      setProgress("Review complete! Redirecting...")
      const data = await res.json()
      router.push(`/dashboard/content/${data.id}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
      setProgress("")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in">
        <div className="relative">
          <Shield className="h-16 w-16 text-rose-500 animate-pulse" />
          <Loader2 className="h-8 w-8 text-rose-400 animate-spin absolute -bottom-1 -right-1" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-white">
            BrandShield AI is reviewing your content...
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {imageUrl ? "Checking text + image against all brand rules" : "Checking against all active brand rules"}
          </p>
          <p className="text-xs text-slate-500 mt-3 animate-pulse">{progress}</p>
        </div>
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-rose-500 rounded-full animate-pulse" style={{ width: "60%" }} />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <PenSquare className="h-6 w-6 text-rose-500" />
          <h1 className="text-2xl font-bold text-white">Submit Content</h1>
        </div>
        <button
          onClick={loadSample}
          className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700"
        >
          <Sparkles className="h-3.5 w-3.5 text-rose-400" /> Load Sample
        </button>
      </div>
      <p className="text-slate-400 mb-8">
        Submit content for brand compliance review
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Title
          </label>
          <input
            type="text"
            maxLength={160}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Q4 Product Launch Email"
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Content Type
          </label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm transition-shadow"
          >
            {contentTypes.map((ct) => (
              <option key={ct.value} value={ct.value}>
                {ct.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-slate-300">
              Content
            </label>
            <span className={`text-xs ${body.length > 5000 ? "text-red-400" : "text-slate-500"}`}>
              {body.length.toLocaleString()} chars
            </span>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            maxLength={20000}
            rows={10}
            placeholder="Paste or type your content here..."
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm resize-y transition-shadow"
          />
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Attach Image <span className="text-slate-500">(optional — for visual brand review)</span>
          </label>
          {imageUrl ? (
            <div className="relative inline-block">
              <img
                src={imageUrl}
                alt="Uploaded"
                className="max-h-40 rounded-lg border border-slate-700"
              />
              <button
                type="button"
                onClick={() => { setImageUrl(null); if (fileRef.current) fileRef.current.value = "" }}
                className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <p className="text-xs text-slate-500 mt-1.5">Image will be checked against brand colour palette</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full py-6 border-2 border-dashed border-slate-700 hover:border-rose-500/30 rounded-lg text-center transition-colors group"
            >
              <ImagePlus className="h-8 w-8 text-slate-600 group-hover:text-rose-400 mx-auto mb-2 transition-colors" />
              <p className="text-sm text-slate-400 group-hover:text-slate-300">
                Click to upload an image (PNG, JPG — max 2MB)
              </p>
              <p className="text-xs text-slate-500 mt-1">AI will check colours against your brand palette</p>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 animate-scale-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={!title.trim() || !body.trim() || body.length > 20000}
            className="px-6 py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 disabled:hover:bg-rose-500 text-white font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-rose-500/20"
          >
            Submit for Review
          </button>
          <p className="text-xs text-slate-500">
            AI review typically takes 10-20 seconds
          </p>
        </div>
      </form>
    </div>
  )
}
