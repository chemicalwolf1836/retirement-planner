"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { supabase } from "@/lib/supabase"
import { calcProjectedSavings, calcRetirementGap, fmt } from "@/lib/calculations"
import type { Profile } from "@/lib/types"

const ScenariosChart = dynamic(
  () => import("@/components/charts/ScenariosChart").then((m) => ({ default: m.ScenariosChart })),
  { ssr: false }
)

const SCENARIOS = [
  {
    key: "conservative",
    label: "Conservative",
    rate: 0.04,
    pct: "4%",
    color: "#f97316",
    bg: "#fff7ed",
    border: "#fed7aa",
    dark: "#9a3412",
    icon: TrendingDown,
    description: "Lower risk, stable returns. Bonds and fixed income heavy.",
  },
  {
    key: "moderate",
    label: "Moderate",
    rate: 0.07,
    pct: "7%",
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    dark: "#1e3a8a",
    icon: Minus,
    description: "Balanced mix of stocks and bonds. Most common approach.",
  },
  {
    key: "aggressive",
    label: "Aggressive",
    rate: 0.10,
    pct: "10%",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    dark: "#065f46",
    icon: TrendingUp,
    description: "Higher risk, equity-focused. Greater upside and downside.",
  },
]

export default function ScenariosPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (data) setProfile(data)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-white">Scenarios</h1>
          <p className="text-sm text-slate-400 mt-0.5">Compare retirement outcomes across different return rates</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 gap-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : !profile ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-white">No plan yet</p>
            <p className="text-xs text-slate-400">Set up your plan first to see scenario projections</p>
            <Link href="/dashboard/planner" className="px-5 py-2.5 rounded-lg text-white text-sm font-medium bg-[#2563eb]">
              Set up my plan →
            </Link>
          </div>
        ) : (
          <>
            {/* 3 scenario cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SCENARIOS.map(({ key, label, rate, pct, color, bg, border, dark, icon: Icon, description }) => {
                const projected = calcProjectedSavings(profile, rate)
                const gap = calcRetirementGap(profile)
                const diff = projected - gap
                const onTrack = projected >= gap

                return (
                  <div key={key} className="rounded-xl border p-5 space-y-4" style={{ backgroundColor: bg, borderColor: border }}>
                    {/* Title row */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: dark }}>{label}</p>
                        <p className="text-xs mt-0.5" style={{ color }}>{description}</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: color }}>
                        {pct}
                      </span>
                    </div>

                    {/* Projected savings */}
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Projected at retirement</p>
                      <p className="text-3xl font-bold tracking-tight" style={{ color: dark }}>{fmt(projected)}</p>
                    </div>

                    {/* vs target */}
                    <div className="pt-3 border-t" style={{ borderColor: border }}>
                      <p className="text-xs text-slate-400 mb-1">vs retirement target ({fmt(gap)})</p>
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
                        <span className="text-sm font-semibold" style={{ color }}>
                          {onTrack ? "+" : ""}{fmt(Math.abs(diff))} {onTrack ? "surplus" : "shortfall"}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-2.5 h-1.5 bg-white/60 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (projected / gap) * 100)}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                      <p className="text-[11px] mt-1" style={{ color }}>
                        {Math.min(100, Math.round((projected / gap) * 100))}% funded
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Combined chart */}
            <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-5">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Growth comparison</p>
              <p className="text-xs text-slate-400 mb-4">All three scenarios over time</p>
              <ScenariosChart profile={profile} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
