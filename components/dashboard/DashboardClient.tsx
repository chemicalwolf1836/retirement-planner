"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, AlertTriangle, Sparkles, TrendingUp, Loader2 } from "lucide-react"
import { DashboardLayout } from "./DashboardLayout"
import { supabase } from "@/lib/supabase"
import {
  calcProjectedSavings,
  calcReadinessScore,
  calcMonthlySurplus,
  calcYearsToRetirement,
  fmt,
} from "@/lib/calculations"
import type { Profile, AIInsights } from "@/lib/types"

const SavingsChart = dynamic(
  () => import("@/components/charts/SavingsChart").then((m) => ({ default: m.SavingsChart })),
  { ssr: false }
)

const READINESS_LABELS = [
  "Savings rate",
  "Pension coverage",
  "Investment growth",
  "Emergency buffer",
]

const READINESS_COLORS = ["#2563eb", "#f97316", "#2563eb", "#ef4444"]

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

// Each sub-score is derived from real inputs against a sensible target, so the
// four bars carry independent meaning rather than echoing the overall score.
function readinessBreakdown(profile: Profile): number[] {
  // Savings rate: contributions as a share of income, target 15%.
  const savingsRate = profile.monthly_income > 0
    ? (profile.monthly_contributions / profile.monthly_income) / 0.15 * 100
    : 0

  // Pension coverage: how much of desired income the pension already covers.
  const pensionCoverage = profile.desired_monthly_income > 0
    ? (profile.expected_pension / profile.desired_monthly_income) * 100
    : 0

  // Investment growth: share of the projected nest egg that comes from
  // compounding (i.e. not from the principal already saved or contributed).
  const months = calcYearsToRetirement(profile) * 12
  const projected = calcProjectedSavings(profile)
  const contributed = profile.current_savings + profile.monthly_contributions * months
  const investmentGrowth = projected > 0
    ? ((projected - contributed) / projected) * 100
    : 0

  // Emergency buffer: current savings against 6 months of expenses.
  const emergencyBuffer = profile.monthly_expenses > 0
    ? (profile.current_savings / (profile.monthly_expenses * 6)) * 100
    : 100

  return [savingsRate, pensionCoverage, investmentGrowth, emergencyBuffer].map(clamp)
}

export function DashboardClient() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [insights, setInsights] = useState<AIInsights | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingAI, setLoadingAI] = useState(false)
  const [aiError, setAiError] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      // Don't show the dashboard shell to a logged-out visitor — send them to login.
      if (!user) { router.replace("/auth/login"); return }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (data) {
        setProfile(data)
        fetchInsights(data)
      }
      setLoadingProfile(false)
    }
    load()
  }, [router])

  async function fetchInsights(p: Profile) {
    setLoadingAI(true)
    setAiError(false)
    try {
      const res = await fetch("/api/ai-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      })
      if (res.ok) {
        setInsights(await res.json())
      } else {
        setAiError(true)
      }
    } catch {
      setAiError(true)
    } finally {
      setLoadingAI(false)
    }
  }

  // Derived numbers
  const projected  = profile ? calcProjectedSavings(profile) : null
  const score      = profile ? (insights?.readiness_score ?? calcReadinessScore(profile)) : null
  const surplus    = profile ? calcMonthlySurplus(profile) : null
  const years      = profile ? calcYearsToRetirement(profile) : null
  const breakdown  = profile ? readinessBreakdown(profile) : [0, 0, 0, 0]

  const accentStyle = { backgroundColor: "var(--accent)" } as React.CSSProperties

  if (loadingProfile) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading dashboard">
          <div className="h-7 w-40 rounded bg-slate-100 dark:bg-slate-800" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl p-5 h-28 bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 rounded-xl h-56 bg-slate-100 dark:bg-slate-800" />
            <div className="rounded-xl h-56 bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // No profile yet — prompt user to fill planner
  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={accentStyle}>
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-white">No plan yet</p>
            <p className="text-xs text-slate-400 mt-1">Fill in your financial details to see your retirement projections</p>
          </div>
          <Link
            href="/dashboard/planner"
            className="px-5 py-2.5 rounded-lg text-white text-sm font-medium"
            style={accentStyle}
          >
            Set up my plan →
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Retirement at age {profile.retirement_age} · {years} years away
          </p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl p-5 text-white" style={accentStyle}>
            <p className="text-xs font-medium opacity-75">Projected savings</p>
            <p className="text-3xl font-bold mt-2 tracking-tight">{fmt(projected!)}</p>
            <p className="text-xs mt-2 opacity-60 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> At {profile.retirement_age}
            </p>
          </div>

          <div className="rounded-xl p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
            <p className="text-xs font-medium text-slate-400">Monthly surplus</p>
            <p className="text-3xl font-bold mt-2 tracking-tight" style={{ color: "var(--accent)" }}>
              {surplus! >= 0 ? "+" : ""}{fmt(surplus!)}
            </p>
            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: "var(--accent)" }}>
              <CheckCircle2 className="w-3 h-3" />
              {surplus! >= 0 ? "Above target" : "Below target"}
            </p>
          </div>

          <div className="rounded-xl p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
            <p className="text-xs font-medium text-slate-400">Years to retire</p>
            <p className="text-3xl font-bold mt-2 tracking-tight text-slate-800 dark:text-white">{years} yrs</p>
            <p className="text-xs mt-2 text-slate-300 dark:text-slate-500">Age {profile.current_age} now</p>
          </div>

          <div className="rounded-xl p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
            <p className="text-xs font-medium text-slate-400">Readiness score</p>
            <p className={`text-3xl font-bold mt-2 tracking-tight ${score! >= 75 ? "text-emerald-500" : score! >= 50 ? "text-amber-500" : "text-red-500"}`}>
              {score}/100
            </p>
            <p className={`text-xs mt-2 flex items-center gap-1 ${score! >= 75 ? "text-emerald-400" : "text-amber-400"}`}>
              <AlertTriangle className="w-3 h-3" />
              {score! >= 75 ? "On track" : score! >= 50 ? "Needs attention" : "At risk"}
            </p>
          </div>
        </div>

        {/* Chart + Readiness */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-5">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4">Savings projection</p>
            <SavingsChart accentColor="var(--accent)" profile={profile} />
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-5">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4">Readiness breakdown</p>
            <div className="space-y-4">
              {READINESS_LABELS.map((label, i) => (
                <div key={label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-slate-400">{label}</span>
                    <span className="text-xs font-semibold" style={{ color: READINESS_COLORS[i] }}>
                      {breakdown[i]}%
                    </span>
                  </div>
                  <div
                    className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-label={label}
                    aria-valuenow={breakdown[i]}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="h-full rounded-full" style={{ width: `${breakdown[i]}%`, backgroundColor: READINESS_COLORS[i] }} />
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

          {loadingAI ? (
            <div className="flex items-center gap-2 text-slate-400 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Generating insights…</span>
            </div>
          ) : insights ? (
            <div className="space-y-3">
              {insights.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5" style={accentStyle}>
                    {i + 1}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-100 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-2 py-1">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {aiError ? "Couldn't generate AI insights right now." : "No insights yet."}
              </p>
              <button
                type="button"
                onClick={() => fetchInsights(profile)}
                className="text-sm font-medium underline underline-offset-2"
                style={{ color: "var(--accent-dark)" }}
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
