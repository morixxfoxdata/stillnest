'use client'

import { useEffect, useState } from 'react'
import { performSecurityAudit, getSecurityScore, SecurityCheck } from '@/lib/security/audit'

export default function SecurityAuditPage() {
  const [checks, setChecks] = useState<SecurityCheck[]>([])
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState(0)

  useEffect(() => {
    const runAudit = async () => {
      try {
        const auditResults = await performSecurityAudit()
        setChecks(auditResults)
        setScore(getSecurityScore(auditResults))
      } catch (error) {
        console.error('Security audit failed:', error)
      } finally {
        setLoading(false)
      }
    }

    // Only run in development
    if (process.env.NODE_ENV === 'development') {
      runAudit()
    }
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Security audit is only available in development mode.</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'fail': return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  const getStatusIcon = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'pass':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      case 'fail':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Security Audit</h1>
          <p className="text-muted-foreground">
            Comprehensive security check for Stillnest application
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Running security audit...</span>
          </div>
        ) : (
          <>
            {/* Security Score */}
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Security Score</h2>
                  <p className="text-muted-foreground">Overall security assessment</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    <span className={score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                      {score}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'}
                  </p>
                </div>
              </div>
            </div>

            {/* Security Checks */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Security Checks</h2>
              {checks.map((check, index) => (
                <div key={index} className={`border rounded-lg p-4 ${getStatusColor(check.status)}`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(check.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{check.name}</h3>
                        <span className="text-xs uppercase font-semibold px-2 py-1 rounded">
                          {check.status}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{check.message}</p>
                      {check.details && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer">Details</summary>
                          <pre className="text-xs mt-1 bg-black/5 p-2 rounded overflow-auto">
                            {check.details}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Security Recommendations</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Ensure Row Level Security (RLS) is enabled on all sensitive tables</li>
                <li>• Use HTTPS in production environments</li>
                <li>• Regularly rotate API keys and secrets</li>
                <li>• Implement proper input validation and sanitization</li>
                <li>• Monitor and log security events</li>
                <li>• Keep dependencies up to date</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}