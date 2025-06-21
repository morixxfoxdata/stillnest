'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp } from '@/lib/supabase/auth'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signUp(email, password, username)
      if (result.user) {
        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full space-y-8 p-6 text-center">
          <h2 className="text-3xl font-bold text-foreground">Check your email</h2>
          <p className="text-muted-foreground">
            We&apos;ve sent you a confirmation link. Please check your email to activate your account.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="text-primary hover:text-primary/80"
          >
            Return to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Join Stillnest
          </h2>
          <p className="mt-2 text-muted-foreground">
            Create your quiet photography space
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                placeholder="photographer123"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                ⚠️ Username cannot be changed after account creation. Choose carefully.
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Minimum 6 characters
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <div className="text-center">
            <a
              href="/auth/login"
              className="text-sm text-primary hover:text-primary/80"
            >
              Already have an account? Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}