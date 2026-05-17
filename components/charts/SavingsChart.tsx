"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

function generateData() {
  const P = 50000
  const PMT = 7200
  const r = 0.07
  const targetFinal = 1400000

  return Array.from({ length: 31 }, (_, i) => ({
    yr: i,
    label: i === 0 ? "Now" : i % 10 === 0 ? `${i}yr` : "",
    projected: Math.round(P * Math.pow(1 + r, i) + (PMT * (Math.pow(1 + r, i) - 1)) / r),
    target: Math.round(P + ((targetFinal - P) * i) / 30),
  }))
}

const data = generateData()

const fmt = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1000).toFixed(0)}K`

type Props = { accentColor?: string }

export function SavingsChart({ accentColor = "#2563eb" }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <YAxis
          tickFormatter={fmt}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          width={52}
          ticks={[0, 750000, 1500000]}
        />
        <Tooltip
          formatter={(v: number, key: string) => [fmt(v), key === "projected" ? "Projected" : "Target"]}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #bfdbfe",
            background: "#eff6ff",
            fontSize: 12,
          }}
          labelFormatter={() => ""}
        />
        <Legend
          iconType="plainline"
          iconSize={20}
          formatter={(v) => (v === "projected" ? "Projected" : "Target")}
          wrapperStyle={{ fontSize: 12, color: "#64748b" }}
        />
        <Line
          type="monotone"
          dataKey="projected"
          stroke={accentColor}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: accentColor }}
        />
        <Line
          type="monotone"
          dataKey="target"
          stroke="#93c5fd"
          strokeWidth={1.5}
          strokeDasharray="5 4"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
