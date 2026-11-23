"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Shield, ArrowRight, X, Sparkles } from "lucide-react"

const TOUR_STEPS = [
  {
    title: "Welcome to BrandShield",
    description: "Your AI-powered brand governance dashboard. Here you can see compliance stats, recent content, and findings at a glance.",
    page: "/dashboard",
    highlight: "h1",
  },
  {
    title: "Submit Content for Review",
    description: "Click here to submit any content — emails, ads, blogs, social posts. The AI will check it against all your brand rules and return findings in seconds.",
    page: "/dashboard",
    highlight: "a[href='/dashboard/submit']",
  },
  {
    title: "Browse Pre-loaded Content",
    description: "We've pre-loaded 20 pieces of content across all types and statuses. Click any item to see its review results, findings, and try the Auto-Fix feature.",
    page: "/dashboard",
    highlight: "a[href='/dashboard/content']",
  },
  {
    title: "View Analytics & Trends",
    description: "Track compliance trends over time, see which rules get violated most, and identify areas for improvement with interactive charts.",
    page: "/dashboard",
    highlight: "a[href='/dashboard/analytics']",
  },
  {
    title: "Try Auto-Fix",
    description: "Open any content with findings, then click the purple 'Auto-Fix All' button. It applies every suggested correction instantly and shows a before/after diff!",
    page: "/dashboard",
    highlight: null,
  },
]

const STORAGE_KEY = "brandshield_tour_completed"

export default function GuidedTour() {
  const [step, setStep] = useState(-1)
  const [visible, setVisible] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (typeof window === "undefined") return
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done && pathname === "/dashboard") {
      const timer = setTimeout(() => {
        setStep(0)
        setVisible(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [pathname])

  const dismiss = () => {
    setVisible(false)
    setStep(-1)
    localStorage.setItem(STORAGE_KEY, "true")
  }

  const next = () => {
    if (step >= TOUR_STEPS.length - 1) {
      dismiss()
      return
    }
    setStep(step + 1)
  }

  const resetTour = () => {
    localStorage.removeItem(STORAGE_KEY)
    setStep(0)
    setVisible(true)
    if (pathname !== "/dashboard") router.push("/dashboard")
  }

  if (!visible || step < 0) return null

  const current = TOUR_STEPS[step]

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={dismiss} />

      {/* Tour card */}
      <div className="fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md animate-scale-in">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-rose-500/10 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500/20 to-violet-500/20 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-rose-400" />
              <span className="text-sm font-medium text-rose-300">
                Step {step + 1} of {TOUR_STEPS.length}
              </span>
            </div>
            <button onClick={dismiss} className="text-slate-400 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <h3 className="text-lg font-bold text-white mb-2">{current.title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{current.description}</p>
          </div>

          {/* Progress bar */}
          <div className="px-6">
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-violet-500 rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / TOUR_STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={dismiss}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Skip tour
            </button>
            <button
              onClick={next}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {step >= TOUR_STEPS.length - 1 ? "Get Started" : "Next"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export function TourResetButton() {
  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY)
    window.location.href = "/dashboard"
  }

  return (
    <button
      onClick={handleReset}
      className="flex items-center gap-2 px-3 py-2 w-full text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
    >
      <Sparkles className="h-4 w-4" />
      Replay Tour
    </button>
  )
}
