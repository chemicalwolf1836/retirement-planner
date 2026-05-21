"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { Profile } from "@/lib/types"

function generateData(profile: Profile) {
  const years = profile.retirement_age - profile.current_age
  const PMT = profile.monthly_contributions * 12
  const P = profile.current_savings
  const targetFinal = (profile.desired_monthly_income - profile.expected_pension) * 12 * 20

  return Array.from({ length: years + 1 }, (_, i) => {
    const r = 0.07
    const projected = P * Math.pow(1 + r, i) + (PMT * (Math.pow(1 + r, i) - 1)) / r
    const target = P + ((targetFinal - P) * i) / years
    return {
      label: i === 0 ? "Now" : i % Math.ceil(years / 3) === 0 ? `${i}yr` : "",
      projected: Math.round(projected),
      target: Math.round(Math.max(0, target)),
    }
  })
}

const fmtY = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`

type Props = {
  accentColor?: string
  profile: Profile
}

export function SavingsChart({ accentColor = "#2563eb", profile }: Props) {
  const data = generateData(profile)

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={0} />
        <YAxis tickFormatter={fmtY} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={52} />
        <Tooltip
          formatter={(v: number, key: string) => [fmtY(v), key === "projected" ? "Projected" : "Target"]}
          contentStyle={{ borderRadius: 8, border: "1px solid #bfdbfe", background: "#eff6ff", fontSize: 12 }}
          labelFormatter={() => ""}
        />
        <Legend
          iconType="plainline"
          iconSize={20}
          formatter={(v) => (v === "projected" ? "Projected" : "Target")}
          wrapperStyle={{ fontSize: 12, color: "#64748b" }}
        />
        <Line type="monotone" dataKey="projected" stroke={accentColor} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="target" stroke="#93c5fd" strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
