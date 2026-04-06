'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AlertCircleIcon, CheckCircle2Icon } from 'lucide-react'
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

export default function LoginPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')

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
    })

    const data = await response.json()

    if (!response.ok || data?.error) {
      setAuthError(data?.error ?? 'Login failed. Please try again.')
      return
    }

    setAuthSuccess('Welcome back! Redirecting to found listings...')
    router.push('/found')
  }

  async function onSignupSubmit(values: SignupValues) {
    setAuthError('')
    setAuthSuccess('')

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: values.email, password: values.password }),
    })

    const data = await response.json()

    if (!response.ok || data?.error) {
      setAuthError(data?.error ?? 'Sign up failed. Please try again.')
      return
    }

    setAuthSuccess('Account created. You can now sign in.')
    loginForm.setValue('email', values.email)
    loginForm.setValue('password', '')
    setActiveTab('login')
    signupForm.reset({ email: values.email, password: '', confirmPassword: '' })
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,#fef9c3,transparent_38%),radial-gradient(circle_at_85%_20%,#bfdbfe,transparent_35%),linear-gradient(180deg,#fff8e1_0%,#fff_60%)] p-4">
      <div className="pointer-events-none absolute -left-20 top-16 h-44 w-44 rotate-12 rounded-3xl border-4 border-black/20 bg-[#fef08a]/60" />
      <div className="pointer-events-none absolute -bottom-20 right-10 h-56 w-56 -rotate-12 rounded-full border-4 border-black/20 bg-[#93c5fd]/60" />
      <Card className="w-full max-w-md border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-black tracking-tight">Campus Access</CardTitle>
          <CardDescription>
            Sign in or create an account to manage your lost and found posts.
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
                          <Input
                            type="password"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className="rounded-xl border-2 border-black"
                            {...field}
                          />
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
                          <Input
                            type="password"
                            autoComplete="new-password"
                            placeholder="At least 6 characters"
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
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            autoComplete="new-password"
                            placeholder="Repeat your password"
                            className="rounded-xl border-2 border-black"
                            {...field}
                          />
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
        <CardFooter className="flex flex-col gap-2 border-t-4 border-black/10 pt-6">
          <Button
            variant="outline"
            asChild
            className="w-full rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Link href="/found">Back to found items</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
