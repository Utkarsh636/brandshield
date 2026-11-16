import Link from "next/link"
import { Shield, Search, FileCheck, Users } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Brand Rule Engine",
    desc: "Parse guidelines into structured, versioned rules that your team can manage and evolve.",
  },
  {
    icon: Search,
    title: "AI Content Review",
    desc: "Automated checking of every piece of content against every active brand rule.",
  },
  {
    icon: FileCheck,
    title: "Explainable Results",
    desc: "Every flag links to the specific rule violated, with a suggested correction.",
  },
  {
    icon: Users,
    title: "Approval Workflow",
    desc: "Submit, review, approve \u2014 with full revision history and role-based control.",
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-rose-500" />
          <span className="font-bold text-lg text-white">BrandShield</span>
        </div>
        <Link
          href="/login"
          className="text-sm text-slate-300 hover:text-white transition-colors"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-6">
          <Shield className="h-3.5 w-3.5" />
          AI-Powered Brand Governance
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight leading-tight">
          Protect your brand<br />
          <span className="text-rose-500">before you publish</span>
        </h1>
        <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Review every piece of content against your brand guidelines before it
          goes live. Catch inconsistencies in tone, terminology, facts, and
          visuals — automatically.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg border border-slate-700 transition-colors"
          >
            View Dashboard
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-rose-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
