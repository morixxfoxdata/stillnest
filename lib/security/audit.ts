import { createSupabaseClient } from '@/lib/supabase/client'

export interface SecurityCheck {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: string
}

export async function performSecurityAudit(): Promise<SecurityCheck[]> {
  const checks: SecurityCheck[] = []
  const supabase = createSupabaseClient()

  // Check 1: RLS is enabled on tables
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('id')
      .limit(1)

    if (error && error.code === 'PGRST301') {
      checks.push({
        name: 'Photos Table RLS',
        status: 'pass',
        message: 'Row Level Security is properly configured',
        details: 'Photos table requires authentication'
      })
    } else if (data) {
      checks.push({
        name: 'Photos Table RLS',
        status: 'warning',
        message: 'Photos table may be publicly accessible',
        details: 'Check RLS policies for photos table'
      })
    }
  } catch (err) {
    checks.push({
      name: 'Photos Table RLS',
      status: 'fail',
      message: 'Cannot verify RLS status',
      details: String(err)
    })
  }

  // Check 2: Environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      checks.push({
        name: `Environment Variable: ${envVar}`,
        status: 'pass',
        message: 'Environment variable is set'
      })
    } else {
      checks.push({
        name: `Environment Variable: ${envVar}`,
        status: 'fail',
        message: 'Required environment variable is missing'
      })
    }
  }

  // Check 3: Authentication state
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      checks.push({
        name: 'Authentication Session',
        status: 'pass',
        message: 'Valid authentication session found'
      })
    } else {
      checks.push({
        name: 'Authentication Session',
        status: 'warning',
        message: 'No active authentication session'
      })
    }
  } catch (err) {
    checks.push({
      name: 'Authentication Session',
      status: 'fail',
      message: 'Cannot verify authentication state',
      details: String(err)
    })
  }

  // Check 4: HTTPS usage (client-side only)
  if (typeof window !== 'undefined') {
    if (window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
      checks.push({
        name: 'HTTPS Security',
        status: 'pass',
        message: 'Application is served over HTTPS or localhost'
      })
    } else {
      checks.push({
        name: 'HTTPS Security',
        status: 'fail',
        message: 'Application should be served over HTTPS in production'
      })
    }
  }

  return checks
}

export function getSecurityScore(checks: SecurityCheck[]): number {
  const totalChecks = checks.length
  if (totalChecks === 0) return 0

  const passedChecks = checks.filter(check => check.status === 'pass').length
  const warningChecks = checks.filter(check => check.status === 'warning').length
  
  // Pass = 1 point, Warning = 0.5 points, Fail = 0 points
  const score = (passedChecks + (warningChecks * 0.5)) / totalChecks
  return Math.round(score * 100)
}