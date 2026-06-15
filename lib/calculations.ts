import { ASSUMPTION_DEFAULTS, type Profile } from "./types"

// P(1+r)^n + PMT * ((1+r)^n - 1) / r
// annualRate defaults to the profile's own assumption, then the global default.
export function calcProjectedSavings(profile: Profile, annualRate?: number): number {
  const rate = annualRate ?? profile.annual_return ?? ASSUMPTION_DEFAULTS.annual_return
  const n = (profile.retirement_age - profile.current_age) * 12
  const r = rate / 12
  const P = profile.current_savings
  const PMT = profile.monthly_contributions
  if (r === 0) return P + PMT * n // guard against divide-by-zero at 0% return
  return P * Math.pow(1 + r, n) + (PMT * (Math.pow(1 + r, n) - 1)) / r
}

// Total nest egg needed, in retirement-year dollars.
// 1. Inflate today's desired income and pension to the retirement year.
// 2. Multiply the monthly shortfall by 12 months * years_in_retirement.
export function calcRetirementGap(profile: Profile): number {
  const inflation = profile.inflation_rate ?? ASSUMPTION_DEFAULTS.inflation_rate
  const years = calcYearsToRetirement(profile)
  const yearsInRetirement = profile.years_in_retirement ?? ASSUMPTION_DEFAULTS.years_in_retirement

  const inflator = Math.pow(1 + inflation, years)
  const futureDesired = profile.desired_monthly_income * inflator
  const futurePension = profile.expected_pension * inflator

  return Math.max(0, (futureDesired - futurePension) * 12 * yearsInRetirement)
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
