import Link from "next/link"
import { Shield, Search, FileCheck, Users, ArrowRight, Zap, Lock, BarChart3 } from "lucide-react"

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
    desc: "Submit, review, approve — with full revision history and role-based control.",
  },
]

const steps = [
  { num: "01", icon: Lock, title: "Upload Guidelines", desc: "Paste your brand voice, tone, and terminology guidelines. AI structures them into actionable rules." },
  { num: "02", icon: Zap, title: "Submit Content", desc: "Drop in any draft — emails, ads, blog posts. The AI reviews it against every active rule in seconds." },
  { num: "03", icon: BarChart3, title: "Review & Approve", desc: "See exactly what violated which rule, why, and how to fix it. Then approve, revise, or reject." },
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
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="text-sm px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors font-medium"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-6 animate-fade-in">
          <Shield className="h-3.5 w-3.5" />
          AI-Powered Brand Governance
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight leading-tight animate-slide-up">
          Protect your brand<br />
          <span className="text-rose-500">before you publish</span>
        </h1>
        <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed animate-slide-up">
          Review every piece of content against your brand guidelines before it
          goes live. Catch inconsistencies in tone, terminology, facts, and
          messaging — automatically.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4 animate-slide-up">
          <Link
            href="/login"
            className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-rose-500/25 flex items-center gap-2"
          >
            Get Started <ArrowRight className="h-4 w-4" />
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
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/30 hover:bg-slate-900/80 transition-all duration-300 group animate-slide-up"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
            >
              <div className="h-10 w-10 rounded-lg bg-rose-500/10 group-hover:bg-rose-500/20 flex items-center justify-center mb-4 transition-colors">
                <f.icon className="h-5 w-5 text-rose-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-white text-center mb-2">How it works</h2>
        <p className="text-slate-400 text-center mb-12">Three steps to brand-compliant content</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.num} className="relative p-6 rounded-xl bg-slate-900/40 border border-slate-800">
              <span className="text-4xl font-bold text-rose-500/20 absolute top-4 right-5">{step.num}</span>
              <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center mb-4">
                <step.icon className="h-5 w-5 text-rose-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-rose-500" />
            <span className="font-semibold text-white">BrandShield</span>
          </div>
          <p className="text-sm text-slate-500">AI-powered brand governance. Built for hackathon demo.</p>
        </div>
      </footer>
    </div>
  )
}
