"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, CheckCircle2 } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { supabase } from "@/lib/supabase"

const schema = z.object({
  current_age:            z.coerce.number().min(18).max(80),
  retirement_age:         z.coerce.number().min(40).max(90),
  current_savings:        z.coerce.number().min(0),
  monthly_income:         z.coerce.number().min(0),
  monthly_expenses:       z.coerce.number().min(0),
  monthly_contributions:  z.coerce.number().min(0),
  expected_pension:       z.coerce.number().min(0),
  desired_monthly_income: z.coerce.number().min(0),
}).refine((d) => d.retirement_age > d.current_age, {
  message: "Retirement age must be greater than current age",
  path: ["retirement_age"],
})

type FormData = z.infer<typeof schema>

const SECTIONS = [
  {
    title: "Personal",
    fields: [
      { name: "current_age",    label: "Current age",    placeholder: "35",  prefix: "" },
      { name: "retirement_age", label: "Retirement age", placeholder: "65",  prefix: "" },
    ],
  },
  {
    title: "Finances",
    fields: [
      { name: "current_savings",       label: "Current savings",        placeholder: "50,000",  prefix: "$" },
      { name: "monthly_income",        label: "Monthly income",         placeholder: "5,000",   prefix: "$" },
      { name: "monthly_expenses",      label: "Monthly expenses",       placeholder: "3,500",   prefix: "$" },
      { name: "monthly_contributions", label: "Monthly contributions",  placeholder: "500",     prefix: "$" },
    ],
  },
  {
    title: "Pension",
    fields: [
      { name: "expected_pension", label: "Expected pension per month", placeholder: "800", prefix: "$" },
    ],
  },
  {
    title: "Retirement goal",
    fields: [
      { name: "desired_monthly_income", label: "Desired monthly income in retirement", placeholder: "4,000", prefix: "$" },
    ],
  },
] as const

export default function PlannerPage() {
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [serverError, setServerError] = useState("")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  // Load existing profile data
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (data) reset(data)
      setLoading(false)
    }
    load()
  }, [reset])

  async function onSubmit(data: FormData) {
    setServerError("")
    setSaved(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setServerError("Not signed in."); return }

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...data })

    if (error) { setServerError(error.message); return }

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-white">My plan</h1>
          <p className="text-sm text-slate-400 mt-0.5">Enter your financial details to generate accurate projections</p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 py-12 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading your plan…</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {SECTIONS.map((section) => (
              <div key={section.title} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50 p-5">
                <p className="text-sm font-semibold text-slate-700 dark:text-white mb-4">{section.title}</p>
                <div className="grid grid-cols-2 gap-4">
                  {section.fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                        {field.label}
                      </label>
                      <div className="relative">
                        {field.prefix && (
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                            {field.prefix}
                          </span>
                        )}
                        <input
                          {...register(field.name)}
                          type="number"
                          placeholder={field.placeholder}
                          className={`w-full py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                            field.prefix ? "pl-7 pr-3.5" : "px-3.5"
                          }`}
                          style={{ "--tw-ring-color": "color-mix(in srgb, var(--accent) 30%, transparent)" } as React.CSSProperties}
                        />
                      </div>
                      {errors[field.name] && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors[field.name]?.message as string}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {serverError && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                <p className="text-xs text-red-600">{serverError}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ backgroundColor: "var(--accent)" }}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? "Saving…" : "Save plan"}
              </button>

              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Saved
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  )
}
