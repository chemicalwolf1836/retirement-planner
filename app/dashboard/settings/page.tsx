"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, LogOut, Trash2, CheckCircle2 } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { supabase } from "@/lib/supabase"

export default function SettingsPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMessage, setPwMessage] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }
      setEmail(user.email ?? "")
      setLoading(false)
    }
    load()
  }, [router])

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPwMessage({ text: "Passwords don't match.", ok: false })
      return
    }
    if (newPassword.length < 6) {
      setPwMessage({ text: "Password must be at least 6 characters.", ok: false })
      return
    }
    setPwLoading(true)
    setPwMessage(null)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPwMessage({ text: error.message, ok: false })
    } else {
      setPwMessage({ text: "Password updated successfully.", ok: true })
      setNewPassword("")
      setConfirmPassword("")
    }
    setPwLoading(false)
  }

  return (
    <DashboardLayout>
      <div className="max-w-lg space-y-5">

        <div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-white">Settings</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage your account</p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 py-12 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : (
          <>
            {/* Account info */}
            <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-5">
              <p className="text-sm font-semibold text-slate-700 dark:text-white mb-4">Account</p>
              <div>
                <p className="text-xs font-medium text-slate-400 mb-1">Email</p>
                <p className="text-sm text-slate-700 dark:text-slate-200">{email}</p>
              </div>
            </div>

            {/* Change password */}
            <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-5">
              <p className="text-sm font-semibold text-slate-700 dark:text-white mb-4">Change password</p>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    New password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ "--tw-ring-color": "color-mix(in srgb, var(--accent) 30%, transparent)" } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ "--tw-ring-color": "color-mix(in srgb, var(--accent) 30%, transparent)" } as React.CSSProperties}
                  />
                </div>

                {pwMessage && (
                  <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${pwMessage.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                    {pwMessage.ok && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                    {pwMessage.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={pwLoading || !newPassword || !confirmPassword}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-medium transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  {pwLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {pwLoading ? "Updating…" : "Update password"}
                </button>
              </form>
            </div>

            {/* Sign out */}
            <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-5">
              <p className="text-sm font-semibold text-slate-700 dark:text-white mb-1">Sign out</p>
              <p className="text-xs text-slate-400 mb-4">You'll be returned to the login page.</p>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {signingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>

          </>
        )}
      </div>
    </DashboardLayout>
  )
}
