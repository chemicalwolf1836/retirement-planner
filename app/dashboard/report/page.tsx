"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Loader2, Sparkles, TrendingUp, TrendingDown,
  ShieldCheck, ShieldAlert, RefreshCw, CheckCircle2,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { supabase } from "@/lib/supabase"
import { calcProjectedSavings, calcYearsToRetirement, fmt } from "@/lib/calculations"
import type { Profile, AIInsights } from "@/lib/types"

const RISK_CONFIG = {
  Low:      { color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", icon: ShieldCheck },
  Moderate: { color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: ShieldAlert },
  High:     { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", icon: ShieldAlert },
  Critical: { color: "#7f1d1d", bg: "#fef2f2", border: "#fca5a5", icon: ShieldAlert },
}

export default function ReportPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [insights, setInsights] = useState<AIInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: profileData } = await supabase
        .from("profiles").select("*").eq("id", user.id).single()

      if (!profileData) { setLoading(false); return }
      setProfile(profileData)

      // Load latest saved report
      const { data: reportData } = await supabase
        .from("ai_reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (reportData?.report_content) {
        try {
          setInsights(JSON.parse(reportData.report_content))
          setGeneratedAt(new Date(reportData.created_at))
        } catch {}
      }

      setLoading(false)
    }
    load()
  }, [])

  async function generateReport() {
    if (!profile) return
    setGenerating(true)
    setInsights(null)

    try {
      const res = await fetch("/api/ai-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })
      if (!res.ok) throw new Error("Failed")
      const data: AIInsights = await res.json()
      setInsights(data)
      setGeneratedAt(new Date())

      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("ai_reports").insert({
          user_id: user.id,
          report_content: JSON.stringify(data),
        })
      }
    } finally {
      setGenerating(false)
    }
  }

  const scoreColor = (s: number) =>
    s >= 75 ? "#059669" : s >= 50 ? "#d97706" : "#dc2626"

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800 dark:text-white">AI Report</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {generatedAt
                ? `Generated ${generatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                : "Full AI-powered retirement analysis"}
            </p>
          </div>
          {profile && (
            <button
              onClick={generateReport}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-opacity disabled:opacity-60"
              style={{ backgroundColor: "var(--accent)" }}
            >
              {generating
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <RefreshCw className="w-3.5 h-3.5" />
              }
              {generating ? "Generating…" : insights ? "Regenerate" : "Generate report"}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 gap-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : !profile ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-white">No plan yet</p>
            <p className="text-xs text-slate-400">Set up your financial details first</p>
            <Link href="/dashboard/planner" className="px-5 py-2.5 rounded-lg text-white text-sm font-medium bg-[#2563eb]">
              Set up my plan →
            </Link>
          </div>
        ) : !insights && !generating ? (
          /* No report yet */
          <div className="rounded-xl border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800 p-10 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--accent-soft)" }}>
              <Sparkles className="w-5 h-5" style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-white">No report generated yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Click &ldquo;Generate report&rdquo; above to get a full AI analysis of your retirement plan
              </p>
            </div>
          </div>
        ) : generating ? (
          <div className="rounded-xl border border-slate-100 bg-white p-10 flex flex-col items-center gap-3 text-center">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--accent)" }} />
            <p className="text-sm text-slate-500">Claude is analysing your retirement plan…</p>
          </div>
        ) : insights ? (
          <div className="space-y-4">

            {/* Readiness score */}
            <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-6 flex items-center gap-6">
              <div
                className="w-24 h-24 rounded-full flex flex-col items-center justify-center shrink-0 border-4"
                style={{ borderColor: scoreColor(insights.readiness_score) }}
              >
                <p className="text-2xl font-bold" style={{ color: scoreColor(insights.readiness_score) }}>
                  {insights.readiness_score}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">/ 100</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Readiness score</p>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{insights.summary}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                  <Sparkles className="w-3 h-3" />
                  Generated by Claude AI · Based on{" "}
                  {fmt(calcProjectedSavings(profile))} projected at age{" "}
                  {profile.retirement_age} ({calcYearsToRetirement(profile)} years)
                </div>
              </div>
            </div>

            {/* Bull & Bear */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Bull case</p>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full ml-auto">9–10% returns</span>
                </div>
                <p className="text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">{insights.bull_case}</p>
              </div>

              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <p className="text-sm font-semibold text-red-700 dark:text-red-300">Bear case</p>
                  <span className="text-[10px] bg-red-100 dark:bg-red-800/40 text-red-600 dark:text-red-300 px-2 py-0.5 rounded-full ml-auto">4–5% returns</span>
                </div>
                <p className="text-sm text-red-800 dark:text-red-200 leading-relaxed">{insights.bear_case}</p>
              </div>
            </div>

            {/* Action items */}
            <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-5">
              <p className="text-sm font-semibold text-slate-700 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" style={{ color: "var(--accent)" }} />
                Top 3 action items
              </p>
              <div className="space-y-3">
                {insights.recommendations.map((rec, i) => (
                  <div key={i} className="flex gap-3 pb-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0 last:pb-0">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      {i + 1}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk assessment */}
            {insights.risk_level && (() => {
              const cfg = RISK_CONFIG[insights.risk_level] ?? RISK_CONFIG.Moderate
              const Icon = cfg.icon
              return (
                <div className="rounded-xl border p-5" style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                    <p className="text-sm font-semibold" style={{ color: cfg.color }}>
                      Risk level: {insights.risk_level}
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: cfg.color }}>{insights.risk_summary}</p>
                </div>
              )
            })()}

          </div>
        ) : null}
      </div>
    </DashboardLayout>
  )
}
