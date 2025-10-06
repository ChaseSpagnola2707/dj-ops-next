import { cookies } from 'next/headers'
import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const supabaseServer = () => createServerComponentClient({ cookies })
export const supabaseRoute = (c = cookies()) => createRouteHandlerClient({ cookies: c })
