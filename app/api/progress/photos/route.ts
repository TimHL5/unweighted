import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { progressPhotoSchema } from '@/lib/validations/progress'
import { processGamification } from '@/lib/utils/gamification'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: photos, error } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ photos: photos || [] })
  } catch (error) {
    console.error('Progress photos GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = progressPhotoSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const data = parsed.data

    const { data: photo, error } = await supabase
      .from('progress_photos')
      .insert({
        user_id: user.id,
        image_url: data.image_url,
        photo_type: data.photo_type,
        log_date: data.log_date,
        weight_at_time: data.weight_at_time || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const gamification = await processGamification(supabase, user.id, {
      achievementCategories: ['progress'],
    }).catch(() => null)

    return NextResponse.json({ photo, gamification }, { status: 201 })
  } catch (error) {
    console.error('Progress photos POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
