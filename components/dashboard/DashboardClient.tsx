"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ClipboardList,
  GitCompare,
  FileText,
  TrendingUp,
  Moon,
  Sun,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react"

const SavingsChart = dynamic(
  () => import("@/components/charts/SavingsChart").then((m) => ({ default: m.SavingsChart })),
  { ssr: false }
)

const THEMES = [
  { name: "arctic",  accent: "#2563eb", soft: "#eff6ff", border: "#bfdbfe", dark: "#1e3a8a" },
  { name: "emerald", accent: "#059669", soft: "#ecfdf5", border: "#a7f3d0", dark: "#065f46" },
  { name: "violet",  accent: "#7c3aed", soft: "#f5f3ff", border: "#ddd6fe", dark: "#4c1d95" },
  { name: "amber",   accent: "#d97706", soft: "#fffbeb", border: "#fde68a", dark: "#92400e" },
  { name: "rose",    accent: "#e11d48", soft: "#fff1f2", border: "#fecdd3", dark: "#9f1239" },
]

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard",  href: "/dashboard" },
  { icon: ClipboardList,   label: "My plan",    href: "/dashboard/planner" },
  { icon: GitCompare,      label: "Scenarios",  href: "/dashboard/scenarios" },
  { icon: FileText,        label: "AI report",  href: "/dashboard/report" },
]

const READINESS = [
  { label: "Savings rate",      value: 82, color: "#2563eb" },
  { label: "Pension coverage",  value: 55, color: "#f97316" },
  { label: "Investment growth", value: 70, color: "#2563eb" },
  { label: "Emergency buffer",  value: 40, color: "#ef4444" },
]

const AI_RECS = [
  "Increase monthly contributions by $200 to close your pension gap and reach your $1.6M target by retirement.",
  "Your emergency buffer is below the recommended 6-month threshold — build it up before increasing investments.",
  "At a 7% annual return, you are on track. Consider a moderate-risk index fund to maintain this trajectory.",
]

export function DashboardClient() {
  const pathname = usePathname()
  const [isDark, setIsDark] = useState(false)
  const [theme, setTheme] = useState(THEMES[0])

  useEffect(() => {
    const savedDark = localStorage.getItem("rp_dark") === "true"
    const savedName = localStorage.getItem("rp_theme")
    if (savedDark) {
      setIsDark(true)
      document.documentElement.classList.add("dark")
    }
    const found = THEMES.find((t) => t.name === savedName)
    if (found) { setTheme(found); applyTheme(found) }
  }, [])

  function applyTheme(t: (typeof THEMES)[0]) {
    const r = document.documentElement
    r.style.setProperty("--accent", t.accent)
    r.style.setProperty("--accent-soft", t.soft)
    r.style.setProperty("--accent-border", t.border)
    r.style.setProperty("--accent-dark", t.dark)
  }

  function selectTheme(t: (typeof THEMES)[0]) {
    setTheme(t); applyTheme(t)
    localStorage.setItem("rp_theme", t.name)
  }

  function toggleDark() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("rp_dark", String(next))
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f1f5f9] dark:bg-[#0f172a]">

      {/* ── Sidebar ── */}
      <aside className="w-56 shrink-0 flex flex-col bg-[#f8fafc] dark:bg-[#1e293b] border-r border-slate-200/70 dark:border-slate-700/50">
        {/* Logo */}
        <div className="px-4 pt-5 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.accent }}>
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-white tracking-tight">RetireAI</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-0.5">
          {NAV.map(({ icon: Icon, label, href }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-700/40"
                }`}
                style={active ? { backgroundColor: theme.accent } : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Settings + User */}
        <div className="px-2 pb-4 pt-3 border-t border-slate-200/70 dark:border-slate-700/50 space-y-0.5">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-700/40 transition-colors">
            <Settings className="w-4 h-4 shrink-0" />
            Settings
          </button>
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: theme.accent }}>
              BM
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 dark:text-white truncate">Batmagnai</p>
              <p className="text-[11px] text-slate-400 truncate">Pro plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto px-6 pt-6 pb-16 space-y-4">

          {/* Header */}
          <div>
            <h1 className="text-xl font-semibold text-slate-800 dark:text-white">Dashboard</h1>
            <p className="text-sm text-slate-400 mt-0.5">Retirement at age 65 · 30 years away</p>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-xl p-5 text-white" style={{ backgroundColor: theme.accent }}>
              <p className="text-xs font-medium opacity-75">Projected savings</p>
              <p className="text-3xl font-bold mt-2 tracking-tight">$1.4M</p>
              <p className="text-xs mt-2 opacity-60 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> On track
              </p>
            </div>

            <div className="rounded-xl p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
              <p className="text-xs font-medium text-slate-400">Monthly surplus</p>
              <p className="text-3xl font-bold mt-2 tracking-tight" style={{ color: theme.accent }}>+$820</p>
              <p className="text-xs mt-2 flex items-center gap-1" style={{ color: theme.accent }}>
                <CheckCircle2 className="w-3 h-3" /> Above target
              </p>
            </div>

            <div className="rounded-xl p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
              <p className="text-xs font-medium text-slate-400">Years to retire</p>
              <p className="text-3xl font-bold mt-2 tracking-tight text-slate-800 dark:text-white">30 yrs</p>
              <p className="text-xs mt-2 text-slate-300 dark:text-slate-500">Age 35 now</p>
            </div>

            <div className="rounded-xl p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
              <p className="text-xs font-medium text-slate-400">Readiness score</p>
              <p className="text-3xl font-bold mt-2 tracking-tight text-amber-500">74/100</p>
              <p className="text-xs mt-2 text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Needs attention
              </p>
            </div>
          </div>

          {/* Chart + Readiness */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-5">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4">Savings projection</p>
              <SavingsChart accentColor={theme.accent} />
            </div>

            <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-5">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4">Readiness breakdown</p>
              <div className="space-y-4">
                {READINESS.map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs text-slate-400">{label}</span>
                      <span className="text-xs font-semibold" style={{ color }}>{value}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI recommendations */}
          <div
            className="rounded-xl border p-5"
            style={{
              backgroundColor: isDark ? `${theme.accent}18` : theme.soft,
              borderColor: isDark ? `${theme.accent}35` : theme.border,
            }}
          >
            <p className="text-sm font-semibold flex items-center gap-2 mb-4" style={{ color: isDark ? theme.accent : theme.dark }}>
              <Sparkles className="w-4 h-4" />
              AI recommendations
            </p>
            <div className="space-y-3">
              {AI_RECS.map((rec, i) => (
                <div key={i} className="flex gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                    style={{ backgroundColor: theme.accent }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-100">{rec}</p>
                </div>
              ))}
            </div>
          </div>

        </main>

        {/* ── Bottom bar ── */}
        <div className="fixed bottom-0 left-56 right-0 h-14 px-6 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200/70 dark:border-slate-700/50">
          <div className="flex items-center gap-2">
            {THEMES.map((t) => (
              <button
                key={t.name}
                onClick={() => selectTheme(t)}
                className={`h-4 w-7 rounded-full transition-all ${
                  theme.name === t.name ? "scale-105" : "opacity-40 hover:opacity-80 hover:scale-105"
                }`}
                style={{
                  backgroundColor: t.accent,
                  boxShadow: theme.name === t.name ? `0 0 0 2px white, 0 0 0 3.5px ${t.accent}` : "none",
                }}
                aria-label={`${t.name} theme`}
              />
            ))}
          </div>

          <button
            onClick={toggleDark}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105 bg-slate-900 dark:bg-white"
            aria-label="Toggle dark mode"
          >
            {isDark
              ? <Sun className="w-3.5 h-3.5 text-slate-900" />
              : <Moon className="w-3.5 h-3.5 text-white" />
            }
          </button>
        </div>
      </div>
    </div>
  )
}
