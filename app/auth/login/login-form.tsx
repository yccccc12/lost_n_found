'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AlertCircleIcon, CheckCircle2Icon, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getSafeCallbackPath } from '@/lib/auth-callback'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

const signupSchema = z
  .object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type LoginValues = z.infer<typeof loginSchema>
type SignupValues = z.infer<typeof signupSchema>

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = getSafeCallbackPath(searchParams.get('callbackUrl'), '/')

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  async function onLoginSubmit(values: LoginValues) {
    setAuthError('')
    setAuthSuccess('')

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok || data?.error) {
      setAuthError(data?.error ?? 'Login failed. Please try again.')
      return
    }

    setAuthSuccess('Welcome back! Redirecting…')
    router.push(callbackUrl)
    router.refresh()
  }

  async function onSignupSubmit(values: SignupValues) {
    setAuthError('')
    setAuthSuccess('')

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: values.email, password: values.password }),
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok || data?.error) {
      setAuthError(data?.error ?? 'Sign up failed. Please try again.')
      return
    }

    setAuthSuccess('Account ready. Redirecting…')
    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,#fef9c3,transparent_38%),radial-gradient(circle_at_85%_20%,#bfdbfe,transparent_35%),linear-gradient(180deg,#fff8e1_0%,#fff_60%)] p-4">
      <div className="pointer-events-none absolute -left-20 top-16 h-44 w-44 rotate-12 rounded-3xl border-4 border-black/20 bg-[#fef08a]/60" />
      <div className="pointer-events-none absolute -bottom-20 right-10 h-56 w-56 -rotate-12 rounded-full border-4 border-black/20 bg-[#93c5fd]/60" />
      <Card className="w-full max-w-md border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-black tracking-tight">Campus Access</CardTitle>
          <CardDescription>
            Sign in with your campus account to open the portal. Listings, reports, and records are
            available after authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}>
            <TabsList className="relative mb-4 grid h-16 w-full grid-cols-2 rounded-full border-2 border-black/70 bg-[#e7dfbf] p-2">
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute left-2 top-2 z-10 h-[calc(100%-1rem)] w-[calc(50%-0.75rem)] rounded-full border-2 border-black bg-[#f2f2f2] shadow-[4px_2px_0_0_rgba(0,0,0,1)] transition-transform duration-300 ease-out ${
                  activeTab === 'login' ? 'translate-x-0' : 'translate-x-[calc(100%+0.5rem)]'
                }`}
              />
              <TabsTrigger
                value="login"
                className="relative z-20 rounded-full border-2 border-transparent bg-transparent text-base font-extrabold tracking-tight text-black/50 transition-colors data-[state=active]:bg-transparent data-[state=active]:text-black data-[state=active]:shadow-none"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="relative z-20 rounded-full border-2 border-transparent bg-transparent text-base font-extrabold tracking-tight text-black/50 transition-colors data-[state=active]:bg-transparent data-[state=active]:text-black data-[state=active]:shadow-none"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {authError ? (
              <Alert variant="destructive" className="mb-4 border-2 border-black">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertTitle>Authentication Error</AlertTitle>
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            ) : null}

            {authSuccess ? (
              <Alert className="mb-4 border-2 border-black bg-green-50">
                <CheckCircle2Icon className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{authSuccess}</AlertDescription>
              </Alert>
            ) : null}

            <TabsContent value="login" className="mt-0">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            autoComplete="email"
                            placeholder="you@school.edu"
                            className="rounded-xl border-2 border-black"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative flex items-center">
                            <Input
                              type={showLoginPassword ? 'text' : 'password'}
                              autoComplete="current-password"
                              placeholder="••••••••"
                              className="rounded-xl border-2 border-black pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              className="absolute right-3 text-gray-500 hover:text-black"
                            >
                              {showLoginPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={loginForm.formState.isSubmitting}
                    className="w-full rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-black hover:bg-black/90 text-white"
                  >
                    {loginForm.formState.isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <Spinner className="h-4 w-4" /> Signing in...
                      </span>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            autoComplete="email"
                            placeholder="you@school.edu"
                            className="rounded-xl border-2 border-black"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative flex items-center">
                            <Input
                              type={showSignupPassword ? 'text' : 'password'}
                              autoComplete="new-password"
                              placeholder="At least 6 characters"
                              className="rounded-xl border-2 border-black pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowSignupPassword(!showSignupPassword)}
                              className="absolute right-3 text-gray-500 hover:text-black"
                            >
                              {showSignupPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative flex items-center">
                            <Input
                              type={showConfirmPassword ? 'text' : 'password'}
                              autoComplete="new-password"
                              placeholder="Repeat your password"
                              className="rounded-xl border-2 border-black pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 text-gray-500 hover:text-black"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={signupForm.formState.isSubmitting}
                    className="w-full rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-[#0f172a] hover:bg-[#0f172a]/90 text-white"
                  >
                    {signupForm.formState.isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <Spinner className="h-4 w-4" /> Creating account...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
