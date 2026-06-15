import { describe, it, expect } from "vitest"
import {
  calcProjectedSavings,
  calcRetirementGap,
  calcReadinessScore,
  calcMonthlySurplus,
  calcYearsToRetirement,
  fmt,
} from "./calculations"
import type { Profile } from "./types"

// A baseline profile; spread + override per test.
function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "test",
    current_age: 35,
    retirement_age: 65,
    current_savings: 50_000,
    monthly_income: 5_000,
    monthly_expenses: 3_500,
    monthly_contributions: 500,
    expected_pension: 0,
    desired_monthly_income: 4_000,
    ...overrides,
  }
}

describe("calcProjectedSavings", () => {
  it("computes future value of principal + monthly contributions", () => {
    // P=0, PMT=100, 12%/yr (1%/mo) for 12 months => 100 * ((1.01^12 - 1)/0.01)
    const p = profile({
      current_age: 64,
      retirement_age: 65,
      current_savings: 0,
      monthly_contributions: 100,
    })
    expect(calcProjectedSavings(p, 0.12)).toBeCloseTo(1268.25, 1)
  })

  it("handles a 0% return without dividing by zero", () => {
    const p = profile({
      current_age: 55,
      retirement_age: 65,
      current_savings: 1_000,
      monthly_contributions: 100,
    })
    // 1000 principal + 100 * 120 months, no growth
    expect(calcProjectedSavings(p, 0)).toBe(13_000)
  })

  it("uses the profile's own annual_return when no rate is passed", () => {
    const base = profile()
    const aggressive = profile({ annual_return: 0.10 })
    expect(calcProjectedSavings(aggressive)).toBeGreaterThan(calcProjectedSavings(base))
  })
})

describe("calcRetirementGap", () => {
  it("inflates the goal, so it exceeds the naive today's-dollar figure", () => {
    const p = profile({ desired_monthly_income: 4_000, expected_pension: 0 })
    const naive = 4_000 * 12 * 25 // old formula: today's dollars, 20->25yr
    expect(calcRetirementGap(p)).toBeGreaterThan(naive)
  })

  it("grows with a higher inflation assumption", () => {
    const low = profile({ inflation_rate: 0.02 })
    const high = profile({ inflation_rate: 0.05 })
    expect(calcRetirementGap(high)).toBeGreaterThan(calcRetirementGap(low))
  })

  it("never returns a negative gap when pension exceeds desired income", () => {
    const p = profile({ desired_monthly_income: 1_000, expected_pension: 5_000 })
    expect(calcRetirementGap(p)).toBe(0)
  })
})

describe("calcReadinessScore", () => {
  it("clamps to 100", () => {
    const p = profile({ current_savings: 5_000_000, desired_monthly_income: 1_000 })
    expect(calcReadinessScore(p)).toBeLessThanOrEqual(100)
  })

  it("returns 100 when there is no gap to fund", () => {
    const p = profile({ desired_monthly_income: 0, expected_pension: 0 })
    expect(calcReadinessScore(p)).toBe(100)
  })
})

describe("calcMonthlySurplus", () => {
  it("is income minus expenses minus contributions", () => {
    expect(calcMonthlySurplus(profile())).toBe(1_000) // 5000 - 3500 - 500
  })

  it("goes negative when outflows exceed income", () => {
    expect(calcMonthlySurplus(profile({ monthly_expenses: 4_800 }))).toBeLessThan(0)
  })
})

describe("calcYearsToRetirement", () => {
  it("is the age difference", () => {
    expect(calcYearsToRetirement(profile())).toBe(30)
  })

  it("is 0 when already at retirement age", () => {
    expect(calcYearsToRetirement(profile({ current_age: 65 }))).toBe(0)
  })
})

describe("fmt", () => {
  it("abbreviates millions and thousands", () => {
    expect(fmt(2_500_000)).toBe("$2.5M")
    expect(fmt(50_000)).toBe("$50K")
    expect(fmt(750)).toBe("$750")
  })
})
