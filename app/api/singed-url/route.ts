// app/api/signed-url/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path')
  if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error('Missing Supabase env vars', { url: !!url, key: !!key })
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const { data, error } = await supabase.storage
    .from('analyses-pdfs')
    .createSignedUrl(path, 60 * 60 * 24)

  if (error || !data?.signedUrl) {
    console.error('Signed URL error:', error?.message, 'path:', path)
    return NextResponse.json({ error: error?.message ?? 'Failed' }, { status: 500 })
  }

  return NextResponse.json({ url: data.signedUrl })
}