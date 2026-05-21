"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts"
import type { Profile } from "@/lib/types"

function generateData(profile: Profile) {
  const years = profile.retirement_age - profile.current_age
  const PMT = profile.monthly_contributions * 12
  const P = profile.current_savings
  const step = Math.max(1, Math.floor(years / 6))

  return Array.from({ length: years + 1 }, (_, i) => {
    const project = (r: number) =>
      Math.round(P * Math.pow(1 + r, i) + (PMT * (Math.pow(1 + r, i) - 1)) / r)
    return {
      label: i === 0 ? "Now" : i % step === 0 || i === years ? `${i}yr` : "",
      conservative: project(0.04),
      moderate: project(0.07),
      aggressive: project(0.10),
    }
  })
}

const fmtY = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`

export function ScenariosChart({ profile }: { profile: Profile }) {
  const data = generateData(profile)
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={0} />
        <YAxis tickFormatter={fmtY} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={52} />
        <Tooltip
          formatter={(v, key) => [
            fmtY(Number(v)),
            key === "conservative" ? "Conservative 4%" : key === "moderate" ? "Moderate 7%" : "Aggressive 10%",
          ]}
          contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 12 }}
          labelFormatter={() => ""}
        />
        <Legend
          iconType="plainline"
          iconSize={20}
          formatter={(v) =>
            v === "conservative" ? "Conservative 4%" : v === "moderate" ? "Moderate 7%" : "Aggressive 10%"
          }
          wrapperStyle={{ fontSize: 12, color: "#64748b" }}
        />
        <Line type="monotone" dataKey="conservative" stroke="#f97316" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="moderate"     stroke="#2563eb" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="aggressive"   stroke="#059669" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
