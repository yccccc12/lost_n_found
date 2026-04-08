import { Suspense } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { LoginForm } from './login-form'

function LoginFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top_left,#fef9c3,transparent_38%),radial-gradient(circle_at_85%_20%,#bfdbfe,transparent_35%),linear-gradient(180deg,#fff8e1_0%,#fff_60%)] p-4">
      <div className="flex items-center gap-2 rounded-2xl border-4 border-black bg-white/90 px-6 py-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <Spinner className="h-6 w-6" />
        <span className="font-bold">Loading sign-in…</span>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  )
}
