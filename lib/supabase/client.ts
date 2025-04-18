"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Create a single supabase client for the entire client-side application
export const createClient = () => {
  return createClientComponentClient()
}
