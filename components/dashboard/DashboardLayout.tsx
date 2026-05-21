"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, ClipboardList, GitCompare, FileText,
  TrendingUp, Moon, Sun, Settings,
} from "lucide-react"

const THEMES = [
  { name: "arctic",  accent: "#2563eb", soft: "#eff6ff", border: "#bfdbfe", dark: "#1e3a8a" },
  { name: "emerald", accent: "#059669", soft: "#ecfdf5", border: "#a7f3d0", dark: "#065f46" },
  { name: "violet",  accent: "#7c3aed", soft: "#f5f3ff", border: "#ddd6fe", dark: "#4c1d95" },
  { name: "amber",   accent: "#d97706", soft: "#fffbeb", border: "#fde68a", dark: "#92400e" },
  { name: "rose",    accent: "#e11d48", soft: "#fff1f2", border: "#fecdd3", dark: "#9f1239" },
]

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: ClipboardList,   label: "My plan",   href: "/dashboard/planner" },
  { icon: GitCompare,      label: "Scenarios", href: "/dashboard/scenarios" },
  { icon: FileText,        label: "AI report", href: "/dashboard/report" },
]

export type Theme = (typeof THEMES)[0]

type Props = { children: React.ReactNode; userName?: string }

export function DashboardLayout({ children, userName = "Batmagnai" }: Props) {
  const pathname = usePathname()
  const [isDark, setIsDark] = useState(false)
  const [theme, setTheme] = useState(THEMES[0])

  useEffect(() => {
    const savedDark = localStorage.getItem("rp_dark") === "true"
    const savedName = localStorage.getItem("rp_theme")
    if (savedDark) { setIsDark(true); document.documentElement.classList.add("dark") }
    const found = THEMES.find((t) => t.name === savedName)
    if (found) { setTheme(found); applyTheme(found) }
  }, [])

  function applyTheme(t: Theme) {
    const r = document.documentElement
    r.style.setProperty("--accent", t.accent)
    r.style.setProperty("--accent-soft", t.soft)
    r.style.setProperty("--accent-border", t.border)
    r.style.setProperty("--accent-dark", t.dark)
  }

  function selectTheme(t: Theme) { setTheme(t); applyTheme(t); localStorage.setItem("rp_theme", t.name) }

  function toggleDark() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("rp_dark", String(next))
  }

  const initials = userName.slice(0, 2).toUpperCase()

  return (
    <div className="flex h-screen overflow-hidden bg-[#f1f5f9] dark:bg-[#0f172a]">

      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col bg-[#f8fafc] dark:bg-[#1e293b] border-r border-slate-200/70 dark:border-slate-700/50">
        <div className="px-4 pt-5 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.accent }}>
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-white tracking-tight">RetireAI</span>
          </div>
        </div>

        <nav className="flex-1 px-2 space-y-0.5">
          {NAV.map(({ icon: Icon, label, href }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "text-white" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-700/40"}`}
                style={active ? { backgroundColor: theme.accent } : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="px-2 pb-4 pt-3 border-t border-slate-200/70 dark:border-slate-700/50 space-y-0.5">
          <Link href="/dashboard/settings" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-700/40 transition-colors">
            <Settings className="w-4 h-4 shrink-0" />
            Settings
          </Link>
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: theme.accent }}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 dark:text-white truncate">{userName}</p>
              <p className="text-[11px] text-slate-400 truncate">Pro plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 bg-[#f8fafc] dark:bg-[#1e293b] border-b border-slate-200/70 dark:border-slate-700/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.accent }}>
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-white">RetireAI</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme dots */}
            <div className="flex items-center gap-1.5">
              {THEMES.map((t) => (
                <button key={t.name} onClick={() => selectTheme(t)}
                  className={`w-4 h-4 rounded-full transition-all ${theme.name === t.name ? "scale-110" : "opacity-40 hover:opacity-80"}`}
                  style={{ backgroundColor: t.accent, boxShadow: theme.name === t.name ? `0 0 0 1.5px white, 0 0 0 3px ${t.accent}` : "none" }}
                />
              ))}
            </div>
            <button onClick={toggleDark} className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-900 dark:bg-white ml-1">
              {isDark ? <Sun className="w-3.5 h-3.5 text-slate-900" /> : <Moon className="w-3.5 h-3.5 text-white" />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-6 pt-5 pb-24 md:pb-16">
          {children}
        </main>

        {/* Desktop bottom bar */}
        <div className="hidden md:flex fixed bottom-0 left-56 right-0 h-14 px-6 items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200/70 dark:border-slate-700/50">
          <div className="flex items-center gap-2">
            {THEMES.map((t) => (
              <button key={t.name} onClick={() => selectTheme(t)}
                className={`h-4 w-7 rounded-full transition-all ${theme.name === t.name ? "scale-105" : "opacity-40 hover:opacity-80 hover:scale-105"}`}
                style={{ backgroundColor: t.accent, boxShadow: theme.name === t.name ? `0 0 0 2px white, 0 0 0 3.5px ${t.accent}` : "none" }}
              />
            ))}
          </div>
          <button onClick={toggleDark} className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-900 dark:bg-white transition-all hover:scale-105">
            {isDark ? <Sun className="w-3.5 h-3.5 text-slate-900" /> : <Moon className="w-3.5 h-3.5 text-white" />}
          </button>
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-t border-slate-200/70 dark:border-slate-700/50">
          <div className="flex items-center justify-around px-2 py-2">
            {NAV.map(({ icon: Icon, label, href }) => {
              const active = pathname === href
              return (
                <Link key={href} href={href}
                  className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${active ? "" : "text-slate-400"}`}
                  style={active ? { color: theme.accent } : undefined}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
