import Link from "next/link"
import {
  TrendingUp, Sparkles, BarChart2, ShieldCheck,
  ArrowRight, CheckCircle2,
} from "lucide-react"

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Smart projections",
    body: "Compound interest calculations based on your real savings, contributions, and timeline — not generic estimates.",
  },
  {
    icon: Sparkles,
    title: "AI-powered insights",
    body: "Claude analyses your full financial picture and generates a personalised retirement report with specific action steps.",
  },
  {
    icon: BarChart2,
    title: "Scenario comparison",
    body: "See conservative (4%), moderate (7%), and aggressive (10%) return scenarios side by side so you can plan for any outcome.",
  },
]

const STEPS = [
  {
    n: "1",
    title: "Enter your details",
    body: "Add your current savings, income, monthly contributions, and retirement goals in the planner.",
  },
  {
    n: "2",
    title: "See your projections",
    body: "Get instant savings growth charts, readiness score, and a breakdown of your retirement outlook.",
  },
  {
    n: "3",
    title: "Get AI recommendations",
    body: "Claude generates a full retirement report with bull/bear analysis and personalised action items.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col">

      {/* Nav */}
      <header className="w-full bg-white/80 backdrop-blur-sm border-b border-slate-200/70 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#2563eb] flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-800 tracking-tight">RetireAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 rounded-lg bg-[#2563eb] text-white text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb] text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3 h-3" />
            Powered by Claude AI
          </div>
          <h1 className="text-5xl font-bold text-slate-900 tracking-tight leading-tight max-w-2xl mx-auto">
            Plan your retirement<br />
            <span className="text-[#2563eb]">with AI</span>
          </h1>
          <p className="mt-5 text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            Enter your financial details and get personalised projections, scenario analysis,
            and Claude-powered recommendations — all in one place.
          </p>
          <div className="mt-8 flex items-center gap-3 justify-center">
            <Link
              href="/auth/signup"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2563eb] text-white font-medium hover:bg-[#1d4ed8] transition-colors shadow-sm shadow-blue-200"
            >
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Sign in
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-400">No credit card required</p>
        </section>

        {/* Dashboard preview card */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden p-6">
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: "Projected savings", value: "$1.4M", accent: true },
                { label: "Monthly surplus",   value: "+$820",  accent: false },
                { label: "Years to retire",   value: "30 yrs", accent: false },
                { label: "Readiness score",   value: "74/100", accent: false },
              ].map(({ label, value, accent }) => (
                <div
                  key={label}
                  className={`rounded-xl p-4 ${accent ? "text-white" : "bg-[#f8fafc] border border-slate-100"}`}
                  style={accent ? { backgroundColor: "#2563eb" } : undefined}
                >
                  <p className={`text-xs font-medium ${accent ? "opacity-75" : "text-slate-400"}`}>{label}</p>
                  <p className={`text-2xl font-bold mt-1.5 tracking-tight ${accent ? "" : "text-slate-800"}`}
                     style={!accent ? { color: value.startsWith("+") ? "#2563eb" : undefined } : undefined}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-[#eff6ff] border border-[#bfdbfe] p-4">
              <p className="text-xs font-semibold text-[#1e3a8a] flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> AI recommendations
              </p>
              {[
                "Increase monthly contributions by $200 to close your pension gap.",
                "Build your emergency buffer to 6 months before increasing investments.",
              ].map((rec, i) => (
                <div key={i} className="flex items-start gap-2.5 mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2563eb] shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 text-center mb-8">
            Everything you need
          </p>
          <div className="grid grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white rounded-xl border border-slate-100 p-5">
                <div className="w-9 h-9 rounded-lg bg-[#eff6ff] flex items-center justify-center mb-4">
                  <Icon className="w-4 h-4 text-[#2563eb]" />
                </div>
                <p className="text-sm font-semibold text-slate-800 mb-1.5">{title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 text-center mb-8">
            How it works
          </p>
          <div className="grid grid-cols-3 gap-4">
            {STEPS.map(({ n, title, body }) => (
              <div key={n} className="relative bg-white rounded-xl border border-slate-100 p-5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mb-4"
                  style={{ backgroundColor: "#2563eb" }}
                >
                  {n}
                </div>
                <p className="text-sm font-semibold text-slate-800 mb-1.5">{title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#2563eb] flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-medium text-slate-500">RetireAI</span>
          </div>
          <p className="text-xs text-slate-400">Built with Next.js · Powered by Claude</p>
        </div>
      </footer>

    </div>
  )
}
