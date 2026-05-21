import type { Profile } from "./types"

// P(1+r)^n + PMT * ((1+r)^n - 1) / r
export function calcProjectedSavings(profile: Profile, annualRate = 0.07): number {
  const n = (profile.retirement_age - profile.current_age) * 12
  const r = annualRate / 12
  const P = profile.current_savings
  const PMT = profile.monthly_contributions
  return P * Math.pow(1 + r, n) + (PMT * (Math.pow(1 + r, n) - 1)) / r
}

// Total nest egg needed: (desired - pension) * 12 months * 20 year retirement
export function calcRetirementGap(profile: Profile): number {
  return (profile.desired_monthly_income - profile.expected_pension) * 12 * 20
}

// (projected / gap) * 100, capped at 100
export function calcReadinessScore(profile: Profile): number {
  const projected = calcProjectedSavings(profile)
  const gap = calcRetirementGap(profile)
  if (gap <= 0) return 100
  return Math.min(100, Math.round((projected / gap) * 100))
}

export function calcMonthlySurplus(profile: Profile): number {
  return profile.monthly_income - profile.monthly_expenses - profile.monthly_contributions
}

export function calcYearsToRetirement(profile: Profile): number {
  return profile.retirement_age - profile.current_age
}

export function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${Math.round(n)}`
}
