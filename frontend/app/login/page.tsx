'use client'

import { createClient } from '@/lib/supabase/client'
import { Chrome } from 'lucide-react'

export default function LoginPage() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] rounded-full bg-fuchsia-600/5 blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-xl relative z-10 text-center">
        <h1 className="mb-2 text-2xl font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
          Internship Hunter AI
        </h1>
        <p className="mb-8 text-sm text-slate-500">
          Sign in to upload your resume and get matched with top internships automatically.
        </p>
        <button
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 shadow-sm"
        >
          <Chrome className="h-5 w-5 text-indigo-600" />
          Continue with Google
        </button>
      </div>
    </div>
  )
}
