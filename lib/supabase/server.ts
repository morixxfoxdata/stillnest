import { createBrowserClient } from '@supabase/ssr'

// Use browser client for all operations to avoid server component issues
export const createSupabaseServerClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Fallback client for client-side operations (same as above for consistency)
export const createSupabaseClientFallback = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}