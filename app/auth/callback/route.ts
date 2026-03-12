import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if profile exists and if onboarding is completed
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()

        if (!profile) {
          // Profile doesn't exist yet (trigger should create it, but just in case)
          await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            display_name:
              user.user_metadata?.display_name ||
              user.user_metadata?.full_name ||
              user.email?.split('@')[0] ||
              'User',
            avatar_url: user.user_metadata?.avatar_url || null,
          })
          return NextResponse.redirect(`${origin}/onboarding`)
        }

        if (!profile.onboarding_completed) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }

        return NextResponse.redirect(`${origin}${redirect}`)
      }
    }
  }

  // Auth error — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
