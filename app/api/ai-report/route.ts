import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import {
  calcProjectedSavings,
  calcRetirementGap,
  calcReadinessScore,
  calcMonthlySurplus,
  calcYearsToRetirement,
  fmt,
} from "@/lib/calculations"
import type { AIInsights, Profile } from "@/lib/types"

// maxRetries: SDK retries transient errors (429 / 5xx) with backoff.
// timeout: cap a single request so a hung call can't stall the dashboard.
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 2,
  timeout: 30_000,
})

const RISK_LEVELS = ["Low", "Moderate", "High", "Critical"]

// Narrow unknown JSON into AIInsights; returns null if it doesn't match the
// shape the UI relies on, so we never hand the client malformed data.
function parseInsights(raw: string): AIInsights | null {
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) return null
  let obj: unknown
  try {
    obj = JSON.parse(match[0])
  } catch {
    return null
  }
  if (typeof obj !== "object" || obj === null) return null
  const o = obj as Record<string, unknown>
  const ok =
    typeof o.readiness_score === "number" &&
    typeof o.summary === "string" &&
    typeof o.bull_case === "string" &&
    typeof o.bear_case === "string" &&
    Array.isArray(o.recommendations) &&
    o.recommendations.every((r) => typeof r === "string") &&
    typeof o.risk_level === "string" &&
    RISK_LEVELS.includes(o.risk_level) &&
    typeof o.risk_summary === "string"
  return ok ? (obj as AIInsights) : null
}

export async function POST(req: NextRequest) {
  try {
    const profile: Profile = await req.json()

    const projected = calcProjectedSavings(profile)
    const gap = calcRetirementGap(profile)
    const score = calcReadinessScore(profile)
    const surplus = calcMonthlySurplus(profile)
    const years = calcYearsToRetirement(profile)

    const prompt = `You are a retirement planning advisor. Analyze this retirement plan and return a JSON object.

User profile:
- Current age: ${profile.current_age}, Target retirement age: ${profile.retirement_age} (${years} years away)
- Current savings: ${fmt(profile.current_savings)}
- Monthly income: ${fmt(profile.monthly_income)}, expenses: ${fmt(profile.monthly_expenses)}, surplus: ${fmt(surplus)}
- Monthly contributions to retirement: ${fmt(profile.monthly_contributions)}
- Expected pension: ${fmt(profile.expected_pension)}/month
- Desired retirement income: ${fmt(profile.desired_monthly_income)}/month

Projections (at 7% annual return):
- Projected savings at retirement: ${fmt(projected)}
- Retirement gap needed: ${fmt(gap)}
- Readiness score: ${score}/100

Return ONLY a valid JSON object with these exact keys:
{
  "readiness_score": <number 0-100>,
  "summary": "<2-3 sentence plain English assessment of their retirement outlook>",
  "bull_case": "<2 sentences: what happens if returns average 9-10% — include a specific projected number>",
  "bear_case": "<2 sentences: what happens if returns average 4-5% — include a specific projected number>",
  "recommendations": ["<specific action 1 with numbers>", "<specific action 2 with numbers>", "<specific action 3 with numbers>"],
  "risk_level": "<one of: Low / Moderate / High / Critical>",
  "risk_summary": "<1-2 sentences explaining the main risk factor in their plan>"
}

Be specific with numbers. No markdown, no extra text — only the JSON object.`

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    })

    const block = message.content[0]
    const text = block && block.type === "text" ? block.text : ""
    const insights = parseInsights(text)

    if (!insights) {
      // The model replied but not in the shape we need — distinct from a 500.
      return NextResponse.json(
        { error: "Could not parse AI response" },
        { status: 422 },
      )
    }

    return NextResponse.json(insights)
  } catch (err) {
    console.error("AI report error:", err)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
