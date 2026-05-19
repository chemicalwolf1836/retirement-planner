"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { TrendingUp, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type FormData = z.infer<typeof schema>

export default function SignupPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState("")
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setServerError("")
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })
    if (error) {
      setServerError(error.message)
      return
    }
    // If email confirmation is disabled, go straight to dashboard
    const { data: session } = await supabase.auth.getSession()
    if (session.session) {
      router.push("/dashboard")
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 justify-center mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#2563eb] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-800 tracking-tight">RetireAI</span>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-[#eff6ff] flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-5 h-5 text-[#2563eb]" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Check your email</h2>
            <p className="text-sm text-slate-400">
              We sent a confirmation link to your email. Click it to activate your account and sign in.
            </p>
            <Link
              href="/auth/login"
              className="inline-block mt-6 text-sm text-[#2563eb] font-medium hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-[#2563eb] flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-slate-800 tracking-tight">RetireAI</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-800 mb-1">Create an account</h1>
          <p className="text-sm text-slate-400 mb-6">Start planning your retirement today</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-colors"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Password
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-colors"
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Confirm password
              </label>
              <input
                {...register("confirmPassword")}
                type="password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-colors"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                <p className="text-xs text-red-600">{serverError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-[#2563eb] text-white text-sm font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-400 mt-5">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#2563eb] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
