export type Profile = {
  id: string
  current_age: number
  retirement_age: number
  current_savings: number
  monthly_income: number
  monthly_expenses: number
  monthly_contributions: number
  expected_pension: number
  desired_monthly_income: number
  // Planning assumptions — optional so existing rows (saved before these
  // columns existed) still load. Calculations fall back to ASSUMPTION_DEFAULTS.
  annual_return?: number
  inflation_rate?: number
  years_in_retirement?: number
}

// Defaults used wherever an assumption is missing from a profile. Mirrored by
// the Supabase column defaults so the DB and the app agree.
export const ASSUMPTION_DEFAULTS = {
  annual_return: 0.07,
  inflation_rate: 0.025,
  years_in_retirement: 25,
} as const

export type AIInsights = {
  readiness_score: number
  summary: string
  bull_case: string
  bear_case: string
  recommendations: string[]
  risk_level: "Low" | "Moderate" | "High" | "Critical"
  risk_summary: string
}
