import { createClient as createClientBase } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export function createClient() {
  const cookieStore = cookies()

  return createClientBase(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )
}
