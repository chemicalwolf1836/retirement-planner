"use client"

import dynamic from "next/dynamic"
import { CheckCircle2, AlertTriangle, Sparkles, TrendingUp } from "lucide-react"
import { DashboardLayout } from "./DashboardLayout"

const SavingsChart = dynamic(
  () => import("@/components/charts/SavingsChart").then((m) => ({ default: m.SavingsChart })),
  { ssr: false }
)

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

// Accent colour is read from CSS variables at runtime, so these cards
// use inline style with the CSS variable rather than a hardcoded hex.
const accentStyle = { backgroundColor: "var(--accent)" } as React.CSSProperties

export function DashboardClient() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Retirement at age 65 · 30 years away</p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-xl p-5 text-white" style={accentStyle}>
            <p className="text-xs font-medium opacity-75">Projected savings</p>
            <p className="text-3xl font-bold mt-2 tracking-tight">$1.4M</p>
            <p className="text-xs mt-2 opacity-60 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> On track
            </p>
          </div>

          <div className="rounded-xl p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
            <p className="text-xs font-medium text-slate-400">Monthly surplus</p>
            <p className="text-3xl font-bold mt-2 tracking-tight" style={{ color: "var(--accent)" }}>+$820</p>
            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: "var(--accent)" }}>
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
            <SavingsChart accentColor="var(--accent)" />
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
          style={{ backgroundColor: "var(--accent-soft)", borderColor: "var(--accent-border)" }}
        >
          <p className="text-sm font-semibold flex items-center gap-2 mb-4" style={{ color: "var(--accent-dark)" }}>
            <Sparkles className="w-4 h-4" />
            AI recommendations
          </p>
          <div className="space-y-3">
            {AI_RECS.map((rec, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                  style={accentStyle}
                >
                  {i + 1}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-100 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
