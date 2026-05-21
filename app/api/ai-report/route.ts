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
import type { Profile } from "@/lib/types"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
  "bull_case": "<1-2 sentences: what happens if returns average 9-10%>",
  "bear_case": "<1-2 sentences: what happens if returns average 4-5%>",
  "recommendations": ["<action 1>", "<action 2>", "<action 3>"]
}

Be specific with numbers. No markdown, no extra text — only the JSON object.`

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    const insights = JSON.parse(text)

    return NextResponse.json(insights)
  } catch (err) {
    console.error("AI report error:", err)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
