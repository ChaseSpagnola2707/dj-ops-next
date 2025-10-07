// lib/supabaseClient.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function supabase() {
  return createClientComponentClient()
}
