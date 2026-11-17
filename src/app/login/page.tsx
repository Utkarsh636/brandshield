"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Shield, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await doLogin(email, password)
  }

  const doLogin = async (em: string, pw: string) => {
    setError("")
    setLoading(true)

    try {
      const res = await signIn("credentials", {
        email: em,
        password: pw,
        redirect: false,
        callbackUrl: "/dashboard",
      })

      if (res?.error) {
        setError("Invalid email or password.")
        setLoading(false)
      } else if (res?.ok) {
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      setLoading(false)
      setError("Connection error. Is the database running?")
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-scale-in">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-6 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>

        <div className="flex items-center justify-center gap-2 mb-8">
          <Shield className="h-8 w-8 text-rose-500" />
          <span className="text-2xl font-bold text-white">BrandShield</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Sign in</h2>
          <p className="text-sm text-slate-400 mb-6">
            Enter your credentials to access the dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm transition-shadow"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm transition-shadow"
                placeholder={"••••••••"}
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 animate-scale-in">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-rose-500/20 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Quick demo login */}
        <div className="mt-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
          <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">
            Quick Demo Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => doLogin("admin@brandshield.com", "admin123")}
              disabled={loading}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg text-sm text-white transition-colors text-center border border-slate-700"
            >
              <span className="text-xs text-rose-400 block">Admin</span>
              admin@brandshield.com
            </button>
            <button
              onClick={() => doLogin("creator@brandshield.com", "creator123")}
              disabled={loading}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg text-sm text-white transition-colors text-center border border-slate-700"
            >
              <span className="text-xs text-rose-400 block">Creator</span>
              creator@brandshield.com
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
