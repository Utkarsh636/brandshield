"use client"

export default function Tooltip({
  children,
  text,
  position = "top",
}: {
  children: React.ReactNode
  text: string
  position?: "top" | "bottom" | "left" | "right"
}) {
  const posClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }

  return (
    <div className="relative group/tip inline-flex">
      {children}
      <div
        className={`absolute ${posClasses[position]} z-50 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 whitespace-nowrap opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity duration-200 shadow-lg max-w-xs`}
      >
        {text}
      </div>
    </div>
  )
}
