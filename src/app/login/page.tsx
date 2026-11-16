"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Shield, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      })

      setLoading(false)

      if (res?.error) {
        setError("Invalid email or password. Did you run: npm run db:seed?")
      } else if (res?.ok) {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      setLoading(false)
      setError("Connection error. Check your database connection.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
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
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
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
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
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

        <div className="mt-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
          <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">
            Demo Credentials
          </p>
          <div className="space-y-1 text-sm text-slate-400">
            <p>
              <span className="text-slate-500">Admin:</span>{" "}
              <code className="text-rose-400">admin@brandshield.com</code> /{" "}
              <code className="text-rose-400">admin123</code>
            </p>
            <p>
              <span className="text-slate-500">Creator:</span>{" "}
              <code className="text-rose-400">creator@brandshield.com</code> /{" "}
              <code className="text-rose-400">creator123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
