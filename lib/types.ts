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
}

export type AIInsights = {
  readiness_score: number
  summary: string
  bull_case: string
  bear_case: string
  recommendations: string[]
  risk_level: "Low" | "Moderate" | "High" | "Critical"
  risk_summary: string
}
